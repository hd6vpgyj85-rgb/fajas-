import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { CATEGORIES } from "../types";
import { useCart } from "../context/CartContext";
import { useSiteSettings } from "../context/SiteSettingsContext";
import "./Header.css";

export default function Header({ centered = false }: { centered?: boolean }) {
  const { count } = useCart();
  const { settings } = useSiteSettings();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bump, setBump] = useState(false);
  const previousCount = useRef(count);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (count > previousCount.current) {
      setBump(true);
      const timer = setTimeout(() => setBump(false), 450);
      previousCount.current = count;
      return () => clearTimeout(timer);
    }
    previousCount.current = count;
  }, [count]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`site-header ${centered ? "site-header-centered" : ""} ${scrolled ? "is-scrolled" : ""} ${
          menuOpen ? "is-menu-open" : ""
        }`}
      >
        <div className="container site-header-inner">
          <button
            className={`site-header-burger ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <Link to="/" className="site-header-logo">
            {settings.logoUrl ? <img src={settings.logoUrl} alt={settings.businessName} /> : settings.businessName}
          </Link>

          <nav className={`site-header-nav ${menuOpen ? "is-open" : ""}`} aria-label="Categorías">
            {CATEGORIES.map((c, i) => (
              <NavLink key={c.slug} to={`/${c.slug}`} style={{ transitionDelay: menuOpen ? `${0.06 + i * 0.05}s` : "0s" }}>
                {c.name}
              </NavLink>
            ))}
            <NavLink
              to="/ofertas"
              className="site-header-nav-sale"
              style={{ transitionDelay: menuOpen ? `${0.06 + CATEGORIES.length * 0.05}s` : "0s" }}
            >
              Ofertas
            </NavLink>
            <NavLink
              to="/mi-tarjeta"
              className="site-header-nav-mobile-only"
              style={{ transitionDelay: menuOpen ? `${0.06 + (CATEGORIES.length + 1) * 0.05}s` : "0s" }}
            >
              Mi tarjeta de fidelidad
            </NavLink>
          </nav>

          <div className="site-header-actions">
            <Link to="/buscar" aria-label="Buscar" className="site-header-icon">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
            </Link>
            <Link to="/mi-tarjeta" aria-label="Mi tarjeta de fidelidad" className="site-header-icon site-header-icon-desktop">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <circle cx="12" cy="8" r="3.6" />
                <path d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2" strokeLinecap="round" />
              </svg>
            </Link>
            <Link to="/carrito" aria-label={`Carrito, ${count} artículos`} className="site-header-icon site-header-cart">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" strokeLinejoin="round" />
                <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
              </svg>
              {count > 0 && <span className={`site-header-cart-count ${bump ? "is-bumping" : ""}`}>{count}</span>}
            </Link>
          </div>
        </div>
      </header>
      <div
        className={`site-header-overlay ${menuOpen ? "is-visible" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
    </>
  );
}
