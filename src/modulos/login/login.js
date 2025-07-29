// src/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const nombre = document.getElementById('nombre').value;
        const contrasena = document.getElementById('contrasena').value;

      
        errorMessage.classList.add('d-none');

        try {
            const response = await fetch('http://localhost:3000/usuario/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, contrasena }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensaje || 'Error en el inicio de sesión.');
            }

    
            sessionStorage.setItem('usuario', JSON.stringify(data.data));

 
            window.location.href = './ciudadano.html'; 

        } catch (error) {
        
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('d-none');
        }
    });
});