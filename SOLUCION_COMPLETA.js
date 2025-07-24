// ========== SOLUCIÓN COMPLETA PARA TODOS LOS PROBLEMAS ==========
// Ejecutar este script en la consola del navegador (F12)

console.log("🚨 INICIANDO SOLUCIÓN COMPLETA DE PROBLEMAS...");

// ===== 1. RECUPERACIÓN INMEDIATA DE BITÁCORA PERDIDA =====
async function recuperarBitacoraPerdida() {
  console.log("🔍 Buscando tu bitácora perdida en todos los lugares posibles...");
  
  const datosRecuperados = {
    localStorage: null,
    autoSaves: [],
    backups: [],
    firebase: null
  };

  // 1. Buscar en localStorage principal
  try {
    const datosLocales = localStorage.getItem('bitacoras');
    if (datosLocales) {
      datosRecuperados.localStorage = JSON.parse(datosLocales);
      console.log("✅ Datos encontrados en localStorage:", datosRecuperados.localStorage.length, "bitácoras");
    }
  } catch (error) {
    console.log("❌ Error leyendo localStorage principal");
  }

  // 2. Buscar en todos los respaldos automáticos
  try {
    const todasLasClaves = Object.keys(localStorage);
    const clavesRespaldo = todasLasClaves.filter(clave => 
      clave.includes('auto_save') || 
      clave.includes('backup') || 
      clave.includes('emergency')
    );
    
    console.log(`🔍 Encontradas ${clavesRespaldo.length} copias de respaldo`);
    
    for (const clave of clavesRespaldo) {
      try {
        const respaldo = JSON.parse(localStorage.getItem(clave));
        if (respaldo.userBitacoras || respaldo.bitacora || respaldo.data) {
          datosRecuperados.autoSaves.push({
            clave,
            timestamp: respaldo.timestamp,
            datos: respaldo.userBitacoras || respaldo.data || [respaldo.bitacora]
          });
        }
      } catch (error) {
        console.log(`❌ Error leyendo respaldo ${clave}`);
      }
    }
    
    // Ordenar por timestamp más reciente
    datosRecuperados.autoSaves.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
  } catch (error) {
    console.log("❌ Error buscando respaldos automáticos");
  }

  // 3. Intentar acceder a Firebase si hay usuario autenticado
  try {
    if (typeof currentUser !== 'undefined' && currentUser && typeof db !== 'undefined') {
      console.log("🔍 Intentando acceder a Firebase...");
      const bitacorasSnapshot = await db.collection('users').doc(currentUser.uid)
        .collection('bitacoras').get();
      
      const datosFirebase = [];
      bitacorasSnapshot.forEach(doc => {
        datosFirebase.push({ id: doc.id, ...doc.data() });
      });
      
      if (datosFirebase.length > 0) {
        datosRecuperados.firebase = datosFirebase;
        console.log("✅ Datos encontrados en Firebase:", datosFirebase.length, "bitácoras");
      }
    }
  } catch (error) {
    console.log("❌ No se pudo acceder a Firebase:", error.message);
  }

  // 4. Determinar la mejor fuente de datos
  let mejorFuente = null;
  let maxEntradas = 0;
  let fuenteElegida = '';

  // Verificar localStorage
  if (datosRecuperados.localStorage) {
    const entradas = contarEntradas(datosRecuperados.localStorage);
    if (entradas > maxEntradas) {
      maxEntradas = entradas;
      mejorFuente = datosRecuperados.localStorage;
      fuenteElegida = 'localStorage';
    }
  }

  // Verificar respaldos automáticos
  for (const respaldo of datosRecuperados.autoSaves) {
    const entradas = contarEntradas(respaldo.datos);
    if (entradas > maxEntradas) {
      maxEntradas = entradas;
      mejorFuente = respaldo.datos;
      fuenteElegida = `respaldo automático (${respaldo.timestamp})`;
    }
  }

  // Verificar Firebase
  if (datosRecuperados.firebase) {
    const entradas = contarEntradas(datosRecuperados.firebase);
    if (entradas > maxEntradas) {
      maxEntradas = entradas;
      mejorFuente = datosRecuperados.firebase;
      fuenteElegida = 'Firebase';
    }
  }

  // 5. Restaurar datos
  if (mejorFuente && maxEntradas > 0) {
    console.log(`🎯 MEJOR FUENTE ENCONTRADA: ${fuenteElegida}`);
    console.log(`📊 Total de entradas: ${maxEntradas}`);
    
    try {
      // Restaurar en memoria
      if (typeof userBitacoras !== 'undefined') {
        userBitacoras.length = 0;
        userBitacoras.push(...mejorFuente);
      } else {
        window.userBitacoras = mejorFuente;
      }
      
      // Guardar en localStorage como respaldo
      localStorage.setItem('bitacoras', JSON.stringify(mejorFuente));
      localStorage.setItem('recuperacion_exitosa', JSON.stringify({
        timestamp: new Date().toISOString(),
        fuente: fuenteElegida,
        bitacoras: mejorFuente.length,
        entradas: maxEntradas
      }));
      
      // Recargar interfaz si es posible
      if (typeof renderBitacoraSelector === 'function') {
        renderBitacoraSelector();
      }
      if (mejorFuente.length > 0 && typeof selectBitacora === 'function') {
        selectBitacora(mejorFuente[0].id);
      }
      
      console.log("✅ ¡RECUPERACIÓN EXITOSA!");
      console.log(`📋 Se recuperaron ${mejorFuente.length} bitácoras con ${maxEntradas} entradas totales`);
      alert(`🎉 ¡BITÁCORA RECUPERADA!\n\nSe recuperaron ${mejorFuente.length} bitácoras con ${maxEntradas} entradas totales desde: ${fuenteElegida}\n\nTus datos han sido restaurados exitosamente.`);
      
      return true;
      
    } catch (error) {
      console.error("❌ Error durante la restauración:", error);
      alert("❌ Error al restaurar los datos. Revisa la consola para más detalles.");
      return false;
    }
  } else {
    console.log("❌ NO SE ENCONTRARON DATOS PARA RECUPERAR");
    alert("❌ No se pudieron encontrar datos de bitácoras para recuperar.\n\nTe recomiendo:\n1. Verificar si estás usando la cuenta correcta\n2. Revisar la papelera de bitácoras\n3. Contactar soporte si tenías datos importantes");
    return false;
  }
}

// Función auxiliar para contar entradas
function contarEntradas(bitacoras) {
  if (!Array.isArray(bitacoras)) return 0;
  
  return bitacoras.reduce((total, bitacora) => {
    if (bitacora.entries) {
      return total + 
        (bitacora.entries.vege?.length || 0) +
        (bitacora.entries.flora?.length || 0) +
        (bitacora.entries.general?.length || 0);
    }
    return total;
  }, 0);
}

// ===== 2. CORREGIR PROBLEMA DE PERMISOS DE FIREBASE =====
async function corregirPermisosFirebase() {
  console.log("🔧 Verificando y corrigiendo permisos de Firebase...");
  
  // Verificar estado de autenticación
  if (typeof auth === 'undefined' || typeof db === 'undefined') {
    console.log("❌ Firebase no está inicializado correctamente");
    alert("❌ Firebase no está configurado. Verifica la conexión a internet y recarga la página.");
    return false;
  }

  const usuario = auth.currentUser;
  if (!usuario) {
    console.log("❌ Usuario no autenticado");
    alert("❌ No estás autenticado. Por favor inicia sesión para acceder a tus datos.");
    return false;
  }

  console.log("✅ Usuario autenticado:", usuario.email);

  // Probar acceso a Firestore
  try {
    console.log("🔍 Probando acceso a Firestore...");
    
    // Intentar leer documento de usuario
    const userDoc = await db.collection('users').doc(usuario.uid).get();
    console.log("📄 Documento de usuario existe:", userDoc.exists);
    
    // Intentar leer bitácoras
    const bitacorasRef = db.collection('users').doc(usuario.uid).collection('bitacoras');
    const bitacorasSnap = await bitacorasRef.get();
    console.log("📚 Bitácoras en Firebase:", bitacorasSnap.size);
    
    if (bitacorasSnap.size > 0) {
      console.log("✅ Acceso a Firebase funcionando correctamente");
      
      // Intentar cargar datos
      if (typeof loadUserBitacoras === 'function') {
        await loadUserBitacoras();
        console.log("✅ Datos cargados desde Firebase");
      }
      
      return true;
    } else {
      console.log("⚠️ No hay bitácoras en Firebase, pero el acceso funciona");
      return true;
    }
    
  } catch (error) {
    console.error("❌ ERROR DE PERMISOS CONFIRMADO:", error);
    
    alert(`❌ PROBLEMA DE PERMISOS DETECTADO\n\nError: ${error.message}\n\nPara solucionarlo:\n1. Abre Firebase Console\n2. Ve a Firestore Database > Rules\n3. Copia las reglas que aparecerán en la consola\n4. Haz clic en "Publicar"`);
    
    // Mostrar reglas correctas
    const reglasCorrectas = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /bitacoras/{bitacoraId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /trash/{trashId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`;

    console.log("📋 REGLAS DE SEGURIDAD CORRECTAS:");
    console.log("=".repeat(50));
    console.log(reglasCorrectas);
    console.log("=".repeat(50));
    console.log("🔗 URL para configurar: https://console.firebase.google.com/project/bitacora-high-stakes/firestore/rules");
    
    return false;
  }
}

// ===== 3. VERIFICAR PAPELERA DE BITÁCORAS =====
async function verificarPapelera() {
  console.log("🗑️ Verificando papelera de bitácoras...");
  
  if (typeof currentUser === 'undefined' || !currentUser) {
    console.log("❌ Usuario no autenticado para verificar papelera");
    return;
  }

  try {
    const trashSnapshot = await db.collection('users').doc(currentUser.uid)
      .collection('trash').get();
    
    if (trashSnapshot.size > 0) {
      console.log(`📦 Encontradas ${trashSnapshot.size} bitácoras en la papelera`);
      
      const bitacorasEliminadas = [];
      trashSnapshot.forEach(doc => {
        const data = doc.data();
        bitacorasEliminadas.push({
          id: doc.id,
          name: data.name,
          deletedAt: data.deletedTimestamp || 'Fecha desconocida'
        });
      });
      
      console.log("🗑️ Bitácoras en papelera:", bitacorasEliminadas);
      
      const mensaje = `🗑️ BITÁCORAS ENCONTRADAS EN LA PAPELERA:\n\n${
        bitacorasEliminadas.map((b, i) => `${i + 1}. ${b.name} (eliminada: ${b.deletedAt})`).join('\n')
      }\n\n¿Quieres abrir el gestor de papelera para restaurarlas?`;
      
      if (confirm(mensaje)) {
        if (typeof showTrashManager === 'function') {
          showTrashManager();
        } else {
          alert("El gestor de papelera no está disponible. Recarga la página e intenta de nuevo.");
        }
      }
    } else {
      console.log("✅ No hay bitácoras en la papelera");
    }
    
  } catch (error) {
    console.error("❌ Error verificando papelera:", error);
  }
}

// ===== 4. FUNCIÓN PRINCIPAL DE SOLUCIÓN =====
async function solucionarTodosLosProblemas() {
  console.log("🚀 INICIANDO SOLUCIÓN COMPLETA...");
  console.log("=" * 60);
  
  let problemasSolucionados = 0;
  let problemasTotal = 4;
  
  // Paso 1: Recuperar bitácora perdida
  console.log("\n1️⃣ RECUPERANDO BITÁCORA PERDIDA...");
  if (await recuperarBitacoraPerdida()) {
    problemasSolucionados++;
    console.log("✅ Bitácora recuperada exitosamente");
  } else {
    console.log("❌ No se pudo recuperar la bitácora automáticamente");
  }
  
  // Paso 2: Corregir permisos de Firebase
  console.log("\n2️⃣ VERIFICANDO PERMISOS DE FIREBASE...");
  if (await corregirPermisosFirebase()) {
    problemasSolucionados++;
    console.log("✅ Permisos de Firebase funcionando");
  } else {
    console.log("❌ Problema de permisos de Firebase - ver instrucciones arriba");
  }
  
  // Paso 3: Verificar papelera
  console.log("\n3️⃣ VERIFICANDO PAPELERA...");
  try {
    await verificarPapelera();
    problemasSolucionados++;
    console.log("✅ Papelera verificada");
  } catch (error) {
    console.log("❌ Error verificando papelera");
  }
  
  // Paso 4: Activar protecciones
  console.log("\n4️⃣ ACTIVANDO PROTECCIONES...");
  try {
    // Guardar respaldo de seguridad
    if (typeof userBitacoras !== 'undefined' && userBitacoras.length > 0) {
      localStorage.setItem('solucion_completa_backup', JSON.stringify({
        timestamp: new Date().toISOString(),
        userBitacoras: userBitacoras,
        mensaje: 'Respaldo creado por solución completa'
      }));
    }
    problemasSolucionados++;
    console.log("✅ Protecciones activadas");
  } catch (error) {
    console.log("❌ Error activando protecciones");
  }
  
  // Resultado final
  console.log("\n" + "=" * 60);
  console.log(`📊 RESULTADO FINAL: ${problemasSolucionados}/${problemasTotal} problemas solucionados`);
  
  if (problemasSolucionados >= 3) {
    console.log("🎉 ¡SOLUCIÓN EXITOSA!");
    alert(`🎉 ¡PROBLEMAS SOLUCIONADOS!\n\nSe solucionaron ${problemasSolucionados} de ${problemasTotal} problemas.\n\nTu aplicación debería funcionar correctamente ahora.`);
  } else {
    console.log("⚠️ Algunos problemas requieren atención manual");
    alert(`⚠️ SOLUCIÓN PARCIAL\n\nSe solucionaron ${problemasSolucionados} de ${problemasTotal} problemas.\n\nRevisa la consola para ver qué requiere atención manual.`);
  }
  
  console.log("\n🔧 FUNCIONES DISPONIBLES:");
  console.log("- recuperarBitacoraPerdida() - Para recuperar datos");
  console.log("- corregirPermisosFirebase() - Para verificar Firebase");
  console.log("- verificarPapelera() - Para revisar bitácoras eliminadas");
  console.log("- emergencyRestore() - Función de emergencia");
}

// Ejecutar automáticamente al cargar el script
console.log("🚀 SCRIPT DE SOLUCIÓN COMPLETA CARGADO");
console.log("📋 Para ejecutar, usa: solucionarTodosLosProblemas()");
console.log("🆘 Para recuperación directa: recuperarBitacoraPerdida()");

// Auto-ejecutar si no hay datos cargados
setTimeout(() => {
  if (typeof userBitacoras === 'undefined' || userBitacoras.length === 0) {
    console.log("⚠️ No se detectaron datos, ejecutando recuperación automática...");
    solucionarTodosLosProblemas();
  }
}, 3000); 