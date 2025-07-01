// SCRIPT DE RECUPERACIÓN DE EMERGENCIA
// Ejecutar en la consola del navegador

async function emergencyDataRecovery() {
  console.log("🚨 INICIANDO RECUPERACIÓN DE EMERGENCIA 🚨");
  
  const recoveredData = {
    localStorage: null,
    memory: null,
    firebase: null
  };

  // 1. Verificar localStorage
  try {
    const localData = localStorage.getItem('bitacoras');
    if (localData) {
      recoveredData.localStorage = JSON.parse(localData);
      console.log("✅ Datos encontrados en localStorage:", recoveredData.localStorage);
    } else {
      console.log("❌ No hay datos en localStorage");
    }
  } catch (error) {
    console.error("Error al leer localStorage:", error);
  }

  // 2. Verificar datos en memoria
  try {
    if (typeof userBitacoras !== 'undefined' && userBitacoras.length > 0) {
      recoveredData.memory = userBitacoras;
      console.log("✅ Datos encontrados en memoria:", recoveredData.memory);
    } else {
      console.log("❌ No hay datos en memoria");
    }
  } catch (error) {
    console.error("Error al verificar memoria:", error);
  }

  // 3. Verificar Firebase
  try {
    if (currentUser && db) {
      const snapshot = await db.collection('users').doc(currentUser.uid).collection('bitacoras').get();
      const firebaseData = [];
      snapshot.forEach(doc => {
        firebaseData.push({ id: doc.id, ...doc.data() });
      });
      recoveredData.firebase = firebaseData;
      console.log("✅ Datos encontrados en Firebase:", recoveredData.firebase);
    } else {
      console.log("❌ No hay conexión a Firebase o usuario no autenticado");
    }
  } catch (error) {
    console.error("Error al leer Firebase:", error);
  }

  // 4. Análisis de recuperación
  console.log("\n📊 ANÁLISIS DE RECUPERACIÓN:");
  
  let bestSource = null;
  let maxEntries = 0;

  ['localStorage', 'memory', 'firebase'].forEach(source => {
    const data = recoveredData[source];
    if (data && Array.isArray(data)) {
      const totalEntries = data.reduce((total, bitacora) => {
        if (bitacora.entries) {
          const vegeEntries = bitacora.entries.vege?.length || 0;
          const floraEntries = bitacora.entries.flora?.length || 0;
          const generalEntries = bitacora.entries.general?.length || 0;
          return total + vegeEntries + floraEntries + generalEntries;
        }
        return total;
      }, 0);
      
      console.log(`${source}: ${data.length} bitácoras, ${totalEntries} entradas totales`);
      
      if (totalEntries > maxEntries) {
        maxEntries = totalEntries;
        bestSource = source;
      }
    }
  });

  if (bestSource) {
    console.log(`\n🎯 MEJOR FUENTE DE DATOS: ${bestSource} (${maxEntries} entradas)`);
    console.log("🔧 Intentando restaurar datos...");
    
    // Restaurar datos
    try {
      userBitacoras = recoveredData[bestSource];
      
      // Recargar UI
      renderBitacoraSelector();
      if (userBitacoras.length > 0) {
        selectBitacora(userBitacoras[0].id);
      }
      
      console.log("✅ DATOS RESTAURADOS EXITOSAMENTE");
      alert(`¡Datos recuperados! Se encontraron ${maxEntries} entradas. Los datos han sido restaurados desde ${bestSource}.`);
      
    } catch (error) {
      console.error("Error al restaurar datos:", error);
      alert("Error al restaurar los datos. Por favor revisa la consola para más detalles.");
    }
  } else {
    console.log("❌ NO SE ENCONTRARON DATOS PARA RECUPERAR");
    alert("No se pudieron encontrar datos para recuperar. Es posible que se hayan perdido permanentemente.");
  }

  return recoveredData;
}

// Función para crear respaldo de emergencia
function createEmergencyBackup() {
  if (typeof userBitacoras !== 'undefined' && userBitacoras.length > 0) {
    const backup = {
      timestamp: new Date().toISOString(),
      data: userBitacoras,
      source: 'emergency-backup'
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitacora-emergency-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log("✅ Respaldo de emergencia creado y descargado");
  } else {
    console.log("❌ No hay datos para respaldar");
  }
}

// Ejecutar automáticamente
emergencyDataRecovery();

console.log("\n🆘 COMANDOS DISPONIBLES:");
console.log("emergencyDataRecovery() - Volver a ejecutar recuperación");
console.log("createEmergencyBackup() - Crear respaldo de los datos actuales"); 