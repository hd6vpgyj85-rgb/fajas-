import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types";
import ProductBadge from "./ProductBadge";
import ProductPrice from "./ProductPrice";
import "./ProductCard.css";

const SWIPE_THRESHOLD = 32;
const DRAG_THRESHOLD = 8;

export default function ProductCard({ product }: { product: Product }) {
  const images = product.images ?? [];
  const cover = images[0];
  const hoverImage = images[1];
  const fit = product.homeImageFit ?? "cover";

  const [swipeIndex, setSwipeIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<"next" | "prev">("next");
  const touchStartX = useRef<number | null>(null);
  const dragged = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragged.current = false;
    if (images.length < 2) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    if (Math.abs(e.touches[0].clientX - touchStartX.current) > DRAG_THRESHOLD) dragged.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      setSwipeDir(delta < 0 ? "next" : "prev");
      setSwipeIndex((i) => (delta < 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length));
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (dragged.current) {
      e.preventDefault();
      dragged.current = false;
    }
  };

  return (
    <Link
      to={`/producto/${product.id}`}
      className={`product-card ${hoverImage ? "has-hover-image" : ""}`}
      onClick={handleClick}
    >
      <div
        className="product-card-image"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <ProductBadge product={product} />
        {cover ? (
          <>
            <img src={cover} alt={product.name} loading="lazy" className="product-card-img-main" style={{ objectFit: fit }} />
            {hoverImage && (
              <img src={hoverImage} alt="" loading="lazy" className="product-card-img-hover" style={{ objectFit: fit }} />
            )}
            {swipeIndex > 0 && (
              <img
                key={`${swipeIndex}-${swipeDir}`}
                src={images[swipeIndex]}
                alt=""
                loading="lazy"
                className={`product-card-img-swipe is-${swipeDir}`}
                style={{ objectFit: fit }}
              />
            )}
          </>
        ) : (
          <div className="product-card-placeholder">
            <span>{product.name.charAt(0)}</span>
          </div>
        )}
        {images.length > 1 && (
          <div className="product-card-dots" aria-hidden="true">
            {images.map((_, i) => (
              <span key={i} className={i === swipeIndex ? "is-active" : ""} />
            ))}
          </div>
        )}
        <span className="product-card-cta">Ver producto</span>
      </div>
      <div className="product-card-body">
        <span className="product-card-brand">{product.brand}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <ProductPrice product={product} />
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card product-card-skeleton" aria-hidden="true">
      <div className="product-card-image skeleton" />
      <div className="product-card-body">
        <span className="skeleton" style={{ width: "40%", height: 10 }} />
        <span className="skeleton" style={{ width: "85%", height: 14, marginTop: 6 }} />
        <span className="skeleton" style={{ width: "30%", height: 14, marginTop: 6 }} />
      </div>
    </div>
  );
}
