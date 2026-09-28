import { DEFAULT_CATEGORY_IMAGES, type SiteSettings } from "../types";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  businessName: "beautylat",
  tagline: "Fajas, ropa y accesorios para realzar tu figura",
  logoUrl: null,
  heroTitle: "Realza tu figura, con estilo",
  heroSubtitle: "Fajas, ropa y accesorios seleccionados para lucir y sentirte increíble todos los días.",
  heroImage: "/images/hero.svg",
  storePhoto: "/images/store.svg",
  categoryImages: DEFAULT_CATEGORY_IMAGES,
  whatsappNumber: "526561234567",
  phone: "+52 656 123 4567",
  email: "contacto@beautylat.mx",
  address: "Av. Paseo Triunfo de la República 3401, Cd. Juárez, Chih.",
  hours: "Lunes a sábado · 10:00 a 20:00",
  instagramUrl: "https://instagram.com/beautylat.mx",
  facebookUrl: "https://facebook.com/beautylat.mx",
  tiktokUrl: null,
  mapUrl: "https://maps.google.com/?q=Beautylat+Ciudad+Juarez",
  updatedAt: new Date(0).toISOString(),
};

export function getWhatsAppUrl(whatsappNumber: string, message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber}?text=${encoded}`;
}
