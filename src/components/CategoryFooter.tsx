import { Link } from "react-router-dom";
import { useSiteSettings } from "../context/SiteSettingsContext";
import "./CategoryFooter.css";

export default function CategoryFooter() {
  const { settings } = useSiteSettings();

  return (
    <section className="category-footer">
      <div className="category-footer-image">
        <img src={settings.storePhoto ?? undefined} alt={settings.businessName} loading="lazy" />
      </div>
      <div className="category-footer-text">
        <h2>Proyecta tu mejor versión con {settings.businessName}</h2>
        <p>Piezas pensadas para realzar tu figura y darte la confianza que buscas, todos los días.</p>
        <Link to="/buscar" className="btn btn-outline">
          Explorar catálogo
        </Link>
      </div>
    </section>
  );
}
