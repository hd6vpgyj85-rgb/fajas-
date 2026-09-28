import { useMemo, useState } from "react";
import { useProducts } from "../../context/ProductsContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { DEFAULT_CATEGORY_IMAGES } from "../../types";
import CategoryPhotoBanner from "../../components/CategoryPhotoBanner";
import CategoryHero from "../../components/CategoryHero";
import ProductFilters, { applyFilter, type ActiveFilter } from "../../components/ProductFilters";
import ProductGrid from "../../components/ProductGrid";
import FeaturedCarousel from "../../components/FeaturedCarousel";
import CategoryFooter from "../../components/CategoryFooter";

export default function OfertasPage() {
  const { products, loading } = useProducts();
  const { settings } = useSiteSettings();
  const [filter, setFilter] = useState<ActiveFilter>({ type: "all" });

  const onSaleProducts = useMemo(() => products.filter((p) => p.onSale && p.compareAtPrice), [products]);
  const filtered = useMemo(() => applyFilter(onSaleProducts, filter), [onSaleProducts, filter]);
  const image = settings.categoryImages.ofertas ?? DEFAULT_CATEGORY_IMAGES.ofertas;

  return (
    <>
      <CategoryPhotoBanner name="Ofertas" tagline="Piezas seleccionadas con descuento especial" image={image} />
      <CategoryHero title="Ofertas especiales" subtitle="Aprovecha antes de que se agoten" />

      <div className="container">
        <ProductFilters products={onSaleProducts} active={filter} onChange={setFilter} />
        <ProductGrid products={filtered} loading={loading} />
      </div>

      <FeaturedCarousel products={onSaleProducts} />
      <CategoryFooter />
    </>
  );
}
