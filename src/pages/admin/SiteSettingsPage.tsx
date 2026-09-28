import { useState } from "react";
import { useSiteSettings, type SiteSettingsInput } from "../../context/SiteSettingsContext";
import { uploadSiteImage } from "../../lib/imageUpload";
import { CATEGORIES, CATEGORY_IMAGE_KEYS, type Category, type CategoryImageKey, type SiteSettings } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./adminShared.css";
import "./SiteSettingsPage.css";

const CATEGORY_IMAGE_LABELS: Record<CategoryImageKey, string> = {
  ...(Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.name])) as Record<Category, string>),
  ofertas: "Ofertas",
};

export default function SiteSettingsPage() {
  const { settings, loading } = useSiteSettings();

  if (loading) return <LoadingSpinner />;

  return <SiteSettingsForm key={settings.updatedAt} initial={settings} />;
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadSiteImage(file));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      alert(`No se pudo subir la imagen: ${message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="site-settings-image-field">
      <span className="site-settings-image-label">{label}</span>
      <div className="site-settings-image-row">
        {value ? <img src={value} alt={label} /> : <div className="site-settings-image-placeholder" />}
        <div className="site-settings-image-actions">
          <label className="admin-btn-sm">
            {uploading ? "Subiendo…" : "Cambiar"}
            <input type="file" accept="image/*" hidden onChange={(e) => handleUpload(e.target.files?.[0])} />
          </label>
          {value && (
            <button type="button" className="admin-btn-sm danger" onClick={() => onChange(null)}>
              Quitar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const { updateSettings } = useSiteSettings();

  const [businessName, setBusinessName] = useState(initial.businessName);
  const [tagline, setTagline] = useState(initial.tagline);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? null);
  const [heroTitle, setHeroTitle] = useState(initial.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(initial.heroSubtitle);
  const [heroImage, setHeroImage] = useState(initial.heroImage ?? null);
  const [storePhoto, setStorePhoto] = useState(initial.storePhoto ?? null);
  const [categoryImages, setCategoryImages] = useState(initial.categoryImages);
  const [whatsappNumber, setWhatsappNumber] = useState(initial.whatsappNumber);
  const [phone, setPhone] = useState(initial.phone);
  const [email, setEmail] = useState(initial.email);
  const [address, setAddress] = useState(initial.address);
  const [hours, setHours] = useState(initial.hours);
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl ?? "");
  const [facebookUrl, setFacebookUrl] = useState(initial.facebookUrl ?? "");
  const [tiktokUrl, setTiktokUrl] = useState(initial.tiktokUrl ?? "");
  const [mapUrl, setMapUrl] = useState(initial.mapUrl ?? "");
  const [orderNotifyUrl, setOrderNotifyUrl] = useState(initial.orderNotifyUrl ?? "");
  const [orderNotifySecret, setOrderNotifySecret] = useState(initial.orderNotifySecret ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const setCategoryImage = (key: CategoryImageKey, url: string | null) => {
    setCategoryImages((prev) => {
      if (url === null) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: url };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const input: SiteSettingsInput = {
      businessName: businessName.trim(),
      tagline: tagline.trim(),
      logoUrl,
      heroTitle: heroTitle.trim(),
      heroSubtitle: heroSubtitle.trim(),
      heroImage,
      storePhoto,
      categoryImages,
      whatsappNumber: whatsappNumber.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      hours: hours.trim(),
      instagramUrl: instagramUrl.trim() || null,
      facebookUrl: facebookUrl.trim() || null,
      tiktokUrl: tiktokUrl.trim() || null,
      mapUrl: mapUrl.trim() || null,
      orderNotifyUrl: orderNotifyUrl.trim() || null,
      orderNotifySecret: orderNotifySecret.trim() || null,
    };

    try {
      await updateSettings(input);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="product-form site-settings-form" onSubmit={handleSubmit}>
      <div className="admin-page-header">
        <h1>Configuración del sitio</h1>
      </div>

      <section className="site-settings-section">
        <h2>Identidad</h2>
        <ImageField label="Logo (opcional, si no hay se muestra el nombre)" value={logoUrl} onChange={setLogoUrl} />
        <div className="admin-form-field">
          <label>Nombre del negocio</label>
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        </div>
        <div className="admin-form-field">
          <label>Descripción corta (tagline)</label>
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} required />
        </div>
      </section>

      <section className="site-settings-section">
        <h2>Portada de inicio</h2>
        <ImageField label="Imagen de fondo del hero" value={heroImage} onChange={setHeroImage} />
        <div className="admin-form-field">
          <label>Título</label>
          <input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} required />
        </div>
        <div className="admin-form-field">
          <label>Subtítulo</label>
          <textarea rows={2} value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} required />
        </div>
      </section>

      <section className="site-settings-section">
        <h2>Imágenes de categorías</h2>
        <div className="site-settings-image-grid">
          {CATEGORY_IMAGE_KEYS.map((key) => (
            <ImageField
              key={key}
              label={CATEGORY_IMAGE_LABELS[key]}
              value={categoryImages[key]}
              onChange={(url) => setCategoryImage(key, url)}
            />
          ))}
        </div>
      </section>

      <section className="site-settings-section">
        <h2>Foto de la tienda</h2>
        <ImageField label="Foto usada en 'Viste con estilo' y pies de categoría" value={storePhoto} onChange={setStorePhoto} />
      </section>

      <section className="site-settings-section">
        <h2>Contacto y WhatsApp</h2>
        <div className="admin-form-field">
          <label>Número de WhatsApp (con código de país, sin espacios ni +)</label>
          <input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="526561234567" required />
        </div>
        <div className="admin-form-row">
          <div className="admin-form-field">
            <label>Teléfono para mostrar</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="admin-form-field">
            <label>Correo</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div className="admin-form-field">
          <label>Dirección</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} required />
        </div>
        <div className="admin-form-field">
          <label>Horario</label>
          <input value={hours} onChange={(e) => setHours(e.target.value)} required />
        </div>
        <div className="admin-form-field">
          <label>Link de Google Maps (opcional)</label>
          <input value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder="https://maps.google.com/…" />
        </div>
      </section>

      <section className="site-settings-section">
        <h2>Redes sociales (opcional)</h2>
        <div className="admin-form-field">
          <label>Instagram</label>
          <input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/…" />
        </div>
        <div className="admin-form-field">
          <label>Facebook</label>
          <input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/…" />
        </div>
        <div className="admin-form-field">
          <label>TikTok</label>
          <input value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://tiktok.com/@…" />
        </div>
      </section>

      <section className="site-settings-section">
        <h2>Notificación de pedidos por correo (opcional)</h2>
        <p className="site-settings-hint">
          Para que te llegue un correo a Gmail cada vez que entra un pedido, conecta un script de Google Apps Script y
          pega aquí la URL que te da al publicarlo. Deja estos campos vacíos si todavía no lo configuras.
        </p>
        <div className="admin-form-field">
          <label>URL de notificación</label>
          <input
            value={orderNotifyUrl}
            onChange={(e) => setOrderNotifyUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/…/exec"
          />
        </div>
        <div className="admin-form-field">
          <label>Clave secreta</label>
          <input
            value={orderNotifySecret}
            onChange={(e) => setOrderNotifySecret(e.target.value)}
            placeholder="La misma clave que pusiste en el script"
          />
        </div>
      </section>

      {error && <p className="checkout-coupon-error">{error}</p>}
      {saved && <p className="checkout-coupon-ok">Configuración guardada ✓</p>}

      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
