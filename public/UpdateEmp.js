// Fetch employee data based on Employee ID
document.getElementById('employee-id-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const empId = document.getElementById('emp-id').value;

    if (!empId) {
        toast.show('Please enter an Employee ID', 'error');
        return;
    }

    // Simulating fetching employee data (replace with an API call)
    fetchEmployeeData(empId);
});

function clearEmployeeData() {
    // Clear employee info container
    document.getElementById("emp-name").value = "";
    document.getElementById("emp-phone").value = "";
    document.getElementById("emp-email").value = "";
    document.getElementById("emp-address").value = "";
}

function fetchEmployeeData(empId) {
    // Fetch employees from the server
    fetch(`/api/get-employees`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => {
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized: Please log in');
                }
                if (response.status === 404) {
                    throw new Error('No employees found for this branch');
                }
                throw new Error('Failed to fetch employees');
            }
            return response.json();
        })
        .then((employees) => {
            // Find employee by badge ID format
            const employee = employees.find((emp) => {
                const displayId = emp.branch_emp_id ?
                    `B${emp.branch_id}-${String(emp.branch_emp_id).padStart(3, '0')}` :
                    emp.emp_id;
                return displayId === empId;
            });

            if (!employee) {
                clearEmployeeData();
                toast.show('Employee not found.', 'error');
                return;
            }

            displayEmployeeData(employee); // Show employee data
            toast.show('Employee information Found', 'success');
        })
        .catch((error) => {
            console.error('Error:', error);
            toast.show(error.message, 'error');
        });
}

// Display editable employee data
function displayEmployeeData(employee) {
    const formContainer = document.getElementById('update-employee-container');
    formContainer.innerHTML = `
        <form id="update-employee-form">
            <div class="form-group">
                <label for="emp-name">Name</label>
                <input type="text" id="emp-name" name="emp-name" value="${employee.name}" required />
            </div>

            <div class="form-group">
                <label for="emp-phone">Phone Number</label>
                <input type="text" id="emp-phone" name="emp-phone" value="${employee.phone_number}" required />
            </div>

            <div class="form-group">
                <label for="emp-email">Email</label>
                <input type="email" id="emp-email" name="emp-email" value="${employee.email}" required />
            </div>

            <div class="form-group">
                <label for="emp-address">Address</label>
                <input type="text" id="emp-address" name="emp-address" value="${employee.address}" required />
            </div>

            <div class="form-group">
                <label for="emp-bank">Bank Name</label>
                <input type="text" id="emp-bank" name="emp-bank" value="${employee.bank_name || ''}" placeholder="e.g. TD Bank" />
            </div>

            <div class="form-group">
                <label for="emp-account">Account Number</label>
                <input type="text" id="emp-account" name="emp-account" value="${employee.account_number || ''}" placeholder="e.g. 123-456-789" />
            </div>

            <div class="form-group">
                <label for="emp-tax">Tax ID (SIN)</label>
                <input type="text" id="emp-tax" name="emp-tax" value="${employee.tax_id || ''}" placeholder="e.g. 123-456-789" />
            </div>
            
            <button type="submit">Update Employee</button>
        </form>
    `;

    // Handle update employee form submission
    document
        .getElementById('update-employee-form')
        .addEventListener('submit', function (e) {
            e.preventDefault();

            const updatedData = {
                name: document.getElementById('emp-name').value,
                phone_number: document.getElementById('emp-phone').value,
                email: document.getElementById('emp-email').value,
                address: document.getElementById('emp-address').value,
                bank_name: document.getElementById('emp-bank').value,
                account_number: document.getElementById('emp-account').value,
                tax_id: document.getElementById('emp-tax').value,
            };

            // Generate badge ID for the employee
            const badgeId = employee.branch_emp_id ?
                `B${employee.branch_id}-${String(employee.branch_emp_id).padStart(3, '0')}` :
                employee.emp_id;

            updateEmployeeData(badgeId, updatedData);
        });
}

// Update employee data
async function updateEmployeeData(empId, updatedData) {
    // const messageContainer = document.getElementById('update-message'); // Removed
    // messageContainer.innerText = 'Updating employee data...';
    // messageContainer.className = '';
    toast.show('Updating employee data...', 'info');
    updatedData.emp_id = empId;

    try {
        const response = await fetch(`/api/update-employee`, { // Make sure the endpoint matches your API
            method: 'PUT', // Typically use PUT for updates
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData), // Send the updated data
        });

        const result = await response.json();

        if (response.ok) {
            toast.show(result.message || 'Employee data updated successfully', 'success');

            // Optionally reset the form after a successful update
            document.getElementById('update-employee-form').reset();
            setTimeout(() => {
                window.location.href = '/info';
            }, 1000);

        } else {
            toast.show(result.message || 'Failed to update employee data', 'error');
        }
    } catch (error) {
        console.error('Error updating employee:', error);
        toast.show('Failed to update employee data', 'error');
    }
}

// displayMessage function removed in favor of Toast
