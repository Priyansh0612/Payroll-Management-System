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
        toast.show('Unable to fetch branch ID. Please try again.', 'error');
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
        bank_name: formData.get('bank_name'),
        account_number: formData.get('account_number'),
        tax_id: formData.get('tax_id'),
    };

    // Input validation
    for (const [key, value] of Object.entries(employeeData)) {
        if (!value) {
            toast.show(`Please fill in the ${key.replace('_', ' ')} field.`, 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            return;
        }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employeeData.email)) {
        toast.show('Please enter a valid email address.', 'error');
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        return;
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
            toast.show('Employee added successfully!', 'success');
            setTimeout(() => {
                window.location.href = '/info'; // Redirect to the info page
            }, 1500);
        } else if (response.status === 409) {
            toast.show(result.message || 'Employee already exists.', 'error');
        } else {
            toast.show(result.message || 'Failed to add employee', 'error');
        }
    } catch (error) {
        console.error('Error adding employee:', error);
        toast.show('An error occurred while adding the employee. Please try again.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});