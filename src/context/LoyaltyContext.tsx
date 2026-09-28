import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { LoyaltyClaim, LoyaltyClaimAdmin, LoyaltyTier } from "../types";

interface TierRow {
  id: string;
  purchases_required: number;
  reward_description: string;
  discount_percent: number | null;
  created_at: string;
}

function rowToTier(row: TierRow): LoyaltyTier {
  return {
    id: row.id,
    purchasesRequired: row.purchases_required,
    rewardDescription: row.reward_description,
    discountPercent: row.discount_percent,
    createdAt: row.created_at,
  };
}

export interface NewTierInput {
  purchasesRequired: number;
  rewardDescription: string;
  discountPercent?: number | null;
}

export interface PublicCustomer {
  id: string;
  name: string;
  purchasesCount: number;
  availableReviews: number;
  accessCode: string;
}

export interface CheckoutCustomer {
  id: string;
  token: string;
  accessCode: string;
}

export interface SubmitReviewInput {
  name: string;
  rating: number;
  quote: string;
  image?: string | null;
}

interface ClaimRow {
  tier_id: string;
  requested_at: string;
  claimed: boolean;
  claimed_at: string | null;
  coupon_code: string | null;
}

interface AdminClaimRow {
  id: string;
  customer_id: string;
  tier_id: string;
  requested_at: string;
  claimed: boolean;
  claimed_at: string | null;
  coupon_id: string | null;
}

interface LoyaltyContextValue {
  tiers: LoyaltyTier[];
  loading: boolean;
  refreshTiers: () => Promise<void>;
  createTier: (input: NewTierInput) => Promise<void>;
  updateTier: (id: string, input: NewTierInput) => Promise<void>;
  deleteTier: (id: string) => Promise<void>;
  getCustomerByToken: (token: string) => Promise<PublicCustomer | null>;
  getOrCreateCustomerForCheckout: (name: string, phone: string) => Promise<CheckoutCustomer>;
  findTokenByAccess: (phone: string, code: string) => Promise<string | null>;
  submitReview: (token: string, input: SubmitReviewInput) => Promise<void>;
  requestClaim: (token: string, tierId: string) => Promise<void>;
  getClaimsByToken: (token: string) => Promise<LoyaltyClaim[]>;
  getClaimsByCustomerId: (customerId: string) => Promise<LoyaltyClaimAdmin[]>;
  confirmClaim: (claimId: string) => Promise<void>;
  revertClaim: (claimId: string) => Promise<void>;
  pendingClaimCustomerIds: Set<string>;
  refreshPendingClaims: () => Promise<void>;
}

const LoyaltyContext = createContext<LoyaltyContextValue | null>(null);

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingClaimCustomerIds, setPendingClaimCustomerIds] = useState<Set<string>>(new Set());

  const refreshPendingClaims = useCallback(async () => {
    const { data, error } = await supabase.from("loyalty_claims").select("customer_id").eq("claimed", false);
    if (error) {
      console.error(error);
      return;
    }
    setPendingClaimCustomerIds(new Set((data as { customer_id: string }[]).map((row) => row.customer_id)));
  }, []);

  useEffect(() => {
    refreshPendingClaims();
  }, [refreshPendingClaims]);

  const refreshTiers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("loyalty_tiers")
      .select("*")
      .order("purchases_required", { ascending: true });
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setTiers((data as TierRow[]).map(rowToTier));
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshTiers();
  }, [refreshTiers]);

  const createTier = async (input: NewTierInput) => {
    const { error } = await supabase.from("loyalty_tiers").insert({
      purchases_required: input.purchasesRequired,
      reward_description: input.rewardDescription,
      discount_percent: input.discountPercent ?? null,
    });
    if (error) throw new Error(error.message);
    await refreshTiers();
  };

  const updateTier = async (id: string, input: NewTierInput) => {
    const { error } = await supabase
      .from("loyalty_tiers")
      .update({
        purchases_required: input.purchasesRequired,
        reward_description: input.rewardDescription,
        discount_percent: input.discountPercent ?? null,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await refreshTiers();
  };

  const deleteTier = async (id: string) => {
    const { error, count } = await supabase.from("loyalty_tiers").delete({ count: "exact" }).eq("id", id);
    if (error) throw new Error(error.message);
    if (!count) throw new Error("No se pudo eliminar el nivel (bloqueado por permisos)");
    await refreshTiers();
  };

  const getCustomerByToken = async (token: string): Promise<PublicCustomer | null> => {
    const { data, error } = await supabase.rpc("get_customer_by_token", { p_token: token }).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const row = data as {
      id: string;
      name: string;
      purchases_count: number;
      available_reviews: number;
      access_code: string;
    };
    return {
      id: row.id,
      name: row.name,
      purchasesCount: row.purchases_count,
      availableReviews: row.available_reviews,
      accessCode: row.access_code,
    };
  };

  const findTokenByAccess = async (phone: string, code: string) => {
    const { data, error } = await supabase.rpc("find_loyalty_token", { p_phone: phone, p_code: code });
    if (error) throw new Error(error.message);
    return (data as string | null) ?? null;
  };

  const submitReview = async (token: string, input: SubmitReviewInput) => {
    const { error } = await supabase.rpc("submit_customer_review", {
      p_token: token,
      p_name: input.name,
      p_rating: input.rating,
      p_quote: input.quote,
      p_image: input.image ?? null,
    });
    if (error) {
      if (error.message.includes("SIN_RESENAS_DISPONIBLES")) {
        throw new Error("Ya usaste todas tus reseñas disponibles. Vuelve cuando tengas una compra más.");
      }
      throw new Error(error.message);
    }
  };

  const getOrCreateCustomerForCheckout = async (name: string, phone: string): Promise<CheckoutCustomer> => {
    const { data, error } = await supabase
      .rpc("get_or_create_customer_for_checkout", { p_name: name, p_phone: phone })
      .single();
    if (error) throw new Error(error.message);
    const row = data as { id: string; token: string; access_code: string };
    return { id: row.id, token: row.token, accessCode: row.access_code };
  };

  const requestClaim = async (token: string, tierId: string) => {
    const { error } = await supabase.rpc("request_loyalty_claim", { p_token: token, p_tier_id: tierId });
    if (error) throw new Error(error.message);
    await refreshPendingClaims();
  };

  const getClaimsByToken = async (token: string): Promise<LoyaltyClaim[]> => {
    const { data, error } = await supabase.rpc("get_loyalty_claims_by_token", { p_token: token });
    if (error) throw new Error(error.message);
    return (data as ClaimRow[]).map((row) => ({
      tierId: row.tier_id,
      requestedAt: row.requested_at,
      claimed: row.claimed,
      claimedAt: row.claimed_at,
      couponCode: row.coupon_code,
    }));
  };

  const getClaimsByCustomerId = async (customerId: string): Promise<LoyaltyClaimAdmin[]> => {
    const { data, error } = await supabase.from("loyalty_claims").select("*").eq("customer_id", customerId);
    if (error) throw new Error(error.message);
    return (data as AdminClaimRow[]).map((row) => ({
      id: row.id,
      customerId: row.customer_id,
      tierId: row.tier_id,
      requestedAt: row.requested_at,
      claimed: row.claimed,
      claimedAt: row.claimed_at,
      couponCode: row.coupon_id,
    }));
  };

  const confirmClaim = async (claimId: string) => {
    const { error } = await supabase.rpc("confirm_loyalty_claim", { p_claim_id: claimId });
    if (error) throw new Error(error.message);
    await refreshPendingClaims();
  };

  const revertClaim = async (claimId: string) => {
    const { error } = await supabase.rpc("revert_loyalty_claim", { p_claim_id: claimId });
    if (error) throw new Error(error.message);
    await refreshPendingClaims();
  };

  return (
    <LoyaltyContext.Provider
      value={{
        tiers,
        loading,
        refreshTiers,
        createTier,
        updateTier,
        deleteTier,
        getCustomerByToken,
        getOrCreateCustomerForCheckout,
        findTokenByAccess,
        submitReview,
        requestClaim,
        getClaimsByToken,
        getClaimsByCustomerId,
        confirmClaim,
        revertClaim,
        pendingClaimCustomerIds,
        refreshPendingClaims,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error("useLoyalty debe usarse dentro de <LoyaltyProvider>");
  return ctx;
}
