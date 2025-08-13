// Fetch Branch Info (including email and phone) from the backend
async function getBranchDetails() {
    try {
        const response = await fetch('/api/get-branch-details');
        const data = await response.json();
        
        if (response.ok) {
            // Set the branch details in the HTML
            document.getElementById('branch-id').textContent = data.Branch_id;
            document.getElementById('branch-name').textContent = data.Branch_name;
            document.getElementById('phone-number').textContent = data.Branch_ContactNo; // Set email
            document.getElementById('email-address').textContent = data.Branch_Email; // Set phone number
        } else {
            alert('Failed to load branch details: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching branch details.');
    }
}

// Toggle the visibility of the password change form
function togglePasswordForm() {
    const form = document.getElementById('password-form');
    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
}

// Handle the password form submission
document.getElementById('password-form-submit').addEventListener('submit', async function(event) {
    event.preventDefault();

    const branchId = document.getElementById('branch-id').textContent; // Get the Branch ID from the page
    const newPassword = document.getElementById('new-password').value;

    // Send the new password to the backend to update
    try {
        const response = await fetch('/api/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ branchId, newPassword })
        });

        // Log the response for debugging
        console.log('Response:', response);

        const result = await response.json();
        if (response.ok) {
            alert('Password changed successfully!');
            togglePasswordForm(); // Hide the form after submission
            window.location.href = '/logout';

        } else {
            console.error('Error from server:', result);  // Log the error details
            alert('Error changing password: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to change password. Please try again later.');
    }
});

// Call the function to fetch branch details on page load
window.onload = getBranchDetails;
