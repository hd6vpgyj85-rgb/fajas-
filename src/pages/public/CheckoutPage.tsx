import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrdersContext";
import { useCoupons } from "../../context/CouponsContext";
import { useLoyalty } from "../../context/LoyaltyContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { formatPrice } from "../../lib/format";
import { buildCheckoutMessage } from "../../lib/whatsapp";
import { getWhatsAppUrl } from "../../data/store";
import { generateLoyaltyQrDataUrl, getLoyaltyCardUrl } from "../../lib/loyaltyQr";
import { notifyOwnerOfOrder } from "../../lib/orderNotify";
import type { OrderAddress, ShippingMethod } from "../../types";
import "./CheckoutPage.css";

const PAYMENT_METHODS = ["Efectivo contra entrega", "Transferencia bancaria", "Depósito en tienda"];

const MEETUP_POINTS = ["Sendero Valle del Sol", "Sendero Las Torres", "Soriana Henequén", "Misiones", "Acordar por WhatsApp"];

interface SuccessState {
  orderId: string;
  qrDataUrl: string;
  cardPath: string;
  cardUrl: string;
  accessCode: string;
}

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const { createOrder } = useOrders();
  const { redeemCoupon } = useCoupons();
  const { getOrCreateCustomerForCheckout } = useLoyalty();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("punto-medio");

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    calle: "",
    colonia: "",
    ciudad: "Ciudad Juárez",
    estado: "Chihuahua",
    codigoPostal: "",
    pais: "México",
    referencias: "",
    paymentMethod: PAYMENT_METHODS[0],
    notes: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const discount = couponStatus?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const redeemed = await redeemCoupon(couponCode.trim());
      const amount =
        redeemed.discountType === "percentage" ? (subtotal * redeemed.discountValue) / 100 : redeemed.discountValue;
      setCouponStatus({ code: couponCode.trim().toUpperCase(), discount: Math.min(amount, subtotal) });
    } catch (err) {
      setCouponStatus(null);
      setCouponError(err instanceof Error ? err.message : "No se pudo aplicar el cupón.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const customer = { nombre: form.nombre, apellido: form.apellido, telefono: form.telefono, correo: form.correo || undefined };
      const address: OrderAddress =
        shippingMethod === "nacional"
          ? {
              calle: form.calle,
              colonia: form.colonia,
              ciudad: form.ciudad,
              estado: form.estado,
              codigoPostal: form.codigoPostal,
              pais: form.pais,
              referencias: form.referencias || undefined,
            }
          : {
              calle: "Punto medio en Cd. Juárez",
              colonia: "",
              ciudad: "Ciudad Juárez",
              estado: "Chihuahua",
              codigoPostal: "",
              pais: "México",
              referencias: form.referencias || undefined,
            };
      const items = lines.map((l) => ({
        productId: l.productId,
        name: l.name,
        level: l.level,
        quantity: l.quantity,
        price: l.price,
      }));

      const orderId = await createOrder({
        customer,
        address,
        shippingMethod,
        paymentMethod: form.paymentMethod,
        notes: form.notes || undefined,
        items,
        total,
      });

      notifyOwnerOfOrder(settings.orderNotifyUrl, settings.orderNotifySecret, {
        id: orderId,
        customer,
        address,
        shippingMethod,
        paymentMethod: form.paymentMethod,
        notes: form.notes || undefined,
        items,
        total,
      });

      const { token, accessCode } = await getOrCreateCustomerForCheckout(`${form.nombre} ${form.apellido}`.trim(), form.telefono);

      const message = buildCheckoutMessage({
        businessName: settings.businessName,
        items: lines,
        subtotal,
        discount,
        couponCode: couponStatus?.code ?? null,
        total,
        customer,
        address,
        shippingMethod,
        paymentMethod: form.paymentMethod,
        notes: form.notes || undefined,
      });

      window.open(getWhatsAppUrl(settings.whatsappNumber, message), "_blank", "noopener,noreferrer");

      const qrDataUrl = await generateLoyaltyQrDataUrl(token);
      setSuccess({ orderId, qrDataUrl, cardPath: `/fidelidad/${token}`, cardUrl: getLoyaltyCardUrl(token), accessCode });
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar tu pedido. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container checkout-success">
        <div className="checkout-success-check" aria-hidden="true">
          <svg viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="24" />
            <path d="M15 27l7 7 15-16" />
          </svg>
        </div>
        <h1>¡Gracias por tu pedido!</h1>
        <p>Abrimos WhatsApp para confirmar los detalles con nuestro equipo. Guarda tu tarjeta de fidelidad:</p>

        <div className="loyalty-mini-card">
          <img src={success.qrDataUrl} alt="Código QR de tu tarjeta de fidelidad" />
          <span className="loyalty-mini-code">{success.accessCode}</span>
          <p>Acumula compras para desbloquear recompensas y reseñas. Si pierdes el link, entra en “Mi tarjeta” con tu WhatsApp y este código.</p>
        </div>

        <div className="checkout-success-actions">
          <button
            className="btn btn-outline"
            onClick={() => {
              navigator.clipboard.writeText(success.cardUrl);
              setLinkCopied(true);
            }}
          >
            {linkCopied ? "¡Copiado!" : "Copiar link"}
          </button>
          <button className="btn btn-primary" onClick={() => navigate(success.cardPath)}>
            Ver mi tarjeta
          </button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container checkout-success">
        <h1>Tu carrito está vacío</h1>
        <button className="btn btn-primary" onClick={() => navigate("/fajas")}>
          Ver catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <h1>Checkout</h1>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <section>
          <h2>Método de entrega</h2>
          <div className="shipping-methods">
            <button
              type="button"
              className={`shipping-method-card ${shippingMethod === "punto-medio" ? "is-selected" : ""}`}
              onClick={() => setShippingMethod("punto-medio")}
            >
              <span className="shipping-method-badge">Disponible</span>
              <strong>Punto medio en Cd. Juárez</strong>
              <p>Nos escribes por WhatsApp con tu pedido y coordinamos el lugar y la hora para entregártelo.</p>
            </button>
            <button type="button" className="shipping-method-card is-disabled" disabled aria-disabled="true">
              <span className="shipping-method-badge is-soon">Próximamente</span>
              <strong>Envío a otras partes de México</strong>
              <p>Muy pronto podrás recibir tu pedido por paquetería en cualquier estado del país.</p>
            </button>
          </div>
        </section>

        <section>
          <h2>Datos personales</h2>
          <div className="checkout-row">
            <input required placeholder="Nombre" value={form.nombre} onChange={update("nombre")} />
            <input required placeholder="Apellido" value={form.apellido} onChange={update("apellido")} />
          </div>
          <div className="checkout-row">
            <input required placeholder="Teléfono / WhatsApp" value={form.telefono} onChange={update("telefono")} />
            <input type="email" placeholder="Correo (opcional)" value={form.correo} onChange={update("correo")} />
          </div>
        </section>

        {shippingMethod === "nacional" ? (
          <section>
            <h2>Dirección de envío</h2>
            <input required placeholder="Calle y número" value={form.calle} onChange={update("calle")} />
            <div className="checkout-row">
              <input required placeholder="Colonia" value={form.colonia} onChange={update("colonia")} />
              <input required placeholder="Código postal" value={form.codigoPostal} onChange={update("codigoPostal")} />
            </div>
            <div className="checkout-row">
              <input required placeholder="Ciudad" value={form.ciudad} onChange={update("ciudad")} />
              <input required placeholder="Estado" value={form.estado} onChange={update("estado")} />
            </div>
            <input placeholder="Referencias (opcional)" value={form.referencias} onChange={update("referencias")} />
          </section>
        ) : (
          <section>
            <h2>Punto de entrega</h2>
            <div className="checkout-meetup-note">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" strokeLinejoin="round" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
              <p>
                Al confirmar tu pedido te escribimos por WhatsApp para acordar contigo el lugar y la hora exactos dentro de
                Cd. Juárez.
              </p>
            </div>
            <select value={form.referencias} onChange={update("referencias")}>
              <option value="">Zona o lugar de encuentro preferido (opcional)</option>
              {MEETUP_POINTS.map((point) => (
                <option key={point} value={point}>
                  {point}
                </option>
              ))}
            </select>
          </section>
        )}

        <section>
          <h2>Método de pago</h2>
          <select value={form.paymentMethod} onChange={update("paymentMethod")}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </section>

        <section>
          <h2>Cupón de descuento</h2>
          <div className="checkout-row">
            <input placeholder="Código de cupón" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
            <button type="button" className="btn btn-outline" onClick={handleApplyCoupon} disabled={couponLoading}>
              {couponLoading ? "..." : "Aplicar"}
            </button>
          </div>
          {couponStatus && <p className="checkout-coupon-ok">Cupón {couponStatus.code} aplicado ✓</p>}
          {couponError && <p className="checkout-coupon-error">{couponError}</p>}
        </section>

        <section>
          <h2>Notas del pedido</h2>
          <textarea placeholder="Notas para tu pedido (opcional)" value={form.notes} onChange={update("notes")} />
        </section>

        <div className="checkout-summary">
          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="checkout-summary-row">
              <span>Descuento</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="checkout-summary-row checkout-summary-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {error && <p className="checkout-error">{error}</p>}

        <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? "Enviando…" : "Confirmar pedido por WhatsApp"}
        </button>
      </form>
    </div>
  );
}
