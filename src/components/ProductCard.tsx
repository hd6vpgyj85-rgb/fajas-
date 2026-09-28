import { Link } from "react-router-dom";
import type { Product } from "../types";
import ProductBadge from "./ProductBadge";
import ProductPrice from "./ProductPrice";
import "./ProductCard.css";

export default function ProductCard({ product }: { product: Product }) {
  const cover = product.images?.[0];
  const hoverImage = product.images?.[1];
  const fit = product.homeImageFit ?? "cover";

  return (
    <Link to={`/producto/${product.id}`} className={`product-card ${hoverImage ? "has-hover-image" : ""}`}>
      <div className="product-card-image">
        <ProductBadge product={product} />
        {cover ? (
          <>
            <img src={cover} alt={product.name} loading="lazy" className="product-card-img-main" style={{ objectFit: fit }} />
            {hoverImage && (
              <img src={hoverImage} alt="" loading="lazy" className="product-card-img-hover" style={{ objectFit: fit }} />
            )}
          </>
        ) : (
          <div className="product-card-placeholder">
            <span>{product.name.charAt(0)}</span>
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
