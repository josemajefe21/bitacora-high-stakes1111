// Sistema de navegación lateral
import storage from './storage.js';

// Clase Sidebar para manejar la navegación y gestión de bitácoras
export class Sidebar {
  constructor() {
    this.isOpen = true;
    this.bitacoras = [];
    this.initialize();
  }

  async initialize() {
    try {
      // Crear estructura del sidebar
      const sidebar = document.createElement('div');
      sidebar.className = 'sidebar';
      sidebar.innerHTML = `
        <div class="sidebar-header">
          <h2>🌱 Bitácora</h2>
          <button class="close-btn">×</button>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section">
            <h3>Bitácoras</h3>
            <ul id="bitacoras-list">
              <!-- Se llenará dinámicamente -->
            </ul>
            <button class="new-bitacora-btn" onclick="createNewBitacora()">+ Nueva Bitácora</button>
          </div>
          <div class="nav-section">
            <h3>Estadísticas</h3>
            <ul>
              <li><a href="#estado-animo" onclick="showStats('mood')">Estado de Ánimo</a></li>
              <li><a href="#ec-ph" onclick="showStats('ecph')">EC/pH</a></li>
              <li><a href="#riego" onclick="showStats('watering')">Frecuencia de Riego</a></li>
            </ul>
          </div>
        </nav>
      `;

      // Agregar estilos
      const style = document.createElement('style');
      style.textContent = `
        .sidebar {
          position: fixed;
          left: -300px;
          top: 0;
          width: 300px;
          height: 100vh;
          background: #1a1a1a;
          color: #fff;
          transition: left 0.3s ease;
          z-index: 1000;
          box-shadow: 2px 0 5px rgba(0,0,0,0.2);
          overflow-y: auto;
        }

        .sidebar.open {
          left: 0;
        }

        .sidebar-header {
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #333;
          background: #111;
        }

        .sidebar-header h2 {
          color: #4ade80;
          margin: 0;
          font-size: 1.5rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: #fff;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .close-btn:hover {
          background: #333;
        }

        .sidebar-nav {
          padding: 1rem;
        }

        .nav-section {
          margin-bottom: 2rem;
        }

        .nav-section h3 {
          color: #4ade80;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #333;
        }

        .sidebar-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sidebar-nav li {
          margin: 0.5rem 0;
        }

        .sidebar-nav a {
          color: #fff;
          text-decoration: none;
          display: block;
          padding: 0.75rem;
          border-radius: 4px;
          transition: all 0.2s;
          background: #222;
        }

        .sidebar-nav a:hover {
          background: #333;
          transform: translateX(5px);
        }

        .new-bitacora-btn {
          width: 100%;
          padding: 0.75rem;
          background: #4ade80;
          color: #1a1a1a;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 1rem;
          font-weight: bold;
          transition: all 0.2s;
        }

        .new-bitacora-btn:hover {
          background: #22c55e;
          transform: translateY(-2px);
        }

        .menu-toggle {
          position: fixed;
          left: 1rem;
          top: 1rem;
          z-index: 999;
          background: #4ade80;
          border: none;
          color: #1a1a1a;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: all 0.2s;
        }

        .menu-toggle:hover {
          background: #22c55e;
          transform: translateY(-2px);
        }

        @media (max-width: 600px) {
          .sidebar {
            width: 100%;
            left: -100%;
          }
          
          .menu-toggle {
            padding: 0.5rem 0.75rem;
            font-size: 0.9rem;
          }
        }
      `;

      // Agregar botón de toggle
      const menuToggle = document.createElement('button');
      menuToggle.className = 'menu-toggle';
      menuToggle.textContent = '☰ Menú';

      // Agregar elementos al DOM
      document.head.appendChild(style);
      document.body.appendChild(sidebar);
      document.body.appendChild(menuToggle);

      // Event listeners
      menuToggle.addEventListener('click', () => this.toggle());
      sidebar.querySelector('.close-btn').addEventListener('click', () => this.toggle());

      // Cerrar sidebar al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (this.isOpen && !sidebar.contains(e.target) && e.target !== menuToggle) {
          this.toggle();
        }
      });

      // Cargar bitácoras iniciales
      await this.loadBitacoras();
    } catch (error) {
      console.error('Error al inicializar sidebar:', error);
    }
  }

  async loadBitacoras() {
    try {
      const bitacoras = await storage.getItem('bitacoras') || [];
      if (!Array.isArray(bitacoras)) {
        console.warn('Las bitácoras no son un array:', bitacoras);
        return;
      }
      this.bitacoras = bitacoras;
      this.updateBitacorasList();
    } catch (error) {
      console.error('Error al cargar bitácoras:', error);
    }
  }

  updateBitacorasList() {
    const bitacorasList = document.getElementById('bitacoras-list');
    if (!bitacorasList) return;

    bitacorasList.innerHTML = this.bitacoras.map(bitacora => `
      <li class="bitacora-item" data-id="${bitacora.id}">
        <span class="bitacora-name">${bitacora.nombre || 'Sin nombre'}</span>
        <div class="bitacora-actions">
          <button class="edit-btn" onclick="sidebar.editBitacora('${bitacora.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" onclick="sidebar.deleteBitacora('${bitacora.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </li>
    `).join('');

    // Agregar event listeners para selección
    bitacorasList.querySelectorAll('.bitacora-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.bitacora-actions')) {
          this.selectBitacora(item.dataset.id);
        }
      });
    });
  }

  toggle() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      this.isOpen = !this.isOpen;
      sidebar.classList.toggle('collapsed', !this.isOpen);
    }
  }

  async createNewBitacora() {
    const nombre = prompt('Nombre de la nueva bitácora:');
    if (!nombre) return;

    try {
      const newBitacora = {
        id: Date.now().toString(),
        nombre,
        entries: [],
        createdAt: new Date().toISOString()
      };

      this.bitacoras.push(newBitacora);
      await storage.setItem('bitacoras', this.bitacoras);
      this.updateBitacorasList();
    } catch (error) {
      console.error('Error al crear bitácora:', error);
    }
  }

  async editBitacora(id) {
    const bitacora = this.bitacoras.find(b => b.id === id);
    if (!bitacora) return;

    const newNombre = prompt('Nuevo nombre de la bitácora:', bitacora.nombre);
    if (!newNombre) return;

    try {
      bitacora.nombre = newNombre;
      await storage.setItem('bitacoras', this.bitacoras);
      this.updateBitacorasList();
    } catch (error) {
      console.error('Error al editar bitácora:', error);
    }
  }

  async deleteBitacora(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta bitácora?')) return;

    try {
      this.bitacoras = this.bitacoras.filter(b => b.id !== id);
      await storage.setItem('bitacoras', this.bitacoras);
      this.updateBitacorasList();
    } catch (error) {
      console.error('Error al eliminar bitácora:', error);
    }
  }

  selectBitacora(id) {
    const bitacora = this.bitacoras.find(b => b.id === id);
    if (!bitacora) return;

    // Actualizar UI
    document.querySelectorAll('.bitacora-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.id === id);
    });

    // Emitir evento de selección
    const event = new CustomEvent('bitacoraSelected', { detail: bitacora });
    document.dispatchEvent(event);
  }
}

// Función global para mostrar estadísticas
window.showStats = function(type) {
  const statsContainer = document.getElementById('statsContainer');
  if (!statsContainer) return;

  // Ocultar todos los gráficos
  document.querySelectorAll('.chart-container').forEach(container => {
    container.style.display = 'none';
  });

  // Mostrar el gráfico seleccionado
  const selectedChart = document.getElementById(`${type}Chart`);
  if (selectedChart) {
    selectedChart.parentElement.style.display = 'block';
  }

  // Cerrar el sidebar en móvil
  if (window.innerWidth <= 600) {
    sidebar.toggle();
  }
};

// Exportar instancia única
const sidebar = new Sidebar();
export default sidebar; 