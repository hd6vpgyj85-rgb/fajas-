import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../../context/ProductsContext";
import { useAnalytics } from "../../context/AnalyticsContext";
import { useCart } from "../../context/CartContext";
import { CATEGORIES, LEVEL_LABELS } from "../../types";
import { formatPrice } from "../../lib/format";
import { getProductDescription } from "../../lib/productDescription";
import ProductBadge from "../../components/ProductBadge";
import Lightbox from "../../components/Lightbox";
import QuantityStepper from "../../components/QuantityStepper";
import RelatedProducts from "../../components/RelatedProducts";
import { useToast } from "../../context/ToastContext";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading, getById } = useProducts();
  const { registerView, registerCartAdd } = useAnalytics();
  const { addLine } = useCart();
  const { showToast } = useToast();
  const touchStart = useRef<number | null>(null);

  const product = id ? getById(id) : undefined;

  const [imageIndex, setImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<"detalles" | "envios" | null>("detalles");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) registerView(product.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  useEffect(() => {
    setImageIndex(0);
    setQuantity(1);
  }, [id]);

  if (loading) {
    return (
      <div className="container product-detail" aria-busy="true">
        <div className="product-detail-gallery">
          <div className="product-detail-main-image skeleton" />
        </div>
        <div className="product-detail-info">
          <span className="skeleton" style={{ display: "block", width: "30%", height: 12 }} />
          <span className="skeleton" style={{ display: "block", width: "80%", height: 30, margin: "14px 0" }} />
          <span className="skeleton" style={{ display: "block", width: "35%", height: 24, marginBottom: 24 }} />
          <span className="skeleton" style={{ display: "block", width: "100%", height: 48, borderRadius: 999 }} />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container product-not-found">
        <p>No encontramos este producto.</p>
        <button className="btn btn-primary" onClick={() => navigate("/buscar")}>
          Buscar productos
        </button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const levelText = product.levels?.length ? product.levels.map((l) => LEVEL_LABELS[l]).join(" / ") : null;
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 3;
  const category = CATEGORIES.find((c) => c.slug === product.category);

  const goToImage = (direction: 1 | -1) => {
    if (images.length < 2) return;
    setImageIndex((i) => (i + direction + images.length) % images.length);
  };

  const handleAddToCart = () => {
    addLine({
      productId: product.id,
      name: product.name,
      image: images[0] ?? null,
      price: product.price,
      level: levelText ?? undefined,
      quantity,
      stock: product.stock,
    });
    registerCartAdd(product.id);
    showToast(`${product.name} se agregó a tu carrito`, {
      image: images[0] ?? null,
      action: { label: "Ver carrito", to: "/carrito" },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="container product-detail-page">
      <nav className="product-detail-breadcrumb" aria-label="Ruta">
        <Link to="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        {category && (
          <>
            <Link to={`/${category.slug}`}>{category.name}</Link>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span className="product-detail-breadcrumb-current">{product.name}</span>
      </nav>
      <div className="product-detail">
        <div className="product-detail-gallery">
          <div
            className="product-detail-main-image"
            onTouchStart={(e) => {
              touchStart.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStart.current === null) return;
              const delta = e.changedTouches[0].clientX - touchStart.current;
              touchStart.current = null;
              if (Math.abs(delta) > 40) goToImage(delta < 0 ? 1 : -1);
            }}
          >
            <ProductBadge product={product} />
            {images.length > 0 ? (
              <img
                key={images[imageIndex]}
                src={images[imageIndex]}
                alt={product.name}
                onClick={() => setLightboxOpen(true)}
              />
            ) : (
              <div className="product-detail-placeholder">
                <span>{product.name.charAt(0)}</span>
              </div>
            )}

            {images.length > 0 && (
              <button className="product-detail-zoom" onClick={() => setLightboxOpen(true)} aria-label="Ampliar imagen">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M20 20l-4-4M11 8.5v5M8.5 11h5" strokeLinecap="round" />
                </svg>
              </button>
            )}

            {images.length > 1 && (
              <>
                <button
                  className="product-detail-arrow is-prev"
                  onClick={() => goToImage(-1)}
                  aria-label="Imagen anterior"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  className="product-detail-arrow is-next"
                  onClick={() => goToImage(1)}
                  aria-label="Imagen siguiente"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className="product-detail-dots">
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={i === imageIndex ? "is-active" : ""}
                    onClick={() => setImageIndex(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="product-detail-thumbs">
              {images.map((img, i) => (
                <button key={i} className={i === imageIndex ? "is-active" : ""} onClick={() => setImageIndex(i)}>
                  <img src={img} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <span className="product-detail-brand">{product.brand}</span>
          <h1>{product.name}</h1>

          <div className="product-detail-price">
            {product.onSale && product.compareAtPrice && (
              <span className="product-detail-price-old">{formatPrice(product.compareAtPrice)}</span>
            )}
            <span className="product-detail-price-current">{formatPrice(product.price)}</span>
          </div>

          {levelText && <p className="product-detail-level">{levelText}</p>}

          <p className={`product-detail-stock ${outOfStock ? "is-out" : lowStock ? "is-low" : ""}`}>
            <span aria-hidden="true" />
            {outOfStock
              ? "Agotado por ahora"
              : lowStock
                ? `¡Solo ${product.stock === 1 ? "queda 1 pieza" : `quedan ${product.stock} piezas`}!`
                : "Disponible"}
          </p>

          <div className="product-detail-buy">
            <QuantityStepper quantity={quantity} max={Math.max(1, product.stock)} onChange={setQuantity} />
            <button
              className={`btn btn-primary btn-block product-detail-add ${added ? "is-added" : ""}`}
              onClick={handleAddToCart}
              disabled={outOfStock}
            >
              {outOfStock ? "Agotado" : added ? "¡Agregado! ✓" : "Agregar al carrito"}
            </button>
          </div>

          <ul className="product-detail-perks">
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 5h16v11H8l-4 4V5Z" strokeLinejoin="round" />
              </svg>
              Asesoría de talla por WhatsApp
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path
                  d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"
                  strokeLinejoin="round"
                />
              </svg>
              Suma a tu tarjeta de fidelidad
            </li>
          </ul>

          <p className="product-detail-description">{getProductDescription(product)}</p>

          {[
            {
              key: "detalles" as const,
              title: "Detalles",
              content: (
                <ul>
                  <li>Marca: {product.brand}</li>
                  {product.sizes && product.sizes.length > 0 && <li>Tallas disponibles: {product.sizes.join(", ")}</li>}
                  {levelText && <li>Compresión: {levelText}</li>}
                  {product.vendor && <li>Proveedor: {product.vendor}</li>}
                </ul>
              ),
            },
            {
              key: "envios" as const,
              title: "Envíos y devoluciones",
              content: (
                <p>
                  Coordinamos tu envío directamente por WhatsApp una vez confirmado tu pedido. Si tu producto llega con
                  algún defecto, contáctanos dentro de las primeras 48 horas para gestionar tu cambio o devolución.
                </p>
              ),
            },
          ].map((section) => {
            const isOpen = openAccordion === section.key;
            return (
              <div className={`accordion ${isOpen ? "is-open" : ""}`} key={section.key}>
                <button
                  className="accordion-trigger"
                  onClick={() => setOpenAccordion(isOpen ? null : section.key)}
                  aria-expanded={isOpen}
                  aria-controls={`accordion-${section.key}`}
                >
                  {section.title}
                  <span className="accordion-icon" aria-hidden="true" />
                </button>
                <div className="accordion-panel" id={`accordion-${section.key}`} role="region">
                  <div className="accordion-content">{section.content}</div>
                </div>
              </div>
            );
          })}
        </div>

        {lightboxOpen && (
          <Lightbox
            images={images}
            index={imageIndex}
            onClose={() => setLightboxOpen(false)}
            onNavigate={setImageIndex}
          />
        )}
      </div>
      <RelatedProducts current={product} all={products} />
    </div>
  );
}
