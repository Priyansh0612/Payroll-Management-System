// Event listener for the login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    // Prevent default form submission
    event.preventDefault();

    // Get the username and password values
    const username = document.getElementById('username').value.trim(); // Trim whitespace
    const password = document.getElementById('password').value.trim(); // Trim whitespace

    // Validate inputs
    if (username === '' || password === '') {
        displayError('Please fill in both fields.');
        return;
    }

    // Remove any existing error message
    clearError();

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
    .then(response => response.json())
    .then(data => {
        if (data.message && (data.message === 'Invalid username. Please try again.' || data.message === 'Invalid password. Please try again.')) {
            displayError(data.message); // Display the error message from server
        } else {
            // Redirect to dashboard if login is successful
            window.location.href = '/dashboard';
        }
    })
    .catch(error => {
        console.error('Error during login:', error);
        displayError('An error occurred. Please try again later.');
    });
});

// Function to display error messages
function displayError(message) {
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block'; // Ensure the error message is visible
}

// Function to clear error messages
function clearError() {
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.textContent = '';
    errorMessageDiv.style.display = 'none'; // Hide the error message
}
