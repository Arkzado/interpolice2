
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';


// SESION INICIADA
(function protegerRuta() {
    const usuario = sessionStorage.getItem('usuario');
    if (!usuario) {
        
        window.location.href = '/index.html';
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
      endpoint: '/ciudadano',
      title: 'Gestión de Ciudadanos',
      headers: ['Codigo', 'Nombre', 'Apellidos', 'Apodo', 'Fecha de nacimiento', 'Planeta de origen', 'Planeta de residencia', 'Foto de ciudadano', 'Codigo QR', 'Acciones'],
      fields: [
        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
        { name: 'apellidos', label: 'Apellidos', type: 'text', required: true },
        { name: 'apodo', label: 'Apodo', type: 'text', required: true },
        { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date', required: true, editableOnUpdate: false },
        { name: 'planeta_origen', label: 'Planeta de origen', type: 'text', required: true, editableOnUpdate: false },
        { name: 'planeta_residencia', label: 'Planeta de residencia', type: 'text', required: true },
        { name: 'foto', label: 'Foto de ciudadano', type: 'file', required: true }

      ],
      renderRow: (item) => `
                        <tr data-id="${item.codigo}">
                            <td>${item.codigo}</td>
                            <td>${item.nombre}</td>
                            <td>${item.apellidos}</td>
                            <td>${item.apodo}</td>
                 <td>${new Date(item.fecha_nacimiento).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}</td>
                                <td>${item.planeta_origen}</td>
                                   <td>${item.planeta_residencia}</td>
                                      <td>${item.foto}</td>
                                         <td>${item.codigo_qr}</td>
                            <td>
                                <button class="btn btn-warning btn-sm btn-editar" title="Editar"><i class="bi bi-pencil-square"></i></button>
                                <button class="btn btn-danger btn-sm btn-eliminar" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
                            </td>
                        </tr>`
    },


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
  const loadData = async () => {
    showLoader(true);
    try {
      const config = crudConfig[currentCrud];
      const response = await fetch(`${API_BASE_URL}${config.endpoint}/TraerCiudadanos`);
      if (!response.ok) throw new Error('Error al cargar los datos.');
      allData = await response.json();
      renderTable(allData);
    } catch (error) {
      console.error(error);
      dataTable.innerHTML = `<tr><td colspan="${crudConfig[currentCrud].headers.length}" class="text-center text-danger">${error.message}</td></tr>`;
    } finally {
      showLoader(false);
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

  dataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('dataId').value;
    const config = crudConfig[currentCrud];
    const method = id ? 'PUT' : 'POST';


    let bodyData = {};
    let url;
    const uniqueId = Date.now();

    if (id) {

      // --- LÓGICA PARA EDITAR (PUT) ---

      url = `${API_BASE_URL}${config.endpoint}/editarCiudadano/${id}`;

      bodyData = {
        nombre: document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        apodo: document.getElementById('apodo').value,
        planeta_residencia: document.getElementById('planeta_residencia').value,
        foto: `/uploads/imagen_${uniqueId}.jpg`,
        estado: '1',
      };

    } else {

      // --- LÓGICA PARA CREAR (POST) ---
      url = `${API_BASE_URL}${config.endpoint}/insertarCiudadano`;

      bodyData = {

        nombre: document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        apodo: document.getElementById('apodo').value,
        fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
        planeta_origen: document.getElementById('planeta_origen').value,
        planeta_residencia: document.getElementById('planeta_residencia').value,
        foto: `/uploads/imagen_${uniqueId}.jpg`,
        codigo_qr: `/uploads/QR_${uniqueId}.jpg`,
        estado: '1'
      };
    }

    try {
      const response = await fetch(url, {
        method: method,

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.mensaje || `Error ${response.status}`);
      }



      modal.hide();
      loadData();

      const operacion = method.toUpperCase() === 'POST' ? 'creado' : 'editado';
      const color = method.toUpperCase() === 'POST' ? '#007bff' : '#2fa12dff';

      Toastify({
        text: `Registro ${operacion} con éxito`,
        duration: 3000,
        gravity: "bottom",
        position: "right",
        backgroundColor: color,
        style: {
          color: method.toUpperCase() === 'PUT' ? '#fff' : '#fff' // Texto negro si es PUT
        }
      }).showToast();


    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    }
  });

  // Acciones en la tabla (Editar/Eliminar)
  dataTable.addEventListener('click', async (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const row = button.closest('tr');
    const id = row.dataset.id;
    const config = crudConfig[currentCrud];

    if (button.classList.contains('btn-editar')) {

      // Lógica para editar
      const response = await fetch(`${API_BASE_URL}${config.endpoint}/buscarCiudadano/${id}`);
      const responseData = await response.json();


      // Verificamos que la respuesta tenga la estructura esperada
      if (!responseData.data || responseData.data.length === 0) {
        throw new Error('Registro no encontrado en la respuesta de la API.');
      }


      const data = responseData.data[0];


      document.getElementById('dataId').value = data.codigo;
      document.getElementById('modalTitle').textContent = `Editar ${currentCrud.slice(0, -1)}`;
      renderFormFields(data);
      modal.show();
    }
    if (button.classList.contains('btn-eliminar')) {

      // Lógica para eliminar
      if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
        try {
          const response = await fetch(`${API_BASE_URL}${config.endpoint}/eliminarCiudadano/${id}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('No se pudo eliminar.');
          loadData();

          Toastify({
            text: "Registro eliminado con éxito",
            duration: 3000,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#28a745"
          }).showToast();

        } catch (error) {
          console.error(error);
          alert('Error: ' + error.message);
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
