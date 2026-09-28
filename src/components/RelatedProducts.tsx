import { useMemo } from "react";
import type { Product } from "../types";
import ProductGrid from "./ProductGrid";
import Reveal from "./Reveal";

export default function RelatedProducts({ current, all }: { current: Product; all: Product[] }) {
  const related = useMemo(() => {
    const pool = all.filter((p) => p.id !== current.id);
    const sameCategory = pool.filter((p) => p.category === current.category);
    const source = sameCategory.length >= 4 ? sameCategory : pool;
    return [...source].sort(() => Math.random() - 0.5).slice(0, 4);
  }, [current, all]);

  if (related.length === 0) return null;

  return (
    <section className="related-products">
      <Reveal className="related-products-heading">
        <span className="section-eyebrow">Completa tu look</span>
        <h2>También te puede gustar</h2>
      </Reveal>
      <ProductGrid products={related} />
    </section>
  );
}
