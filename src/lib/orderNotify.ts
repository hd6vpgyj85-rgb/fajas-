import type { Order, OrderAddress, OrderCustomer, OrderItem, ShippingMethod } from "../types";

interface NotifyOrderInput {
  id: string;
  customer: OrderCustomer;
  address: OrderAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: Order["paymentMethod"];
  notes?: string;
  items: OrderItem[];
  total: number;
}

/**
 * Avisa al dueño de un pedido nuevo mandando los datos a la URL configurada en
 * Configuración > Notificación de pedidos (normalmente un Google Apps Script
 * que envía el correo). Es "fire and forget": si falla o no está configurado,
 * no debe interrumpir el checkout del cliente.
 */
export function notifyOwnerOfOrder(notifyUrl: string | null | undefined, secret: string | null | undefined, order: NotifyOrderInput) {
  if (!notifyUrl) return;

  try {
    fetch(notifyUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret: secret ?? "", order }),
    }).catch(() => {
      // silencioso: la notificación no debe romper el checkout
    });
  } catch {
    // silencioso: la notificación no debe romper el checkout
  }
}
