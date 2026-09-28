import { formatPrice } from "./format";
import { SHIPPING_METHOD_LABELS, type CartLine, type OrderAddress, type OrderCustomer, type ShippingMethod } from "../types";

interface CheckoutMessageParams {
  businessName: string;
  items: CartLine[];
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  total: number;
  customer: OrderCustomer;
  address: OrderAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: string;
  notes?: string;
}

export function buildCheckoutMessage(params: CheckoutMessageParams): string {
  const { businessName, items, subtotal, discount, couponCode, total, customer, address, shippingMethod, paymentMethod, notes } =
    params;

  const lines: string[] = [];
  lines.push(`*Nuevo pedido — ${businessName}*`);
  lines.push("");
  lines.push("*Productos:*");
  for (const item of items) {
    const levelText = item.level ? ` (${item.level})` : "";
    lines.push(`• ${item.quantity}x ${item.name}${levelText} — ${formatPrice(item.price * item.quantity)}`);
  }
  lines.push("");
  lines.push(`Subtotal: ${formatPrice(subtotal)}`);
  if (discount > 0) {
    lines.push(`Cupón${couponCode ? ` (${couponCode})` : ""}: -${formatPrice(discount)}`);
  }
  lines.push(`*Total: ${formatPrice(total)}*`);
  lines.push("");
  lines.push("*Datos del cliente:*");
  lines.push(`Nombre: ${customer.nombre} ${customer.apellido}`);
  lines.push(`Teléfono: ${customer.telefono}`);
  if (customer.correo) lines.push(`Correo: ${customer.correo}`);
  lines.push("");
  lines.push(`*Método de entrega:* ${SHIPPING_METHOD_LABELS[shippingMethod]}`);
  if (shippingMethod === "punto-medio") {
    lines.push("Coordinamos el lugar y la hora exactos por este WhatsApp.");
    if (address.referencias) lines.push(`Zona o referencia preferida: ${address.referencias}`);
  } else {
    lines.push(`${address.calle}, ${address.colonia}`);
    lines.push(`${address.ciudad}, ${address.estado}, CP ${address.codigoPostal}`);
    lines.push(address.pais);
    if (address.referencias) lines.push(`Referencias: ${address.referencias}`);
  }
  lines.push("");
  lines.push(`*Método de pago:* ${paymentMethod}`);
  if (notes) {
    lines.push("");
    lines.push(`*Notas:* ${notes}`);
  }
  return lines.join("\n");
}

export function buildLoyaltyClaimMessage(businessName: string, customerName: string, rewardDescription: string): string {
  return [
    `*Reclamo de recompensa — ${businessName}*`,
    "",
    `Hola, soy ${customerName} y quiero reclamar mi recompensa:`,
    `🎁 ${rewardDescription}`,
  ].join("\n");
}
