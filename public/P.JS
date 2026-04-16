// Event listener for the login form submission
document.getElementById('loginForm').addEventListener('submit', function (event) {
    // Prevent default form submission
    event.preventDefault();

    // Get the username and password values
    const username = document.getElementById('username').value.trim(); // Trim whitespace
    const password = document.getElementById('password').value.trim(); // Trim whitespace

    // Validate inputs
    if (username === '' || password === '') {
        toast.show('Please fill in both fields.', 'error');
        return;
    }

    // Create an object with the login data
    const loginData = {
        username: username,
        password: password
    };

    // Send login data to the server using fetch API
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message || 'Login failed.');
                });
            }
            return response.json();
        })
        .then(data => {
            // If we reach here, the login was successful (response.ok was true)
            toast.show('Login successful! Redirecting...', 'success');

            // Save user info including role to localStorage
            localStorage.setItem('user', JSON.stringify(data.user));

            if (data.user.role === 'admin') {
                window.location.href = '/dashboard';
            } else {
                window.location.href = '/info';
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            // Display the error message from the server or a generic one
            toast.show(error.message || 'An error occurred. Please try again later.', 'error');
        });
});

// Show/Hide Password Toggle
document.getElementById('togglePassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Toggle the eye icon
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});
