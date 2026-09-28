import { useSiteSettings } from "../context/SiteSettingsContext";
import "./VisitUs.css";

export default function VisitUs() {
  const { settings } = useSiteSettings();

  return (
    <section className="visit-us">
      <div className="visit-us-image">
        <img src={settings.storePhoto ?? undefined} alt={settings.businessName} loading="lazy" />
      </div>
      <div className="visit-us-info">
        <h2>Viste con estilo</h2>
        <p>Visítanos en tienda y encuentra la pieza perfecta para ti.</p>
        <div className="visit-us-detail">
          <strong>Dirección</strong>
          <span>{settings.address}</span>
        </div>
        <div className="visit-us-detail">
          <strong>Horario</strong>
          <span>{settings.hours}</span>
        </div>
        {settings.mapUrl && (
          <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            Cómo llegar
          </a>
        )}
      </div>
    </section>
  );
}
