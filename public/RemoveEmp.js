let currentEmployeeId = null;
let currentEmployeeData = null;

// Handle form submission - Fetch employee first
document.getElementById('remove-employee-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const empId = document.getElementById('user_id').value;

    if (!empId) {
        toast.show('Please enter an Employee ID', 'error');
        return;
    }

    fetchEmployeePreview(empId);
});

// Fetch employee details for preview
async function fetchEmployeePreview(empId) {
    try {
        const response = await fetch('/api/get-employees', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                toast.show('Unauthorized: Please log in', 'error');
                return;
            }
            throw new Error('Failed to fetch employees');
        }

        const employees = await response.json();

        // Find employee by badge ID
        const employee = employees.find((emp) => {
            const displayId = emp.branch_emp_id ?
                `B${emp.branch_id}-${String(emp.branch_emp_id).padStart(3, '0')}` :
                emp.emp_id;
            return displayId === empId;
        });

        if (!employee) {
            toast.show('Employee not found', 'error');
            document.getElementById('employee-preview').style.display = 'none';
            return;
        }

        // Store employee data
        currentEmployeeId = empId;
        currentEmployeeData = employee;

        // Display employee preview
        displayEmployeePreview(employee, empId);
        toast.show('Employee found! Review details below.', 'success');

    } catch (error) {
        console.error('Error:', error);
        toast.show('Failed to fetch employee data', 'error');
    }
}

// Display employee details for confirmation
function displayEmployeePreview(employee, badgeId) {
    const detailsDiv = document.getElementById('employee-details');

    detailsDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; color: white;">
            <div>
                <strong>Badge ID:</strong> ${badgeId}
            </div>
            <div>
                <strong>Name:</strong> ${employee.name}
            </div>
            <div>
                <strong>Position:</strong> ${employee.position}
            </div>
            <div>
                <strong>Department:</strong> ${employee.department_name || 'N/A'}
            </div>
            <div>
                <strong>Email:</strong> ${employee.email}
            </div>
            <div>
                <strong>Phone:</strong> ${employee.phone_number}
            </div>
        </div>
        <div style="margin-top: 15px; padding: 10px; background: rgba(231, 76, 60, 0.2); border-left: 3px solid #e74c3c; color: #fff;">
            <strong>⚠️ Warning:</strong> This action cannot be undone. All payroll records for this employee will remain in the system.
        </div>
    `;

    document.getElementById('employee-preview').style.display = 'block';
}

// Confirm removal button
document.getElementById('confirm-remove-btn').addEventListener('click', function () {
    if (!currentEmployeeId || !currentEmployeeData) {
        toast.show('No employee selected', 'error');
        return;
    }

    // Show confirmation dialog
    const confirmMessage = `Are you sure you want to remove ${currentEmployeeData.name}?\n\nThis action cannot be undone!`;

    if (confirm(confirmMessage)) {
        removeEmployee(currentEmployeeId);
    }
});

// Cancel button
document.getElementById('cancel-btn').addEventListener('click', function () {
    document.getElementById('employee-preview').style.display = 'none';
    document.getElementById('user_id').value = '';
    currentEmployeeId = null;
    currentEmployeeData = null;
    toast.show('Action cancelled', 'info');
});

// Remove employee function
async function removeEmployee(empId) {
    try {
        const response = await fetch('/api/remove-employee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ emp_id: empId }),
        });

        const result = await response.json();

        if (response.ok) {
            toast.show(result.message || 'Employee removed successfully', 'success');

            // Reset form and hide preview
            document.getElementById('remove-employee-form').reset();
            document.getElementById('employee-preview').style.display = 'none';
            currentEmployeeId = null;
            currentEmployeeData = null;

            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = '/info';
            }, 2000);
        } else {
            toast.show(result.message || 'Failed to remove employee', 'error');
        }
    } catch (error) {
        console.error('Error removing employee:', error);
        toast.show('Failed to remove employee', 'error');
    }
}