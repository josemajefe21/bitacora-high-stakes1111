// Configuración de Firebase
// Configuración real del proyecto "bitacora-high-stakes"

const firebaseConfig = {
  apiKey: "AIzaSyD0l5G0m876KUZYwDeoEVenWE_CCfcfFec",
  authDomain: "bitacora-high-stakes.firebaseapp.com",
  projectId: "bitacora-high-stakes",
  storageBucket: "bitacora-high-stakes.firebasestorage.app",
  messagingSenderId: "112704670494",
  appId: "1:112704670494:web:b491988862220968e9570f",
  measurementId: "G-1G2SCP2439"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener servicios
const auth = firebase.auth();
const db = firebase.firestore();

// Configuración de Firestore (simplificada para evitar warnings)
try {
  db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    ignoreUndefinedProperties: true,
    merge: true
  });
} catch (error) {
  // Los settings ya fueron aplicados, ignorar error
}

// Habilitar persistencia offline
db.enablePersistence({ synchronizeTabs: true })
  .then(() => {
    console.log('✅ Persistencia offline habilitada');
  })
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('⚠️ Persistencia falló - múltiples pestañas abiertas');
    } else if (err.code == 'unimplemented') {
      console.log('⚠️ Persistencia no soportada por el navegador');
    } else {
      console.log('⚠️ Error en persistencia:', err);
    }
  }); 