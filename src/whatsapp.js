export function createOrderMessage(items) {
  const lines = ["Hello LiLuRi! I'd love to place an order:", ""];

  items.forEach(({ product, quantity, variation }) => {
    lines.push(`• ${product.name}${variation ? ` — ${variation}` : ""} × ${quantity}`);
  });

  lines.push("", "Please let me know the next steps. Thank you!");
  return lines.join("\n");
}
