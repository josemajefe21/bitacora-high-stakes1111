// SCRIPT DE EMERGENCIA PARA ARREGLAR FIREBASE
// Ejecutar en la consola del navegador para solucionar problemas de permisos

console.log("🚨 INICIANDO REPARACIÓN DE EMERGENCIA DE FIREBASE");

// 1. Verificar conexión a Firebase
async function checkFirebaseConnection() {
  try {
    console.log("🔍 Verificando conexión a Firebase...");
    console.log("Auth:", auth);
    console.log("DB:", db);
    console.log("Usuario actual:", auth.currentUser);
    
    if (auth.currentUser) {
      console.log("✅ Usuario autenticado:", auth.currentUser.email);
      return true;
    } else {
      console.log("❌ Usuario no autenticado");
      return false;
    }
  } catch (error) {
    console.error("❌ Error de conexión:", error);
    return false;
  }
}

// 2. Intentar autenticación de emergencia
async function emergencyAuth() {
  try {
    console.log("🔐 Intentando reautenticación...");
    
    // Esperar a que Firebase se inicialice completamente
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar estado de autenticación
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        if (user) {
          console.log("✅ Usuario reautenticado:", user.email);
          resolve(user);
        } else {
          console.log("❌ No hay usuario autenticado");
          resolve(null);
        }
      });
    });
    
  } catch (error) {
    console.error("❌ Error en reautenticación:", error);
    return null;
  }
}

// 3. Intentar acceso directo a Firestore con diferentes configuraciones
async function testFirestoreAccess() {
  try {
    console.log("🔍 Probando acceso a Firestore...");
    
    const user = auth.currentUser;
    if (!user) {
      console.log("❌ No hay usuario para probar acceso");
      return false;
    }
    
    console.log("👤 Probando con usuario:", user.uid);
    
    // Probar lectura de colección de usuario
    const userRef = db.collection('users').doc(user.uid);
    const userSnap = await userRef.get();
    
    console.log("📄 Documento de usuario existe:", userSnap.exists);
    
    // Probar lectura de bitácoras
    const bitacorasRef = db.collection('users').doc(user.uid).collection('bitacoras');
    const bitacorasSnap = await bitacorasRef.get();
    
    console.log("📚 Bitácoras encontradas:", bitacorasSnap.size);
    
    // Mostrar las bitácoras encontradas
    bitacorasSnap.forEach(doc => {
      console.log("📖 Bitácora:", doc.id, doc.data().name);
    });
    
    return true;
    
  } catch (error) {
    console.error("❌ Error accediendo a Firestore:", error);
    console.log("📋 Detalles del error:", {
      code: error.code,
      message: error.message
    });
    return false;
  }
}

// 4. Configurar reglas de seguridad temporales (solo para mostrar las reglas correctas)
function showCorrectSecurityRules() {
  console.log("📋 REGLAS DE SEGURIDAD CORRECTAS PARA FIREBASE:");
  console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso completo para usuarios autenticados a sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Permitir acceso a las bitácoras del usuario
      match /bitacoras/{bitacoraId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Permitir acceso a la papelera del usuario
      match /trash/{trashId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
  `);
  
  console.log("🔧 Para aplicar estas reglas:");
  console.log("1. Ve a: https://console.firebase.google.com/project/bitacora-high-stakes/firestore/rules");
  console.log("2. Reemplaza las reglas existentes con las de arriba");
  console.log("3. Haz clic en 'Publicar'");
}

// 5. Función principal de reparación
async function emergencyFirebaseFix() {
  console.log("🚨 INICIANDO REPARACIÓN COMPLETA...");
  
  // Paso 1: Verificar conexión
  const connected = await checkFirebaseConnection();
  
  // Paso 2: Reautenticar si es necesario
  const user = await emergencyAuth();
  
  // Paso 3: Probar acceso a Firestore
  if (user) {
    const accessOk = await testFirestoreAccess();
    
    if (!accessOk) {
      console.log("❌ PROBLEMA DE PERMISOS CONFIRMADO");
      showCorrectSecurityRules();
    } else {
      console.log("✅ ACCESO A FIRESTORE FUNCIONANDO");
      
      // Intentar cargar datos manualmente
      try {
        console.log("🔄 Intentando cargar bitácoras manualmente...");
        await loadUserBitacoras();
        console.log("✅ Bitácoras cargadas exitosamente");
      } catch (error) {
        console.error("❌ Error cargando bitácoras:", error);
      }
    }
  } else {
    console.log("❌ PROBLEMA DE AUTENTICACIÓN");
    console.log("🔧 Intenta cerrar sesión y volver a iniciar sesión");
  }
}

// Ejecutar automáticamente
emergencyFirebaseFix();

console.log("📋 COMANDOS DISPONIBLES:");
console.log("- emergencyFirebaseFix() - Ejecutar reparación completa");
console.log("- checkFirebaseConnection() - Verificar conexión");
console.log("- testFirestoreAccess() - Probar acceso a datos");
console.log("- showCorrectSecurityRules() - Mostrar reglas correctas"); 