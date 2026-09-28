import { Link } from "react-router-dom";
import { CATEGORIES } from "../types";
import { getWhatsAppUrl } from "../data/store";
import { useSiteSettings } from "../context/SiteSettingsContext";
import "./Footer.css";

export default function Footer() {
  const { settings } = useSiteSettings();
  const socialLinks = [
    { label: "Instagram", url: settings.instagramUrl },
    { label: "Facebook", url: settings.facebookUrl },
    { label: "TikTok", url: settings.tiktokUrl },
  ].filter((link): link is { label: string; url: string } => Boolean(link.url));

  return (
    <footer className="site-footer">
      <div className="container site-footer-grid">
        <div>
          <h3>{settings.businessName}</h3>
          <p>{settings.tagline}</p>
        </div>

        <div>
          <h4>Categorías</h4>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to={`/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Ayuda</h4>
          <ul>
            <li>
              <a
                href={getWhatsAppUrl(settings.whatsappNumber, `Hola ${settings.businessName}, necesito ayuda`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <Link to="/terminos">Términos y condiciones</Link>
            </li>
            <li>
              <Link to="/privacidad">Aviso de privacidad</Link>
            </li>
            {socialLinks.map((link) => (
              <li key={link.label}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Contacto</h4>
          <p>{settings.address}</p>
          <p>{settings.hours}</p>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>
          © {new Date().getFullYear()} {settings.businessName}. Todos los derechos reservados.
        </span>
        <Link to="/admin" className="site-footer-admin-link">
          Panel de administración
        </Link>
      </div>
    </footer>
  );
}
