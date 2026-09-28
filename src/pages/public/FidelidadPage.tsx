import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLoyalty, type PublicCustomer } from "../../context/LoyaltyContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import type { LoyaltyClaim } from "../../types";
import { buildLoyaltyClaimMessage } from "../../lib/whatsapp";
import { getWhatsAppUrl } from "../../data/store";
import { formatDate } from "../../lib/format";
import { uploadReviewImage } from "../../lib/imageUpload";
import LoadingSpinner from "../../components/LoadingSpinner";
import StarRating from "../../components/StarRating";
import "./FidelidadPage.css";

export default function FidelidadPage() {
  const { token } = useParams<{ token: string }>();
  const { tiers, loading: tiersLoading, getCustomerByToken, getClaimsByToken, requestClaim, submitReview } = useLoyalty();
  const { settings } = useSiteSettings();

  const [customer, setCustomer] = useState<PublicCustomer | null | undefined>(undefined);
  const [claims, setClaims] = useState<LoyaltyClaim[]>([]);
  const [requesting, setRequesting] = useState<string | null>(null);

  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewQuote, setReviewQuote] = useState("");
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSent, setReviewSent] = useState(false);

  const load = async () => {
    if (!token) return;
    const c = await getCustomerByToken(token);
    setCustomer(c);
    if (c) {
      setClaims(await getClaimsByToken(token));
      setReviewName((prev) => prev || c.name);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (customer === undefined || tiersLoading) return <LoadingSpinner />;

  if (!customer || tiers.length === 0) {
    return (
      <div className="loyalty-page loyalty-notfound">
        <p>No encontramos esta tarjeta de fidelidad.</p>
      </div>
    );
  }

  const sortedTiers = [...tiers].sort((a, b) => a.purchasesRequired - b.purchasesRequired);
  const reachedTiers = sortedTiers.filter((t) => customer.purchasesCount >= t.purchasesRequired);
  const currentLevel = reachedTiers.length;
  const nextTier = sortedTiers.find((t) => customer.purchasesCount < t.purchasesRequired);
  const progress = nextTier
    ? Math.min(100, Math.round((customer.purchasesCount / nextTier.purchasesRequired) * 100))
    : 100;

  const handleClaim = async (tierId: string) => {
    if (!token) return;
    setRequesting(tierId);
    try {
      await requestClaim(token, tierId);
      await load();
      const tier = sortedTiers.find((t) => t.id === tierId);
      if (tier) {
        window.open(
          getWhatsAppUrl(
            settings.whatsappNumber,
            buildLoyaltyClaimMessage(settings.businessName, customer.name, tier.rewardDescription)
          ),
          "_blank"
        );
      }
    } finally {
      setRequesting(null);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !reviewQuote.trim()) return;
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      let imageUrl: string | null = null;
      if (reviewImageFile) {
        imageUrl = await uploadReviewImage(reviewImageFile);
      }
      await submitReview(token, {
        name: reviewName.trim() || customer.name,
        rating: reviewRating,
        quote: reviewQuote.trim(),
        image: imageUrl,
      });
      setReviewQuote("");
      setReviewImageFile(null);
      setReviewRating(5);
      setReviewSent(true);
      await load();
      setTimeout(() => setReviewSent(false), 4000);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "No se pudo enviar tu reseña. Intenta de nuevo.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="loyalty-page">
      <div className="loyalty-card">
        <div className="loyalty-crown">👑</div>
        <h1>{customer.name}</h1>
        <p className="loyalty-level">
          Nivel {currentLevel} · {customer.purchasesCount} compras
        </p>

        {nextTier && (
          <div className="loyalty-progress">
            <div className="loyalty-progress-bar">
              <div className="loyalty-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span>
              {customer.purchasesCount} / {nextTier.purchasesRequired} para el siguiente nivel
            </span>
          </div>
        )}

        <div className="loyalty-tracker">
          {sortedTiers.map((tier, i) => {
            const reached = customer.purchasesCount >= tier.purchasesRequired;
            return (
              <div className="loyalty-tracker-step" key={tier.id}>
                <div className={`loyalty-tracker-dot ${reached ? "is-reached" : ""}`}>{reached ? "✓" : i + 1}</div>
                {i < sortedTiers.length - 1 && (
                  <div className={`loyalty-tracker-line ${reached ? "is-reached" : ""}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="loyalty-rewards">
        <h2>Recompensas</h2>
        {sortedTiers.map((tier) => {
          const unlocked = customer.purchasesCount >= tier.purchasesRequired;
          const claim = claims.find((c) => c.tierId === tier.id);

          return (
            <div className="loyalty-reward" key={tier.id}>
              <div>
                <strong>{tier.purchasesRequired} compras</strong>
                <p>{tier.rewardDescription}</p>
              </div>

              {!unlocked && <span className="loyalty-reward-status">Bloqueado</span>}
              {unlocked && !claim && (
                <button className="btn btn-primary" disabled={requesting === tier.id} onClick={() => handleClaim(tier.id)}>
                  {requesting === tier.id ? "..." : "Reclamar recompensa"}
                </button>
              )}
              {unlocked && claim && !claim.claimed && (
                <span className="loyalty-reward-status loyalty-reward-pending">
                  Pendiente de confirmar ({formatDate(claim.requestedAt)})
                </span>
              )}
              {unlocked && claim?.claimed && (
                <span className="loyalty-reward-status loyalty-reward-claimed">
                  ¡Reclamado! {claim.couponCode ? `Cupón: ${claim.couponCode}` : ""}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="loyalty-reviews">
        <h2>Reseñas disponibles</h2>
        <p className="loyalty-reviews-count">
          {customer.availableReviews > 0
            ? `Tienes ${customer.availableReviews} reseña${customer.availableReviews > 1 ? "s" : ""} por escribir. Cada compra te da derecho a una.`
            : "No tienes reseñas disponibles por ahora. Tu próxima compra te dará derecho a una."}
        </p>

        {customer.availableReviews > 0 && (
          <form className="loyalty-review-form" onSubmit={handleSubmitReview}>
            <input
              placeholder="Tu nombre"
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              required
            />
            <div className="loyalty-review-rating">
              <StarRating rating={reviewRating} size={22} />
              <input
                type="range"
                min={1}
                max={5}
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
              />
            </div>
            <textarea
              placeholder="Cuéntanos tu experiencia"
              value={reviewQuote}
              onChange={(e) => setReviewQuote(e.target.value)}
              required
            />
            <input type="file" accept="image/*" onChange={(e) => setReviewImageFile(e.target.files?.[0] ?? null)} />

            {reviewError && <p className="loyalty-review-error">{reviewError}</p>}
            {reviewSent && <p className="loyalty-review-success">¡Gracias por tu reseña! La revisaremos pronto.</p>}

            <button className="btn btn-primary btn-block" type="submit" disabled={reviewSubmitting}>
              {reviewSubmitting ? "Enviando…" : "Enviar reseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
