import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../lib/format";
import QuantityStepper from "../../components/QuantityStepper";
import "./CartPage.css";

export default function CartPage() {
  const { lines, updateQuantity, removeLine, subtotal, count } = useCart();
  const navigate = useNavigate();
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = (productId: string, level: string | undefined) => {
    const key = `${productId}-${level ?? ""}`;
    setRemoving(key);
    setTimeout(() => {
      removeLine(productId, level);
      setRemoving(null);
    }, 280);
  };

  if (lines.length === 0) {
    return (
      <div className="container cart-empty">
        <div className="cart-empty-icon" aria-hidden="true">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" strokeLinejoin="round" />
            <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
          </svg>
        </div>
        <h1>Tu carrito está vacío</h1>
        <p>Explora nuestro catálogo y encuentra tu próxima pieza favorita.</p>
        <div className="cart-empty-actions">
          <Link to="/fajas" className="btn btn-primary">
            Ver catálogo
          </Link>
          <Link to="/ofertas" className="btn btn-outline">
            Ver ofertas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <div className="cart-header">
        <h1>Tu carrito</h1>
        <span>
          {count} {count === 1 ? "pieza" : "piezas"}
        </span>
      </div>

      <div className="cart-layout">
        <div className="cart-lines">
          {lines.map((line, i) => {
            const key = `${line.productId}-${line.level ?? ""}`;
            return (
              <div
                className={`cart-line ${removing === key ? "is-removing" : ""}`}
                key={key}
                style={{ animationDelay: `${Math.min(i, 6) * 0.06}s` }}
              >
                <Link to={`/producto/${line.productId}`} className="cart-line-image">
                  {line.image ? <img src={line.image} alt={line.name} /> : <div className="cart-line-placeholder" />}
                </Link>
                <div className="cart-line-info">
                  <Link to={`/producto/${line.productId}`}>
                    <h3>{line.name}</h3>
                  </Link>
                  {line.level && <span className="cart-line-level">{line.level}</span>}
                  <span className="cart-line-price">{formatPrice(line.price * line.quantity)}</span>
                  {line.quantity > 1 && <span className="cart-line-unit">{formatPrice(line.price)} c/u</span>}
                </div>
                <div className="cart-line-actions">
                  <QuantityStepper
                    quantity={line.quantity}
                    max={line.stock}
                    onChange={(qty) => updateQuantity(line.productId, line.level, qty)}
                  />
                  <button
                    className="cart-line-remove"
                    onClick={() => handleRemove(line.productId, line.level)}
                    aria-label={`Eliminar ${line.name}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="cart-summary">
          <h2>Resumen</h2>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <strong key={subtotal} className="cart-summary-total">
              {formatPrice(subtotal)}
            </strong>
          </div>
          <p className="cart-summary-note">El envío se coordina contigo por WhatsApp al confirmar tu pedido.</p>
          <button className="btn btn-primary btn-block" onClick={() => navigate("/checkout")}>
            Continuar al checkout
          </button>
          <Link to="/fajas" className="cart-summary-continue">
            Seguir comprando
          </Link>
          <div className="cart-summary-loyalty">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" strokeLinejoin="round" />
            </svg>
            Esta compra suma a tu tarjeta de fidelidad.
          </div>
        </aside>
      </div>
    </div>
  );
}
