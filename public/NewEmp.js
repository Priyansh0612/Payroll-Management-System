document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch the branch ID from the backend
        const response = await fetch('/api/get-branch-id');
        if (!response.ok) {
            throw new Error('Failed to fetch branch ID');
        }

        const { branch_id } = await response.json();

        // Display the branch ID in the input field
        const branchInput = document.querySelector('input[name="branch_id"]');
        if (branchInput) {
            branchInput.value = branch_id; // Pre-fill the branch ID
            branchInput.disabled = true;  // Make it readonly (no input allowed)
        }
    } catch (error) {
        console.error('Error fetching branch ID:', error);
        alert('Unable to fetch branch ID. Please try again.');
    }
});

document.getElementById('add-employee-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = 'Adding...';

    // Collect form data
    const formData = new FormData(this);

    // Always use the fixed branch ID (already populated)
    const branch_id = document.querySelector('input[name="branch_id"]').value;

    const employeeData = {
        branch_id,
        name: formData.get('name'),
        position: formData.get('position'),
        phone_number: formData.get('phone_number'),
        email: formData.get('email'),
        address: formData.get('address'),
        department: formData.get('department'),
        hire_date: formData.get('hire_date'),
        salary: formData.get('salary'),
    };

    // Input validation
    for (const [key, value] of Object.entries(employeeData)) {
        if (!value) {
            alert(`Please fill in the ${key.replace('_', ' ')} field.`);
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            return;
        }
    }

    try {
        const response = await fetch('/api/add-employee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Employee added successfully:', result);
            window.location.href = '/info'; // Redirect to the info page
        } else {
            alert(result.message || 'Failed to add employee');
        }
    } catch (error) {
        console.error('Error adding employee:', error);
        alert('An error occurred while adding the employee. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});