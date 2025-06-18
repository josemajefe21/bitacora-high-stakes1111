import auth from './auth.js';
import storage from './storage.js';
import { showNotification } from './notifications.js';

// Función para mostrar/ocultar elementos de forma segura
function toggleElement(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = show ? 'block' : 'none';
    }
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Verificar estado de autenticación
        const user = await auth.getCurrentUser();
        
        // Mostrar/ocultar elementos según el estado de autenticación
        if (user) {
            toggleElement('auth-container', false);
            toggleElement('main-content', true);
            toggleElement('sidebar', true);
        } else {
            toggleElement('auth-container', true);
            toggleElement('main-content', false);
            toggleElement('sidebar', false);
        }
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        showNotification('Error al inicializar la aplicación', 'error');
    }
});

// Manejo de eventos de autenticación
window.handleLogin = async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;

    if (!email || !password) {
        showNotification('Por favor, completa todos los campos', 'error');
        return;
    }

    try {
        await auth.login(email, password);
        showNotification('Inicio de sesión exitoso', 'success');
        toggleElement('auth-container', false);
        toggleElement('main-content', true);
        toggleElement('sidebar', true);
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        showNotification('Error al iniciar sesión', 'error');
    }
};

window.handleRegister = async (event) => {
    event.preventDefault();
    const email = document.getElementById('register-email')?.value;
    const password = document.getElementById('register-password')?.value;

    if (!email || !password) {
        showNotification('Por favor, completa todos los campos', 'error');
        return;
    }

    try {
        await auth.register(email, password);
        showNotification('Registro exitoso', 'success');
        toggleElement('auth-container', false);
        toggleElement('main-content', true);
        toggleElement('sidebar', true);
    } catch (error) {
        console.error('Error al registrar:', error);
        showNotification('Error al registrar', 'error');
    }
};

window.handleLogout = async () => {
    try {
        await auth.logout();
        showNotification('Sesión cerrada exitosamente', 'success');
        toggleElement('auth-container', true);
        toggleElement('main-content', false);
        toggleElement('sidebar', false);
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        showNotification('Error al cerrar sesión', 'error');
    }
}; 