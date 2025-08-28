
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';


// SESION INICIADA
(function protegerRuta() {

  const token = localStorage.getItem('token');

  if (!token) {

    window.location.href = './index.html';
  }
})();


document.addEventListener('DOMContentLoaded', () => {

  // --- CONFIGURACIÓN Y SELECTORES ---
  const API_BASE_URL = 'http://localhost:3000';

  const modal = new bootstrap.Modal(document.getElementById('dataModal'));
  const loader = document.getElementById('loader');
  const dataTable = document.getElementById('data-table');
  const tableHeader = document.getElementById('table-header');
  const crudTitle = document.getElementById('crud-title');
  const formFields = document.getElementById('form-fields');
  const dataForm = document.getElementById('dataForm');
  const searchInput = document.getElementById('searchInput');

  let currentCrud = 'usuarios'; // CRUD activo por defecto
  let allData = []; // Almacenar todos los datos para el filtrado

  // --- DEFINICIONES DE CADA CRUD ---
  const crudConfig = {
    usuarios: {
      endpoint: '/api/ciudadanos',
      title: 'Gestión de Ciudadanos',
      // --- CORREGIDO ---
      // Se ajustó "Apellidos" a "Apellido", se eliminó "Apodo" y se reorganizaron las cabeceras.
      headers: ['Código', 'Nombre', 'Apellido', 'Nacimiento', 'Origen', 'Residencia', 'Foto', 'QR', 'Acciones'],

      // --- CORREGIDO ---
      // Se cambió el name y label de "apellidos" a "apellido" y se eliminó el campo "apodo".
      fields: [
        { name: 'codigo', label: 'Código', type: 'text', required: true },
        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
        { name: 'apellido', label: 'Apellido', type: 'text', required: true }, // CORREGIDO
        { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date', required: true, editableOnUpdate: false },
        { name: 'planeta_origen', label: 'Planeta de origen', type: 'text', required: true, editableOnUpdate: false },
        { name: 'planeta_residencia', label: 'Planeta de residencia', type: 'text', required: true },
        { name: 'foto', label: 'Foto de ciudadano', type: 'file', required: true }
      ],

      // --- CORREGIDO ---
      // Se usan los nombres de propiedad correctos (apellido, qr) y se muestra la imagen.
      renderRow: (item) => `
                        <tr data-id="${item.id}">
                            <td>${item.codigo}</td>
                            <td>${item.nombre}</td>
                            <td>${item.apellido}</td>
                            <td>${new Date(item.fecha_nacimiento).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}</td>
                            <td>${item.planeta_origen}</td>
                            <td>${item.planeta_residencia}</td>
                            <td>
                                ${item.foto ? `<img src="${API_BASE_URL}${item.foto}" alt="Foto" width="50" class="img-thumbnail">` : 'N/A'}
                            </td>
                            <td>
                                ${item.qr ? `<img src="${API_BASE_URL}${item.qr}" alt="QR" width="50">` : 'N/A'}
                            </td>
                            <td>
                                <button class="btn btn-warning btn-sm btn-editar" title="Editar"><i class="bi bi-pencil-square"></i></button>
                                <button class="btn btn-danger btn-sm btn-eliminar" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
                            </td>
                        </tr>`
    }
  };

  // --- FUNCIONES CORE ---

  // Muestra/oculta el spinner
  const showLoader = (show) => {
    loader.style.display = show ? 'block' : 'none';
    dataTable.style.display = show ? 'none' : '';
  };

  // Renderiza la tabla completa
  const renderTable = (data) => {
    const config = crudConfig[currentCrud];
    tableHeader.innerHTML = config.headers.map(h => `<th>${h}</th>`).join('');
    dataTable.innerHTML = data.map(config.renderRow).join('');
  };

  // Carga los datos desde la API
  async function loadData() {
    loader.classList.remove('d-none');
    dataTable.innerHTML = ''; // Correcto

    // 👈 Obtiene el token de localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      // En caso de que no exista el token, redirige a login
      window.location.href = './index.html';
      return;
    }

    try {
      const config = crudConfig[currentCrud];
      // 👈 Envía el token en el encabezado Authorization
      const response = await fetch(`${API_BASE_URL}${config.endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar los datos.');
      }

      const data = await response.json();
      allData = data;
      renderTable(data);

    } catch (error) {

      console.error(error);
      showToast('Error al cargar los datos', 'danger');

    } finally {
      loader.classList.add('d-none');
    }
  };
  // Cambia entre los diferentes CRUDs
  const switchCrud = (crudName) => {
    currentCrud = crudName;
    const config = crudConfig[currentCrud];

    // Actualizar título y links activos
    crudTitle.textContent = config.title;
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.crud === crudName);
    });

    searchInput.value = '';
    loadData();
  };

  // Renderiza los campos del formulario dinámicamente

  const renderFormFields = (data = {}) => {
    const config = crudConfig[currentCrud];
    formFields.innerHTML = config.fields.map(field => {
      let value = data[field.name] || '';

      // Formatear la fecha si existe
      if (field.type === 'date' && value) {
        value = new Date(value).toISOString().split('T')[0];
      }

      const isEditing = data && data.codigo;
      const isReadOnly = isEditing && field.editableOnUpdate === false;

      let imagePreview = '';
      if (field.type === 'file' && data[field.name]) {
        imagePreview = `<img src="${data[field.name]}" alt="Vista previa" class="img-thumbnail mt-2" width="100">`;
      }

      return `
            <div class="mb-3">
                <label for="${field.name}" class="form-label">${field.label}</label>
                <input 
                    type="${field.type}" 
                    
                 
                    class="form-control" 
                    id="${field.name}" 
                    value="${field.type !== 'file' ? value : ''}"
                    ${isReadOnly ? 'readonly' : ''} 
                >
                ${imagePreview}
            </div>
        `;
    }).join('');
  };

  // --- EVENT LISTENERS ---

  // Navegación del Sidebar
  document.querySelector('.sidebar').addEventListener('click', (e) => {
    const link = e.target.closest('.nav-link');
    if (link && link.dataset.crud) {
      e.preventDefault();
      switchCrud(link.dataset.crud);
    }
  });

  // Botón "Crear Nuevo"
  document.getElementById('btnNuevo').addEventListener('click', () => {
    dataForm.reset();
    document.getElementById('dataId').value = '';
    document.getElementById('modalTitle').textContent = `Crear Nuevo ${currentCrud.slice(0, -1)}`;
    renderFormFields();
    modal.show();
  });

  // Submit del formulario (Crear/Editar)

  // main.js

  dataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('dataId').value;
    const config = crudConfig[currentCrud];
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}${config.endpoint}/${id}` : `${API_BASE_URL}${config.endpoint}`;

    // --- PASO 1: OBTENER EL TOKEN ---
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No se encontró el token de autenticación. Por favor, inicie sesión de nuevo.');
      window.location.href = './index.html';
      return;
    }

    try {
      // --- PASO 2: USAR FormData PARA MANEJAR ARCHIVOS Y DATOS ---
      const formData = new FormData();

      // Agregar los campos del formulario al FormData
      config.fields.forEach(field => {
        const input = document.getElementById(field.name);
        if (field.type === 'file') {
          if (input.files[0]) {
            formData.append(field.name, input.files[0]);
          }
        } else if (input) {

          if (method === 'PUT' && field.editableOnUpdate === false) {
            return;
          }
          formData.append(field.name, input.value);
        }
      });



      const response = await fetch(url, {
        method: method,
        headers: {

          'Authorization': `Bearer ${token}`

        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ mensaje: 'Error desconocido en el servidor' }));
        throw new Error(errorData.mensaje || `Error ${response.status}`);
      }

      modal.hide();
      loadData();

      const operacion = method === 'POST' ? 'creado' : 'actualizado';
      Toastify({
        text: `Registro ${operacion} con éxito`,
        duration: 3000,
        gravity: "bottom",
        position: "right",
        backgroundColor: method === 'POST' ? '#007bff' : '#2fa12dff',
      }).showToast();

    } catch (error) {
      console.error('Error al guardar:', error);
      Toastify({
        text: `Error: ${error.message}`,
        duration: 5000,
        gravity: "bottom",
        position: "right",
        backgroundColor: "#dc3545",
      }).showToast();
    }
  });

  // Acciones en la tabla (Editar/Eliminar)
  dataTable.addEventListener('click', async (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const row = button.closest('tr');
    const id = row.dataset.id;
    const config = crudConfig[currentCrud];
    const token = localStorage.getItem('token'); // Obtener token para ambas operaciones

    if (!token) {
      alert('Sesión expirada, por favor inicie sesión de nuevo.');
      return;
    }

    // --- LÓGICA PARA EDITAR (CORREGIDA) ---
    if (button.classList.contains('btn-editar')) {
      try {
        // 1. URL corregida y se añade el token de autorización
        const response = await fetch(`${API_BASE_URL}${config.endpoint}/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Registro no encontrado para editar.');
        }

        // 2. La API devuelve el objeto directamente, no anidado en "data"
        const data = await response.json();

        // 3. Se usa el "id" numérico para el formulario, que es lo que espera el PUT
        document.getElementById('dataId').value = data.id;
        document.getElementById('modalTitle').textContent = `Editar ${currentCrud.slice(0, -1)}`;
        renderFormFields(data);
        modal.show();

      } catch (error) {
        console.error('Error al cargar datos para editar:', error);
        Toastify({ text: error.message, backgroundColor: "#dc3545" }).showToast();
      }
    }

    // --- LÓGICA PARA ELIMINAR (CORREGIDA) ---
    if (button.classList.contains('btn-eliminar')) {
      if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
        try {
          // 1. URL corregida y se añade el token de autorización
          const response = await fetch(`${API_BASE_URL}${config.endpoint}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.ok) {
            throw new Error('No se pudo eliminar el registro.');
          }

          loadData();
          Toastify({
            text: "Registro eliminado con éxito",
            backgroundColor: "#28a745"
          }).showToast();

        } catch (error) {
          console.error('Error al eliminar:', error);
          Toastify({ text: error.message, backgroundColor: "#dc3545" }).showToast();
        }
      }
    }
  });

  // Búsqueda en tiempo real
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredData = allData.filter(item => {
      // Busca en todos los valores del objeto
      return Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm)
      );
    });
    renderTable(filteredData);
  });

  // --- INICIALIZACIÓN ---
  switchCrud('usuarios'); // Cargar el CRUD inicial
});
