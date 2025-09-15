// Función auxiliar para insertar logo (bitmap monocromo sencilla)
export function buildLogoCommandFromBase64(base64Png) {
  // Para simplicidad: usar canvas para rasterizar en runtime (requiere DOM). Si se hace en worker, adaptar.
  // Aquí devolvemos placeholder (en producción usar escpos-encoder o raster real).
  // Placeholder: centrado y texto [LOGO]
  const encoder = new TextEncoder();
  const fake = '\n   [LOGO]\n';
  return encoder.encode(fake);
}