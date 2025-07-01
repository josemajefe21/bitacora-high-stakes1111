// SCRIPT DE PROTECCIÓN Y FIX INMEDIATO
// Este script agrega protecciones para prevenir más pérdidas de datos

console.log("🛡️ APLICANDO PROTECCIONES DE EMERGENCIA...");

// 1. Respaldo automático antes de cualquier operación crítica
const originalSaveBitacoraToFirestore = window.saveBitacoraToFirestore;
window.saveBitacoraToFirestore = async function(bitacora) {
  // Crear respaldo antes de guardar
  try {
    const backup = JSON.stringify({
      timestamp: new Date().toISOString(),
      bitacora: JSON.parse(JSON.stringify(bitacora)), // Deep copy
      operation: 'save'
    });
    localStorage.setItem(`backup_${bitacora.id}_${Date.now()}`, backup);
    console.log("✅ Respaldo creado antes de guardar:", bitacora.name);
  } catch (error) {
    console.error("❌ Error creando respaldo:", error);
  }
  
  // Llamar función original
  return originalSaveBitacoraToFirestore.call(this, bitacora);
};

// 2. Proteger función de edición
const originalSaveEditedEntry = window.saveEditedEntry;
if (originalSaveEditedEntry) {
  window.saveEditedEntry = async function() {
    console.log("🔒 Protegiendo edición de entrada...");
    
    // Verificar que tenemos datos válidos
    if (!selectedBitacora || !userBitacoras || userBitacoras.length === 0) {
      alert("❌ Error: No hay datos válidos para editar. Cancela esta operación.");
      return;
    }
    
    // Crear respaldo antes de editar
    try {
      const backup = JSON.stringify({
        timestamp: new Date().toISOString(),
        userBitacoras: JSON.parse(JSON.stringify(userBitacoras)),
        selectedBitacora: JSON.parse(JSON.stringify(selectedBitacora)),
        operation: 'edit'
      });
      localStorage.setItem(`edit_backup_${Date.now()}`, backup);
      console.log("✅ Respaldo de edición creado");
    } catch (error) {
      console.error("❌ Error en respaldo de edición:", error);
    }
    
    // Llamar función original
    return originalSaveEditedEntry.call(this);
  };
}

// 3. Proteger updateWeeklySummary
const originalUpdateWeeklySummary = window.updateWeeklySummary;
if (originalUpdateWeeklySummary) {
  window.updateWeeklySummary = async function() {
    console.log("🔒 Protegiendo actualización de resumen semanal...");
    
    // Solo actualizar UI, NO modificar datos de la bitácora
    if (!selectedBitacora) return;

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const getEntries = () => {
      if (!selectedBitacora) return [];
      return selectedBitacora.entries[selectedStage] || [];
    };

    const weekEntries = getEntries().filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= today;
    });

    // Actualizar SOLO la UI
    document.getElementById('totalEntries').textContent = weekEntries.length;
    
    const moods = weekEntries.map(e => e.mood).filter(m => m);
    const avgMood = moods.length ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : '-';
    document.getElementById('averageMood').textContent = avgMood;
    
    const wateredDays = weekEntries.filter(e => e.didWater).length;
    document.getElementById('wateredDays').textContent = wateredDays;

    const timeline = document.getElementById('emotionTimeline');
    timeline.innerHTML = weekEntries.map(entry => `
      <div class="emotion-dot" style="background-color: ${moodStates.find(m => m.value === entry.mood)?.color}"
           title="${entry.date}"></div>
    `).join('');

    console.log("✅ UI actualizada sin modificar datos");
  };
}

// 4. Función de recuperación mejorada
window.emergencyRestore = function() {
  console.log("🔄 Iniciando restauración de emergencia...");
  
  // Buscar todos los respaldos en localStorage
  const backups = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('backup_') || key.startsWith('edit_backup_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        backups.push({ key, ...data });
      } catch (error) {
        console.error("Error leyendo respaldo:", key, error);
      }
    }
  }
  
  if (backups.length > 0) {
    // Ordenar por timestamp más reciente
    backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log(`📦 Encontrados ${backups.length} respaldos`);
    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.timestamp} - ${backup.operation}`);
    });
    
    // Restaurar el más reciente
    const latestBackup = backups[0];
    if (latestBackup.userBitacoras) {
      userBitacoras = latestBackup.userBitacoras;
      renderBitacoraSelector();
      if (userBitacoras.length > 0) {
        selectBitacora(userBitacoras[0].id);
      }
      alert(`✅ Datos restaurados desde respaldo del ${latestBackup.timestamp}`);
      console.log("✅ Restauración completada");
    }
  } else {
    console.log("❌ No se encontraron respaldos");
    alert("No se encontraron respaldos locales");
  }
};

// 5. Activar respaldo automático cada 5 minutos
setInterval(() => {
  if (userBitacoras && userBitacoras.length > 0) {
    try {
      const autoBackup = JSON.stringify({
        timestamp: new Date().toISOString(),
        userBitacoras: userBitacoras,
        operation: 'auto'
      });
      localStorage.setItem(`auto_backup_${Date.now()}`, autoBackup);
      console.log("🔄 Respaldo automático creado");
      
      // Mantener solo los últimos 10 respaldos automáticos
      const autoBackupKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('auto_backup_')) {
          autoBackupKeys.push(key);
        }
      }
      
      if (autoBackupKeys.length > 10) {
        autoBackupKeys.sort();
        for (let i = 0; i < autoBackupKeys.length - 10; i++) {
          localStorage.removeItem(autoBackupKeys[i]);
        }
      }
    } catch (error) {
      console.error("Error en respaldo automático:", error);
    }
  }
}, 5 * 60 * 1000); // 5 minutos

console.log("✅ PROTECCIONES APLICADAS");
console.log("📞 Comandos disponibles:");
console.log("emergencyRestore() - Restaurar desde respaldo más reciente");
console.log("emergencyDataRecovery() - Búsqueda completa de datos");

// Auto-ejecutar recuperación si no hay datos
if (!userBitacoras || userBitacoras.length === 0) {
  console.log("⚠️ No hay datos cargados, ejecutando recuperación automática...");
  setTimeout(() => {
    if (typeof emergencyDataRecovery === 'function') {
      emergencyDataRecovery();
    }
  }, 2000);
} 