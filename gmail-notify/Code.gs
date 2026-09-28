// Google Apps Script: manda un correo desde tu propia cuenta de Gmail
// cada vez que entra un pedido nuevo en la tienda.
//
// Cómo instalarlo (una sola vez):
// 1. Entra a https://script.google.com con la cuenta de Gmail del dueño.
// 2. Proyecto nuevo -> borra el código de ejemplo -> pega TODO este archivo.
// 3. Cambia SECRETO y CORREO_DESTINO abajo por los tuyos.
// 4. Implementar -> Nueva implementación -> tipo "Aplicación web".
//      - Ejecutar como: Yo (tu cuenta)
//      - Quién tiene acceso: Cualquier usuario
// 5. Autoriza los permisos que pida Google (es tu propio script).
// 6. Copia la URL que te da (termina en /exec) y pégala en el admin de tu
//    sitio, en Configuración > Notificación de pedidos > URL de notificación.
//    En "Clave secreta" pon el mismo texto que pusiste en SECRETO.
//
// Si más adelante cambias el código de este script, tienes que volver a
// "Implementar -> Gestionar implementaciones -> editar -> Nueva versión"
// para que el cambio quede activo (la URL no cambia).

var SECRETO = "CAMBIA-ESTO-POR-UNA-CLAVE-TUYA";
var CORREO_DESTINO = "correo-del-dueno@gmail.com";

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput("solicitud inválida");
  }

  if (data.secret !== SECRETO) {
    return ContentService.createTextOutput("no autorizado");
  }

  var order = data.order || {};
  var customer = order.customer || {};
  var address = order.address || {};
  var items = order.items || [];

  var itemsText = items
    .map(function (item) {
      var linea = "• " + item.quantity + "x " + item.name;
      if (item.level) linea += " (" + item.level + ")";
      linea += " — $" + (item.price * item.quantity).toFixed(2);
      return linea;
    })
    .join("\n");

  var entregaTexto =
    order.shippingMethod === "nacional" ? "Envío a otras partes de México" : "Punto medio en Cd. Juárez";

  var cuerpo =
    "Nuevo pedido de " + (customer.nombre || "") + " " + (customer.apellido || "") + "\n" +
    "Tel: " + (customer.telefono || "") +
    (customer.correo ? "\nCorreo: " + customer.correo : "") +
    "\n\nProductos:\n" + itemsText +
    "\n\nTotal: $" + Number(order.total || 0).toFixed(2) +
    "\n\nEntrega: " + entregaTexto +
    (address.referencias ? "\nZona preferida: " + address.referencias : "") +
    "\nPago: " + (order.paymentMethod || "") +
    (order.notes ? "\n\nNotas: " + order.notes : "") +
    (order.id ? "\n\nPedido #" + order.id : "");

  MailApp.sendEmail({
    to: CORREO_DESTINO,
    subject: "🛍️ Nuevo pedido de " + (customer.nombre || "") + " — $" + Number(order.total || 0).toFixed(2),
    body: cuerpo,
  });

  return ContentService.createTextOutput("ok");
}
