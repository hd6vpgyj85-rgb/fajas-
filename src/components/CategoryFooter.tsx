import { Link } from "react-router-dom";
import { useSiteSettings } from "../context/SiteSettingsContext";
import Reveal from "./Reveal";
import "./CategoryFooter.css";

export default function CategoryFooter() {
  const { settings } = useSiteSettings();

  return (
    <section className="category-footer">
      <Reveal className="category-footer-image">
        <img src={settings.storePhoto ?? undefined} alt={settings.businessName} loading="lazy" />
      </Reveal>
      <Reveal className="category-footer-text" delay={0.12}>
        <h2>Proyecta tu mejor versión con {settings.businessName}</h2>
        <p>Piezas pensadas para realzar tu figura y darte la confianza que buscas, todos los días.</p>
        <Link to="/buscar" className="btn btn-outline">
          Explorar catálogo
        </Link>
      </Reveal>
    </section>
  );
}
