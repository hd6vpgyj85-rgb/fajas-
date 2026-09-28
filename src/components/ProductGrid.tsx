import type { Product } from "../types";
import ProductGridCard from "./ProductGridCard";
import { ProductCardSkeleton } from "./ProductCard";
import "./ProductGrid.css";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  skeletonCount?: number;
}

export default function ProductGrid({ products, loading = false, skeletonCount = 8 }: ProductGridProps) {
  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-grid-empty">
        <span aria-hidden="true">✿</span>
        <p>No encontramos productos con este filtro por ahora.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product, i) => (
        <div className="product-grid-item" key={product.id} style={{ animationDelay: `${Math.min(i, 11) * 0.05}s` }}>
          <ProductGridCard product={product} />
        </div>
      ))}
    </div>
  );
}
