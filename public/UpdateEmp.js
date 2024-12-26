// Fetch employee data based on Employee ID
document.getElementById('employee-id-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const empId = document.getElementById('emp-id').value;

    if (!empId) {
        displayMessage('error', 'Please enter an Employee ID');
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
            const employee = employees.find((emp) => emp.emp_id == empId);
            if (!employee) {
                clearEmployeeData();
                displayMessage('error', 'Employee not found.');
                return;
            }

            displayEmployeeData(employee); // Show employee data
            displayMessage('success','Employee information Found');
        })
        .catch((error) => {
            console.error('Error:', error);
            displayMessage('error', error.message);
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
            };

            updateEmployeeData(employee.emp_id, updatedData);
        });
}

// Update employee data
async function updateEmployeeData(empId, updatedData) {
    const messageContainer = document.getElementById('update-message');
    messageContainer.innerText = 'Updating employee data...';
    messageContainer.className = '';
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
            messageContainer.innerText = result.message || 'Employee data updated successfully';
            messageContainer.className = 'success';

            // Optionally reset the form after a successful update
            document.getElementById('update-employee-form').reset();
            window.location.href = '/info';

        } else {
            messageContainer.innerText = result.message || 'Failed to update employee data';
            messageContainer.className = 'error';
        }
    } catch (error) {
        console.error('Error updating employee:', error);
        messageContainer.innerText = 'Failed to update employee data';
        messageContainer.className = 'error';
    }
}

// Function to display success or error messages
function displayMessage(type, message) {
    const messageElement = document.getElementById('update-message');
    messageElement.className = type;
    messageElement.textContent = message;
}
