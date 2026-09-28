import { getWhatsAppUrl } from "../data/store";
import { useSiteSettings } from "../context/SiteSettingsContext";
import Reveal from "./Reveal";
import "./CtaFooter.css";

export default function CtaFooter() {
  const { settings } = useSiteSettings();

  return (
    <section className="cta-footer">
      <Reveal className="cta-footer-inner">
      <h2>¿Lista para renovar tu guardarropa?</h2>
      <p>Escríbenos por WhatsApp y te ayudamos a encontrar tu talla y modelo ideal.</p>
      <a
        href={getWhatsAppUrl(settings.whatsappNumber, `Hola ${settings.businessName}, quiero más información 💗`)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
      >
        Escríbenos por WhatsApp
      </a>
      </Reveal>
    </section>
  );
}
