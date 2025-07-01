// 🧹 SCRIPT PARA LIMPIAR ENTRADAS FALSAS
// Ejecutar en la consola del navegador (F12 > Console)

function cleanFakeEntries() {
  console.log("🧹 Iniciando limpieza de entradas falsas...");
  
  if (!selectedBitacora || !userBitacoras) {
    console.error("❌ No hay bitácora seleccionada");
    return;
  }

  let totalCleaned = 0;
  const bitacoraIndex = userBitacoras.findIndex(b => b.id === selectedBitacora.id);
  
  if (bitacoraIndex === -1) {
    console.error("❌ Bitácora no encontrada");
    return;
  }

  // Patrones de texto sospechoso que indican entradas falsas
  const fakePatterns = [
    'revisar las plantas, regar con nutrientes',
    'poda de hojas amarillas',
    'observar crecimiento',
    'riego regular, ajustar ph',
    'entrenamiento lst',
    'doblar ramas',
    'limpieza del espacio',
    'aspirar hojas',
    'riego con fertilizante',
    'revisar temperatura',
    'observación detallada',
    'fotos de progreso',
    'advanced nutrients',
    'plantas en buen estado general'
  ];

  // Limpiar cada etapa
  ['vege', 'flora', 'general'].forEach(stage => {
    if (userBitacoras[bitacoraIndex].entries[stage]) {
      const before = userBitacoras[bitacoraIndex].entries[stage].length;
      
      userBitacoras[bitacoraIndex].entries[stage] = userBitacoras[bitacoraIndex].entries[stage].filter(entry => {
        // Verificar texto sospechoso
        const tasks = (entry.tasks || '').toLowerCase();
        const notes = (entry.notes || '').toLowerCase();
        const nutrients = (entry.nutrients || '').toLowerCase();
        
        const hasFakeText = fakePatterns.some(pattern => 
          tasks.includes(pattern) || notes.includes(pattern) || nutrients.includes(pattern)
        );
        
        // Verificar valores típicos de ejemplo
        const hasExamplePH = entry.ph && /^[6-7]\.\d$/.test(entry.ph);
        const hasExampleEC = entry.ec && /^[1-2]\.\d$/.test(entry.ec);
        
        if (hasFakeText || (hasExamplePH && hasExampleEC)) {
          totalCleaned++;
          console.log(`🗑️ Eliminando entrada falsa: ${entry.date} - ${entry.tasks?.substring(0, 50)}...`);
          return false; // Eliminar
        }
        
        return true; // Mantener
      });
      
      const after = userBitacoras[bitacoraIndex].entries[stage].length;
      if (before > after) {
        console.log(`✅ Etapa ${stage}: ${before - after} entradas falsas eliminadas`);
      }
    }
  });

  // Actualizar bitácora seleccionada
  selectedBitacora = userBitacoras[bitacoraIndex];

  // Guardar cambios
  if (currentUser) {
    saveBitacoraToFirestore(selectedBitacora)
      .then(() => console.log("💾 Cambios guardados en Firebase"))
      .catch(error => console.error("❌ Error guardando:", error));
  }

  // Actualizar interfaz
  renderHistory();
  renderCalendar();
  updateWeeklySummary();

  console.log(`🎯 LIMPIEZA COMPLETADA: ${totalCleaned} entradas falsas eliminadas`);
  
  if (totalCleaned > 0) {
    alert(`✅ Limpieza exitosa!\n\n${totalCleaned} entradas falsas eliminadas.\nTus datos reales están seguros.`);
  } else {
    alert("✅ No se encontraron entradas falsas.\nTus datos están limpios.");
  }
}

// Ejecutar la limpieza
cleanFakeEntries(); 