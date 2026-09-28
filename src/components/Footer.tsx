import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../types";
import { getWhatsAppUrl } from "../data/store";
import { useSiteSettings } from "../context/SiteSettingsContext";
import "./Footer.css";

const SOCIAL_ICONS: Record<string, ReactNode> = {
  Instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  Facebook: <path d="M14 8.5h2.5V5H14c-2.2 0-4 1.8-4 4v2H8v3.5h2V21h3.5v-6.5H16l.5-3.5h-3V9c0-.3.2-.5.5-.5Z" strokeLinejoin="round" />,
  TikTok: <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.4 2.6 2.2 4.4 5 4.6" strokeLinecap="round" strokeLinejoin="round" />,
  WhatsApp: (
    <path
      d="M4.5 19.5l1.2-3.8A8 8 0 1 1 8.6 18.6l-4.1.9Zm5-10.3c.2 2.4 2.4 4.9 5 5.3l1-1.1-1.6-1-.8.6c-.9-.4-1.6-1.1-2-2l.6-.8-1-1.6-1.2.6Z"
      strokeLinejoin="round"
    />
  ),
};

export default function Footer() {
  const { settings } = useSiteSettings();
  const whatsappUrl = getWhatsAppUrl(settings.whatsappNumber, `Hola ${settings.businessName}, necesito ayuda`);
  const socialLinks = [
    { label: "Instagram", url: settings.instagramUrl },
    { label: "Facebook", url: settings.facebookUrl },
    { label: "TikTok", url: settings.tiktokUrl },
    { label: "WhatsApp", url: whatsappUrl },
  ].filter((link): link is { label: string; url: string } => Boolean(link.url));

  return (
    <footer className="site-footer">
      <div className="container site-footer-grid">
        <div className="site-footer-brand">
          <h3>{settings.businessName}</h3>
          <p>{settings.tagline}</p>
          <div className="site-footer-social">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  {SOCIAL_ICONS[link.label]}
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4>Categorías</h4>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to={`/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
            <li>
              <Link to="/ofertas">Ofertas</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>Ayuda</h4>
          <ul>
            <li>
              <Link to="/mi-tarjeta">Mi tarjeta de fidelidad</Link>
            </li>
            <li>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Escríbenos por WhatsApp
              </a>
            </li>
            <li>
              <Link to="/terminos">Términos y condiciones</Link>
            </li>
            <li>
              <Link to="/privacidad">Aviso de privacidad</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>Visítanos</h4>
          {settings.address && (
            <p className="site-footer-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" strokeLinejoin="round" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
              {settings.address}
            </p>
          )}
          {settings.hours && (
            <p className="site-footer-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7.5V12l3 2" strokeLinecap="round" />
              </svg>
              {settings.hours}
            </p>
          )}
          {settings.phone && (
            <p className="site-footer-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path
                  d="M6.5 4h3l1.5 4-2 1.3a10 10 0 0 0 5.7 5.7L16 13l4 1.5v3A2 2 0 0 1 18 19.5 15.5 15.5 0 0 1 4.5 6 2 2 0 0 1 6.5 4Z"
                  strokeLinejoin="round"
                />
              </svg>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>
            </p>
          )}
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>
          © {new Date().getFullYear()} {settings.businessName}. Hecho con <span className="site-footer-heart">♥</span> en Cd. Juárez.
        </span>
        <Link to="/admin" className="site-footer-admin-link">
          Panel de administración
        </Link>
      </div>
    </footer>
  );
}
