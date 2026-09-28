import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CATEGORIES, type Category, type ProductLevel } from "../../types";
import { useProducts } from "../../context/ProductsContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import CategoryPhotoBanner from "../../components/CategoryPhotoBanner";
import CategoryHero from "../../components/CategoryHero";
import ProductFilters, { applyFilter, type ActiveFilter } from "../../components/ProductFilters";
import ProductGrid from "../../components/ProductGrid";
import FeaturedCarousel from "../../components/FeaturedCarousel";
import CategoryFooter from "../../components/CategoryFooter";

function initialFilterFromParams(params: URLSearchParams): ActiveFilter {
  const marca = params.get("marca");
  const nivel = params.get("nivel");
  if (marca) return { type: "brand", value: marca };
  if (nivel) return { type: "level", value: nivel as ProductLevel };
  return { type: "all" };
}

export default function CategoryPage({ category }: { category: Category }) {
  const { products, loading } = useProducts();
  const { settings } = useSiteSettings();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<ActiveFilter>(() => initialFilterFromParams(searchParams));

  const meta = CATEGORIES.find((c) => c.slug === category)!;
  const image = settings.categoryImages[category] ?? meta.image;
  const categoryProducts = useMemo(() => products.filter((p) => p.category === category), [products, category]);
  const filtered = useMemo(() => applyFilter(categoryProducts, filter), [categoryProducts, filter]);

  return (
    <>
      <CategoryPhotoBanner name={meta.name} tagline={meta.tagline} image={image} />
      <CategoryHero title={`Descubre ${meta.name.toLowerCase()}`} subtitle={meta.tagline} />

      <div className="container">
        <ProductFilters products={categoryProducts} active={filter} onChange={setFilter} />
        <ProductGrid products={filtered} loading={loading} />
      </div>

      <FeaturedCarousel products={categoryProducts} />
      <CategoryFooter />
    </>
  );
}
