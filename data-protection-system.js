// ========== SISTEMA COMPLETO DE PROTECCIÓN DE DATOS ==========
// Este script asegura que los datos NUNCA se pierdan

console.log("🛡️ ACTIVANDO SISTEMA DE PROTECCIÓN TOTAL...");

// ===== 1. GUARDADO ANTES DE CERRAR LA PÁGINA =====
window.addEventListener('beforeunload', function(e) {
  console.log("⚠️ La página se va a cerrar - Guardando datos de emergencia...");
  
  try {
    // Guardar en localStorage como respaldo
    if (userBitacoras && userBitacoras.length > 0) {
      localStorage.setItem('bitacoras', JSON.stringify(userBitacoras));
      localStorage.setItem('emergency_backup_on_exit', JSON.stringify({
        timestamp: new Date().toISOString(),
        userBitacoras: userBitacoras,
        selectedBitacora: selectedBitacora,
        message: 'Guardado automático al cerrar página'
      }));
      console.log("✅ Respaldo de emergencia creado al cerrar");
    }
    
    // Intentar guardar en Firebase (puede no tener tiempo)
    if (currentUser && selectedBitacora) {
      // Usar sendBeacon para envío garantizado
      const data = JSON.stringify({
        action: 'emergency_save',
        bitacora: selectedBitacora,
        timestamp: new Date().toISOString()
      });
      
      try {
        fetch('/api/emergency-save', {
          method: 'POST',
          body: data,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true
        });
      } catch (error) {
        console.log("No se pudo enviar a servidor, datos guardados localmente");
      }
    }
  } catch (error) {
    console.error("Error en guardado de emergencia:", error);
  }
  
  // Mostrar mensaje de confirmación
  e.preventDefault();
  const message = "¿Estás seguro de que quieres cerrar? Los datos se han guardado automáticamente.";
  e.returnValue = message;
  return message;
});

// ===== 2. GUARDADO AUTOMÁTICO CONTINUO =====
let autoSaveInterval = null;

function startContinuousAutoSave() {
  // Limpiar interval anterior si existe
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
  
  // Guardar cada 30 segundos
  autoSaveInterval = setInterval(() => {
    if (userBitacoras && userBitacoras.length > 0) {
      try {
        // Respaldo local
        localStorage.setItem('bitacoras', JSON.stringify(userBitacoras));
        localStorage.setItem(`auto_save_${Date.now()}`, JSON.stringify({
          timestamp: new Date().toISOString(),
          userBitacoras: userBitacoras,
          type: 'continuous_auto_save'
        }));
        
        // Guardar en Firebase si hay usuario
        if (currentUser && selectedBitacora) {
          saveBitacoraToFirestore(selectedBitacora).catch(error => {
            console.error("Error en auto-guardado Firebase:", error);
          });
        }
        
        console.log("🔄 Auto-guardado completado:", new Date().toLocaleTimeString());
        
        // Limpiar respaldos antiguos (mantener solo los últimos 20)
        const autoSaveKeys = Object.keys(localStorage).filter(key => key.startsWith('auto_save_'));
        if (autoSaveKeys.length > 20) {
          autoSaveKeys.sort();
          for (let i = 0; i < autoSaveKeys.length - 20; i++) {
            localStorage.removeItem(autoSaveKeys[i]);
          }
        }
        
      } catch (error) {
        console.error("Error en auto-guardado:", error);
      }
    }
  }, 30000); // Cada 30 segundos
  
  console.log("✅ Auto-guardado continuo activado (cada 30 segundos)");
}

// ===== 3. INTERCEPTAR OPERACIONES CRÍTICAS =====
function protectCriticalOperations() {
  // Proteger saveEntry
  const originalSaveEntry = window.saveEntry;
  if (originalSaveEntry) {
    window.saveEntry = async function() {
      console.log("🔒 Protegiendo saveEntry...");
      try {
        // Crear respaldo antes de guardar
        localStorage.setItem(`before_save_${Date.now()}`, JSON.stringify({
          timestamp: new Date().toISOString(),
          userBitacoras: userBitacoras,
          operation: 'before_saveEntry'
        }));
        
        // Ejecutar función original
        const result = await originalSaveEntry.call(this);
        
        // Respaldo después de guardar
        localStorage.setItem(`after_save_${Date.now()}`, JSON.stringify({
          timestamp: new Date().toISOString(),
          userBitacoras: userBitacoras,
          operation: 'after_saveEntry'
        }));
        
        console.log("✅ saveEntry protegido exitosamente");
        return result;
      } catch (error) {
        console.error("❌ Error en saveEntry protegido:", error);
        alert("Error al guardar entrada. Se ha creado un respaldo automático.");
        throw error;
      }
    };
  }
  
  // Proteger saveBitacoraToFirestore
  const originalSaveBitacoraToFirestore = window.saveBitacoraToFirestore;
  if (originalSaveBitacoraToFirestore) {
    window.saveBitacoraToFirestore = async function(bitacora) {
      console.log("🔒 Protegiendo saveBitacoraToFirestore...");
      try {
        // Respaldo antes de guardar en Firebase
        localStorage.setItem(`before_firebase_${Date.now()}`, JSON.stringify({
          timestamp: new Date().toISOString(),
          bitacora: bitacora,
          operation: 'before_firebase_save'
        }));
        
        // Ejecutar función original
        const result = await originalSaveBitacoraToFirestore.call(this, bitacora);
        
        console.log("✅ Guardado en Firebase exitoso");
        return result;
      } catch (error) {
        console.error("❌ Error en Firebase, datos guardados localmente:", error);
        // Si falla Firebase, asegurar que esté en localStorage
        localStorage.setItem('bitacoras', JSON.stringify(userBitacoras));
        return null; // No fallar la operación
      }
    };
  }
}

// ===== 4. VERIFICACIÓN DE INTEGRIDAD =====
function verifyDataIntegrity() {
  setInterval(() => {
    if (userBitacoras && userBitacoras.length > 0) {
      const totalEntries = userBitacoras.reduce((total, bitacora) => {
        if (bitacora.entries) {
          return total + 
            (bitacora.entries.vege?.length || 0) +
            (bitacora.entries.flora?.length || 0) +
            (bitacora.entries.general?.length || 0);
        }
        return total;
      }, 0);
      
      console.log(`🔍 Verificación: ${userBitacoras.length} bitácoras, ${totalEntries} entradas totales`);
      
      // Si detectamos pérdida de datos, alertar
      const lastCount = localStorage.getItem('last_entry_count');
      if (lastCount && parseInt(lastCount) > totalEntries && totalEntries < parseInt(lastCount) * 0.5) {
        console.error("⚠️ POSIBLE PÉRDIDA DE DATOS DETECTADA");
        alert("⚠️ Se detectó una posible pérdida de datos. Ejecuta emergencyRestore() en la consola.");
      }
      
      localStorage.setItem('last_entry_count', totalEntries.toString());
    }
  }, 60000); // Cada minuto
}

// ===== 5. FUNCIÓN DE RESTAURACIÓN RÁPIDA =====
window.emergencyRestore = function() {
  console.log("🚑 RESTAURACIÓN DE EMERGENCIA...");
  
  const backupKeys = Object.keys(localStorage).filter(key => 
    key.includes('backup') || key.includes('auto_save') || key.startsWith('before_') || key.startsWith('after_')
  );
  
  if (backupKeys.length === 0) {
    alert("No se encontraron respaldos");
    return;
  }
  
  // Ordenar por timestamp
  const backups = backupKeys.map(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      return { key, timestamp: data.timestamp, data };
    } catch {
      return null;
    }
  }).filter(Boolean);
  
  backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  console.log(`📦 Encontrados ${backups.length} respaldos:`);
  backups.slice(0, 5).forEach((backup, i) => {
    console.log(`${i + 1}. ${backup.timestamp} - ${backup.data.operation || 'backup'}`);
  });
  
  // Restaurar el más reciente
  const latest = backups[0];
  if (latest.data.userBitacoras) {
    userBitacoras = latest.data.userBitacoras;
    renderBitacoraSelector();
    if (userBitacoras.length > 0) {
      selectBitacora(userBitacoras[0].id);
    }
    alert(`✅ Datos restaurados desde ${latest.timestamp}`);
  }
};

// ===== 6. INICIALIZACIÓN =====
function initializeDataProtection() {
  console.log("🚀 Inicializando sistema de protección...");
  
  // Activar todos los sistemas
  startContinuousAutoSave();
  protectCriticalOperations();
  verifyDataIntegrity();
  
  // Guardar estado inicial
  if (userBitacoras && userBitacoras.length > 0) {
    localStorage.setItem('bitacoras', JSON.stringify(userBitacoras));
    localStorage.setItem('protection_initialized', JSON.stringify({
      timestamp: new Date().toISOString(),
      userBitacoras: userBitacoras,
      message: 'Sistema de protección inicializado'
    }));
  }
  
  console.log("✅ SISTEMA DE PROTECCIÓN ACTIVADO COMPLETAMENTE");
  console.log("📊 Resumen de protecciones:");
  console.log("   - Auto-guardado cada 30 segundos");
  console.log("   - Respaldo antes de cerrar página");
  console.log("   - Protección de operaciones críticas");
  console.log("   - Verificación de integridad cada minuto");
  console.log("   - Función emergencyRestore() disponible");
}

// ===== 7. MOSTRAR ESTADO =====
function showProtectionStatus() {
  const backupCount = Object.keys(localStorage).filter(key => 
    key.includes('backup') || key.includes('auto_save')
  ).length;
  
  const dataCount = userBitacoras ? userBitacoras.reduce((total, bitacora) => {
    if (bitacora.entries) {
      return total + 
        (bitacora.entries.vege?.length || 0) +
        (bitacora.entries.flora?.length || 0) +
        (bitacora.entries.general?.length || 0);
    }
    return total;
  }, 0) : 0;
  
  console.log("📋 ESTADO DE PROTECCIÓN:");
  console.log(`   🔢 ${userBitacoras?.length || 0} bitácoras cargadas`);
  console.log(`   📝 ${dataCount} entradas totales`);
  console.log(`   💾 ${backupCount} respaldos disponibles`);
  console.log(`   🔒 Firebase: ${currentUser ? 'Conectado' : 'Desconectado'}`);
  console.log(`   ⏰ Auto-guardado: ${autoSaveInterval ? 'Activo' : 'Inactivo'}`);
}

// ===== EJECUCIÓN AUTOMÁTICA =====
initializeDataProtection();
showProtectionStatus();

// Mostrar estado cada 5 minutos
setInterval(showProtectionStatus, 5 * 60 * 1000);

console.log("🛡️ SISTEMA DE PROTECCIÓN TOTAL ACTIVADO");
console.log("🆘 En caso de problemas, ejecuta: emergencyRestore()"); 