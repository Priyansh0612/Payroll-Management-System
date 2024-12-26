// Existing code to handle form submission
document.getElementById('remove-employee-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form submission

    const empId = document.getElementById('user_id').value; // Get the employee ID from the form
    const messageContainer = document.getElementById('message');

    if (!empId) {
        messageContainer.innerText = 'Employee ID is required.';
        messageContainer.className = 'error';
        return;
    }

    try {
        const response = await fetch('/api/remove-employee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emp_id: empId }),
        });

        const result = await response.json();

        // Handle success or failure
        if (response.ok) {
            messageContainer.innerText = result.message;
            messageContainer.className = 'success';

            // Notify the parent window (Info.html) to remove the employee from the table
            window.location.href = '/info';

            // Reset the form
            document.getElementById('remove-employee-form').reset();
            
            // Close the window after success
            setTimeout(() => window.close(), 1000); // Close the window after 1 second to allow time for the parent to update
        } else {
            messageContainer.innerText = result.message || 'Failed to remove employee.';
            messageContainer.className = 'error';
        }
    } catch (error) {
        console.error('Error removing employee:', error);
        messageContainer.innerText = 'Failed to remove employee.';
        messageContainer.className = 'error';
    }
});