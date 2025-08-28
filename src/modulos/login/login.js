// src/modulos/login/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const email = document.getElementById('email').value;
        const password = document.getElementById('contrasena').value; // 👈 Cambiado el nombre de la variable

        errorMessage.classList.add('d-none');

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), // 👈 Enviamos la variable 'password'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en el inicio de sesión.');
            }
            
            localStorage.setItem('token', data.token);

            window.location.href = './ciudadano.html'; 

        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('d-none');
        }
    });
});