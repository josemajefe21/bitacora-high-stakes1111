// ========== SOLUCION PARA EL PROBLEMA DEL ICONO ==========
// Este script crea iconos PNG alternativos para solucionar el error del manifest

console.log("🎨 Solucionando problema del icono...");

// Función para crear un icono PNG desde canvas
function crearIconoPNG(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Fondo verde
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(0, 0, size, size);
  
  // Borde redondeado (simulado)
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.25);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  
  // Círculos blancos (diseño similar al SVG)
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.02;
  
  // Círculo exterior
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.25, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Círculo medio
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.18, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Círculo interior (lleno)
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.1, 0, 2 * Math.PI);
  ctx.fill();
  
  return canvas.toDataURL('image/png');
}

// Crear iconos de diferentes tamaños
const iconos = {
  '192': crearIconoPNG(192),
  '512': crearIconoPNG(512),
  '96': crearIconoPNG(96),
  '48': crearIconoPNG(48),
  '32': crearIconoPNG(32)
};

console.log("✅ Iconos PNG creados exitosamente");

// Función para descargar iconos
function descargarIconos() {
  Object.entries(iconos).forEach(([size, dataUrl]) => {
    const link = document.createElement('a');
    link.download = `icon-${size}.png`;
    link.href = dataUrl;
    link.click();
  });
  console.log("📥 Iconos descargados. Súbelos a la carpeta icons/");
}

// Mostrar nuevo manifest.json corregido
function mostrarManifestCorregido() {
  const manifestCorregido = {
    "name": "Bitácora High Stakes",
    "short_name": "Bitácora",
    "description": "Bitácora para seguimiento de cultivos",
    "start_url": "./indexPVZ.html",
    "display": "standalone",
    "background_color": "#f3f4f6",
    "theme_color": "#4ade80",
    "icons": [
      {
        "src": "icons/icon-48.png",
        "sizes": "48x48",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "icons/icon-96.png",
        "sizes": "96x96",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "icons/icon-192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "icons/icon-512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ]
  };
  
  console.log("📋 MANIFEST.JSON CORREGIDO:");
  console.log("=".repeat(50));
  console.log(JSON.stringify(manifestCorregido, null, 2));
  console.log("=".repeat(50));
  console.log("💡 Copia este contenido y reemplaza tu manifest.json actual");
}

// Ejecutar solución
console.log("🔧 Para solucionar el problema del icono:");
console.log("1. Ejecuta: descargarIconos()");
console.log("2. Ejecuta: mostrarManifestCorregido()");
console.log("3. Sube los iconos PNG a la carpeta icons/");
console.log("4. Reemplaza el contenido de manifest.json");

// Función todo-en-uno
function solucionarProblemaIcono() {
  console.log("🎨 Solucionando problema del icono...");
  descargarIconos();
  mostrarManifestCorregido();
  alert("🎨 Solución del icono:\n\n1. Se han descargado iconos PNG alternativos\n2. Ve a la consola para el nuevo manifest.json\n3. Sube los iconos a la carpeta icons/\n4. Actualiza manifest.json con el nuevo contenido");
}

// Auto-ejecutar
setTimeout(() => {
  console.log("🔍 ¿Quieres solucionar el problema del icono automáticamente?");
  console.log("👉 Ejecuta: solucionarProblemaIcono()");
}, 1000);

// Exportar funciones
window.descargarIconos = descargarIconos;
window.mostrarManifestCorregido = mostrarManifestCorregido;
window.solucionarProblemaIcono = solucionarProblemaIcono; 