// Edge Function de Supabase: envía un correo al dueño de la tienda cuando llega un pedido nuevo.
// Se despliega desde el Dashboard de Supabase (Edge Functions → Deploy a new function).
// Requiere los secretos RESEND_API_KEY y WEBHOOK_SECRET (ver supabase/notifications.sql).

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Pedidos <onboarding@resend.dev>";

interface OrderItem {
  name: string;
  level?: string;
  quantity: number;
  price: number;
}

interface OrderPayload {
  id?: string;
  customer?: { nombre?: string; apellido?: string; telefono?: string; correo?: string };
  address?: { referencias?: string };
  shipping_method?: string;
  payment_method?: string;
  notes?: string | null;
  items?: OrderItem[];
  total?: number;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c
  );
}

const SHIPPING_LABELS: Record<string, string> = {
  "punto-medio": "Punto medio en Cd. Juárez",
  nacional: "Envío a otras partes de México",
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!WEBHOOK_SECRET || req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!RESEND_API_KEY) {
    return new Response("Falta configurar RESEND_API_KEY", { status: 500 });
  }

  let payload: { record?: OrderPayload; owner_email?: string };
  try {
    payload = await req.json();
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }

  const order = payload.record;
  const ownerEmail = payload.owner_email;

  if (!order || !ownerEmail) {
    return new Response("Faltan datos del pedido o el correo del dueño", { status: 400 });
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const customer = order.customer ?? {};
  const address = order.address ?? {};
  const shippingLabel = SHIPPING_LABELS[order.shipping_method ?? ""] ?? "Punto medio en Cd. Juárez";

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #f0e4e9;">
            ${escapeHtml(item.quantity)}x ${escapeHtml(item.name)}${item.level ? ` (${escapeHtml(item.level)})` : ""}
          </td>
          <td style="padding:8px 10px;border-bottom:1px solid #f0e4e9;text-align:right;white-space:nowrap;">
            ${formatPrice((item.price ?? 0) * (item.quantity ?? 0))}
          </td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#2b1620;">
      <h2 style="color:#b3355a;margin-bottom:4px;">🛍️ Nuevo pedido</h2>
      <p style="margin:0 0 16px;color:#7a5a63;">Recibiste un pedido nuevo por la tienda en línea.</p>

      <p style="margin:0 0 4px;">
        <strong>${escapeHtml(customer.nombre)} ${escapeHtml(customer.apellido)}</strong><br />
        Tel: ${escapeHtml(customer.telefono)}
        ${customer.correo ? `<br />Correo: ${escapeHtml(customer.correo)}` : ""}
      </p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${itemsHtml}
      </table>

      <p style="font-size:18px;font-weight:bold;margin:12px 0;">Total: ${formatPrice(order.total ?? 0)}</p>

      <p style="margin:0 0 4px;"><strong>Entrega:</strong> ${escapeHtml(shippingLabel)}</p>
      ${address.referencias ? `<p style="margin:0 0 4px;"><strong>Zona preferida:</strong> ${escapeHtml(address.referencias)}</p>` : ""}
      <p style="margin:0 0 4px;"><strong>Pago:</strong> ${escapeHtml(order.payment_method)}</p>
      ${order.notes ? `<p style="margin:0 0 4px;"><strong>Notas:</strong> ${escapeHtml(order.notes)}</p>` : ""}

      <p style="margin-top:24px;font-size:12px;color:#a08a91;">Pedido #${escapeHtml(order.id)}</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [ownerEmail],
      subject: `Nuevo pedido de ${customer.nombre ?? ""} — ${formatPrice(order.total ?? 0)}`,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Resend error:", text);
    return new Response(text, { status: 502 });
  }

  return new Response("ok", { status: 200 });
});
