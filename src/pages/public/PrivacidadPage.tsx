import { useSiteSettings } from "../../context/SiteSettingsContext";
import "./LegalPage.css";

export default function PrivacidadPage() {
  const { settings } = useSiteSettings();

  return (
    <div className="container legal-page">
      <h1>Aviso de privacidad</h1>
      <p>
        En {settings.businessName} recopilamos únicamente los datos necesarios para procesar tu pedido: nombre,
        teléfono, correo (opcional) y dirección de envío. Esta información se utiliza exclusivamente para coordinar
        tu compra por WhatsApp y para tu tarjeta de fidelidad.
      </p>

      <h2>Uso de tus datos</h2>
      <p>
        No compartimos tu información con terceros. Tus datos se almacenan de forma segura en nuestra base de datos y
        solo son visibles para el equipo de {settings.businessName}.
      </p>

      <h2>Contacto</h2>
      <p>
        Si tienes dudas sobre el manejo de tus datos, escríbenos a {settings.email} o por WhatsApp al{" "}
        {settings.phone}.
      </p>
    </div>
  );
}
