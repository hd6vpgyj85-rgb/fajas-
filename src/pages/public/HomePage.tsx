import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useProducts } from "../../context/ProductsContext";
import { useAnalytics } from "../../context/AnalyticsContext";
import { getWhatsAppUrl } from "../../data/store";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { CATEGORIES } from "../../types";
import ProductCard, { ProductCardSkeleton } from "../../components/ProductCard";
import Testimonials from "../../components/Testimonials";
import VisitUs from "../../components/VisitUs";
import CtaFooter from "../../components/CtaFooter";
import StarRating from "../../components/StarRating";
import Reveal from "../../components/Reveal";
import "./HomePage.css";

const PERKS = [
  {
    title: "Asesoría personalizada",
    text: "Te ayudamos a elegir talla y compresión por WhatsApp.",
    icon: (
      <path d="M4 5h16v11H8l-4 4V5Z" strokeLinejoin="round" />
    ),
  },
  {
    title: "Entrega en Cd. Juárez",
    text: "Coordinamos contigo la entrega o recógelo en tienda.",
    icon: (
      <>
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" strokeLinejoin="round" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17" cy="18" r="1.6" />
      </>
    ),
  },
  {
    title: "Programa de fidelidad",
    text: "Cada compra suma para recompensas exclusivas.",
    icon: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" strokeLinejoin="round" />,
  },
];

export default function HomePage() {
  const { products, loading } = useProducts();
  const { stats } = useAnalytics();
  const { settings } = useSiteSettings();

  const topProducts = useMemo(() => {
    if (products.length === 0) return [];
    const withViews = products
      .map((p) => ({ product: p, views: stats.find((s) => s.productId === p.id)?.views ?? 0 }))
      .sort((a, b) => b.views - a.views);

    const topViewed = withViews.filter((p) => p.views > 0).slice(0, 3);
    if (topViewed.length >= 3) return topViewed.map((p) => p.product);

    const remaining = products.filter((p) => !topViewed.some((t) => t.product.id === p.id));
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    return [...topViewed.map((p) => p.product), ...shuffled].slice(0, 3);
  }, [products, stats]);

  return (
    <>
      <section className="hero">
        <div
          className="hero-bg"
          style={settings.heroImage ? { backgroundImage: `url(${settings.heroImage})` } : undefined}
          aria-hidden="true"
        />
        <div className="hero-overlay" aria-hidden="true" />
        <div className="container hero-content">
          <span className="hero-badge hero-stagger" style={{ animationDelay: "0.1s" }}>
            <span className="hero-badge-dot" />
            Especialistas en moda
          </span>
          <h1 className="hero-stagger" style={{ animationDelay: "0.22s" }}>
            {settings.heroTitle}
          </h1>
          <p className="hero-stagger" style={{ animationDelay: "0.34s" }}>
            {settings.heroSubtitle}
          </p>
          <div className="hero-actions hero-stagger" style={{ animationDelay: "0.46s" }}>
            <Link to="/fajas" className="btn btn-primary">
              Ver más
            </Link>
            <a
              href={getWhatsAppUrl(settings.whatsappNumber, `Hola ${settings.businessName}, quiero más información 💗`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline hero-btn-outline"
            >
              Escríbenos
            </a>
          </div>
          <div className="hero-rating hero-stagger" style={{ animationDelay: "0.58s" }}>
            <StarRating rating={5} />
            <span>+500 clientas satisfechas</span>
          </div>
        </div>
        <a href="#top-productos" className="hero-scroll" aria-label="Ver productos">
          <span />
        </a>
      </section>

      <section className="home-categories container" aria-label="Categorías">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.08} className="home-category">
            <Link to={`/${c.slug}`}>
              <div className="home-category-image">
                <img src={settings.categoryImages[c.slug] ?? c.image} alt="" loading="lazy" />
              </div>
              <span className="home-category-name">
                {c.name}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </Reveal>
        ))}
      </section>

      <section id="top-productos" className="top-products container">
        <Reveal className="section-heading">
          <span className="section-eyebrow">Lo más buscado</span>
          <h2>Top productos de la semana</h2>
        </Reveal>
        <div className="top-products-grid">
          {loading
            ? Array.from({ length: 3 }, (_, i) => <ProductCardSkeleton key={i} />)
            : topProducts.map((product, i) => (
                <Reveal key={product.id} delay={i * 0.1}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
        </div>
        {!loading && topProducts.length === 0 && (
          <p className="top-products-empty">Muy pronto tendremos novedades para ti ✿</p>
        )}
      </section>

      <section className="home-perks">
        <div className="container home-perks-grid">
          {PERKS.map((perk, i) => (
            <Reveal key={perk.title} delay={i * 0.1} className="home-perk">
              <span className="home-perk-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {perk.icon}
                </svg>
              </span>
              <div>
                <h3>{perk.title}</h3>
                <p>{perk.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Testimonials />
      <VisitUs />
      <CtaFooter />
    </>
  );
}
