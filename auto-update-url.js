#!/usr/bin/env node

// 🚀 SCRIPT AUTO-UPDATE URL PRINCIPAL
// Automatiza la actualización de la URL principal después de cada deploy

const { execSync } = require('child_process');

console.log('🚀 Iniciando auto-actualización de URL principal...');

try {
  // 1. Hacer deploy a producción
  console.log('📦 Haciendo deploy a producción...');
  const deployOutput = execSync('npx vercel --prod --yes', { encoding: 'utf8' });
  
  // Extraer URL del deploy
  const urlMatch = deployOutput.match(/✅\s+Production:\s+(https:\/\/[^\s]+)/);
  if (!urlMatch) {
    throw new Error('No se pudo extraer la URL del deploy');
  }
  
  const deployUrl = urlMatch[1];
  console.log(`✅ Deploy completado: ${deployUrl}`);
  
  // 2. Actualizar alias principal
  console.log('🔗 Actualizando URL principal...');
  execSync(`npx vercel alias ${deployUrl} bitacora-high-stakes.vercel.app`, { 
    encoding: 'utf8' 
  });
  
  console.log('✅ URL principal actualizada exitosamente!');
  console.log('');
  console.log('🌐 URL PRINCIPAL PARA USAR:');
  console.log('📱 https://bitacora-high-stakes.vercel.app');
  console.log('');
  console.log('💡 Esta URL siempre tendrá la versión más reciente');
  console.log('📲 Guárdala en el inicio de tu celular para acceso rápido');

} catch (error) {
  console.error('❌ Error durante la actualización:', error.message);
  process.exit(1);
} 