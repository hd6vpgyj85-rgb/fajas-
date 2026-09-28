import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLoyalty, type PublicCustomer } from "../../context/LoyaltyContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import type { LoyaltyClaim } from "../../types";
import { buildLoyaltyClaimMessage } from "../../lib/whatsapp";
import { getWhatsAppUrl } from "../../data/store";
import { formatDate } from "../../lib/format";
import { uploadReviewImage } from "../../lib/imageUpload";
import { generateLoyaltyQrDataUrl } from "../../lib/loyaltyQr";
import "./FidelidadPage.css";

function CrownIcon() {
  return (
    <svg viewBox="0 0 48 48" width="44" height="44" fill="none" aria-hidden="true">
      <path
        d="M8 36h32l3-20-9.5 7L24 10l-9.5 13L5 16l3 20Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M9 41h30" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="24" cy="10" r="2.4" fill="currentColor" />
      <circle cx="5" cy="16" r="2.2" fill="currentColor" />
      <circle cx="43" cy="16" r="2.2" fill="currentColor" />
    </svg>
  );
}

export default function FidelidadPage() {
  const { token } = useParams<{ token: string }>();
  const { tiers, loading: tiersLoading, getCustomerByToken, getClaimsByToken, requestClaim, submitReview } = useLoyalty();
  const { settings } = useSiteSettings();

  const [customer, setCustomer] = useState<PublicCustomer | null | undefined>(undefined);
  const [claims, setClaims] = useState<LoyaltyClaim[]>([]);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const touchStartX = useRef<number | null>(null);

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
    if (token) generateLoyaltyQrDataUrl(token).then(setQrDataUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (customer === undefined || tiersLoading) {
    return (
      <div className="loyalty-page">
        <div className="loyalty-skeleton" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="loyalty-page loyalty-notfound">
        <div className="loyalty-notfound-card">
          <CrownIcon />
          <h1>No encontramos esta tarjeta</h1>
          <p>Puede que el link esté incompleto. Recupérala con tu WhatsApp y tu código de acceso.</p>
          <Link to="/mi-tarjeta" className="btn btn-primary">
            Recuperar mi tarjeta
          </Link>
          <Link to="/" className="loyalty-back loyalty-back-inline">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const sortedTiers = [...tiers].sort((a, b) => a.purchasesRequired - b.purchasesRequired);
  const currentLevel = sortedTiers.filter((t) => customer.purchasesCount >= t.purchasesRequired).length;
  const nextTier = sortedTiers.find((t) => customer.purchasesCount < t.purchasesRequired);
  const progress = nextTier
    ? Math.min(100, Math.round((customer.purchasesCount / nextTier.purchasesRequired) * 100))
    : 100;
  const remaining = nextTier ? nextTier.purchasesRequired - customer.purchasesCount : 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) setFlipped((v) => !v);
    touchStartX.current = null;
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(customer.accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

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
      <div className="loyalty-glow" aria-hidden="true" />

      <Link to="/" className="loyalty-back">
        ← Volver a la tienda
      </Link>

      <div
        className={`loyalty-flip ${flipped ? "is-flipped" : ""}`}
        onClick={() => setFlipped((v) => !v)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Ver tu nivel" : "Ver tu código de acceso"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((v) => !v);
          }
        }}
      >
        <div className="loyalty-flip-inner">
          <div className="loyalty-face loyalty-face-front">
            <span className="loyalty-brand">{settings.businessName}</span>
            <div className="loyalty-crown">
              <CrownIcon />
            </div>
            <h1 className="loyalty-name">{customer.name}</h1>
            <p className="loyalty-level">
              Nivel {currentLevel} · {customer.purchasesCount} {customer.purchasesCount === 1 ? "compra" : "compras"}
            </p>

            <div className="loyalty-progress">
              <div className="loyalty-progress-bar">
                <div className="loyalty-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span>
                {nextTier
                  ? `${remaining} ${remaining === 1 ? "compra" : "compras"} para tu siguiente nivel`
                  : "¡Alcanzaste el nivel máximo!"}
              </span>
            </div>

            <div className="loyalty-tracker">
              {sortedTiers.map((tier, i) => {
                const reached = customer.purchasesCount >= tier.purchasesRequired;
                return (
                  <div className="loyalty-tracker-step" key={tier.id}>
                    <div
                      className={`loyalty-tracker-dot ${reached ? "is-reached" : ""}`}
                      style={{ animationDelay: `${0.5 + i * 0.12}s` }}
                    >
                      {reached ? "✓" : i + 1}
                    </div>
                    {i < sortedTiers.length - 1 && (
                      <div className={`loyalty-tracker-line ${reached ? "is-reached" : ""}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="loyalty-face loyalty-face-back">
            <span className="loyalty-back-title">Tu código de acceso</span>
            <div className="loyalty-qr">
              {qrDataUrl ? <img src={qrDataUrl} alt="Código QR de tu tarjeta" /> : <div className="loyalty-qr-placeholder" />}
            </div>
            <button type="button" className="loyalty-code" onClick={handleCopyCode} aria-label="Copiar código">
              {customer.accessCode}
            </button>
            <span className="loyalty-code-hint">{copied ? "¡Código copiado!" : "Toca el código para copiarlo"}</span>
            <p className="loyalty-back-text">
              Entra con tu WhatsApp y este código desde <strong>Mi tarjeta</strong> en la tienda si pierdes este link.
            </p>
          </div>
        </div>
      </div>

      <p className="loyalty-flip-hint">
        {flipped ? "← Toca o desliza para volver" : "Toca o desliza la tarjeta para ver tu código →"}
      </p>

      <section className="loyalty-section">
        <h2>Recompensas</h2>
        <div className="loyalty-rewards">
          {sortedTiers.map((tier, i) => {
            const unlocked = customer.purchasesCount >= tier.purchasesRequired;
            const claim = claims.find((c) => c.tierId === tier.id);

            return (
              <div
                className={`loyalty-reward ${unlocked ? "is-unlocked" : "is-locked"}`}
                key={tier.id}
                style={{ animationDelay: `${0.15 + i * 0.08}s` }}
              >
                <div className="loyalty-reward-info">
                  <strong>
                    {tier.purchasesRequired} {tier.purchasesRequired === 1 ? "compra" : "compras"}
                  </strong>
                  <p>{tier.rewardDescription}</p>
                </div>

                {!unlocked && <span className="loyalty-reward-status">Bloqueado</span>}
                {unlocked && !claim && (
                  <button
                    className="btn btn-primary loyalty-reward-btn"
                    disabled={requesting === tier.id}
                    onClick={() => handleClaim(tier.id)}
                  >
                    {requesting === tier.id ? "…" : "Reclamar"}
                  </button>
                )}
                {unlocked && claim && !claim.claimed && (
                  <span className="loyalty-reward-status is-pending">
                    Pendiente
                    <small>desde {formatDate(claim.requestedAt)}</small>
                  </span>
                )}
                {unlocked && claim?.claimed && (
                  <span className="loyalty-reward-status is-claimed">
                    ¡Reclamado!
                    {claim.couponCode && <small>Cupón: {claim.couponCode}</small>}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="loyalty-section">
        <h2>Tus reseñas</h2>

        <div className="loyalty-review-guide">
          <p className="loyalty-review-guide-title">¿Cómo dejar tu reseña?</p>
          <ol>
            <li>Cada compra te da derecho a 1 reseña — la ves reflejada aquí abajo.</li>
            <li>Ponle tus estrellas y cuéntanos cómo te fue con tu pedido.</li>
            <li>Si quieres, agrega una foto de tu producto.</li>
            <li>Envíala: la revisamos y la publicamos en el sitio en cuanto la aprobemos 💗</li>
          </ol>
        </div>

        <div className="loyalty-reviews">
          <div className="loyalty-reviews-count">
            <span className="loyalty-reviews-number">{customer.availableReviews}</span>
            <p>
              {customer.availableReviews > 0
                ? `${customer.availableReviews === 1 ? "reseña disponible" : "reseñas disponibles"}. Cada compra te da derecho a una.`
                : "reseñas disponibles. Tu próxima compra te dará derecho a una."}
            </p>
          </div>

          {reviewSent && <p className="loyalty-review-success">¡Gracias por tu reseña! La revisaremos pronto 💗</p>}

          {customer.availableReviews > 0 && (
            <form className="loyalty-review-form" onSubmit={handleSubmitReview}>
              <input placeholder="Tu nombre" value={reviewName} onChange={(e) => setReviewName(e.target.value)} required />
              <div className="loyalty-review-stars" role="radiogroup" aria-label="Calificación">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={value <= reviewRating ? "is-active" : ""}
                    onClick={() => setReviewRating(value)}
                    aria-label={`${value} estrellas`}
                    aria-checked={value === reviewRating}
                    role="radio"
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Cuéntanos cómo te fue con tu compra"
                value={reviewQuote}
                onChange={(e) => setReviewQuote(e.target.value)}
                required
              />
              <label className="loyalty-review-file">
                <input type="file" accept="image/*" onChange={(e) => setReviewImageFile(e.target.files?.[0] ?? null)} />
                <span>{reviewImageFile ? `📷 ${reviewImageFile.name}` : "📷 Agregar foto (opcional)"}</span>
              </label>

              {reviewError && <p className="loyalty-review-error">{reviewError}</p>}

              <button className="btn btn-primary btn-block" type="submit" disabled={reviewSubmitting}>
                {reviewSubmitting ? "Enviando…" : "Enviar reseña"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
