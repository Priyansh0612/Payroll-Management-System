let employeeData = []; // Store fetched employees globally

// Fetch and display employees on page load
document.addEventListener('DOMContentLoaded', fetchEmployees);

// Function to fetch and display all employees
async function fetchEmployees() {
    try {
        const response = await fetch('/api/get-employees');
        if (!response.ok) throw new Error('Failed to fetch employees');

        employeeData = await response.json();
        if (employeeData.length === 0) {
            document.getElementById('error-message').innerText = 'No employees found.';
            return;
        }

        displayEmployees(employeeData); // Display fetched employees
    } catch (error) {
        console.error('Error fetching employees:', error);
        document.getElementById('error-message').innerText = 'Failed to fetch employees. Please try again later.';
    }
}

// Function to display employees in the table
function displayEmployees(data) {
    const tableBody = document.querySelector('#payroll-table tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    data.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.emp_id}</td>
            <td>${employee.name || 'N/A'}</td>
            <td>${employee.phone_number || 'N/A'}</td>
            <td>${employee.email || 'N/A'}</td>
            <td>${employee.address || 'N/A'}</td>
            <td>${employee.position || 'N/A'}</td>
            <td>${new Date(employee.hire_date).toLocaleDateString() || 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to filter employees in the table based on search input
function filterTable() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const rows = document.querySelectorAll('#payroll-table tbody tr');

    rows.forEach(row => {
        const empId = row.children[0].textContent.toLowerCase();
        const name = row.children[1].textContent.toLowerCase();

        // Show row if it matches the search term
        if (empId.includes(searchTerm) || name.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Attach the filterTable function to the search input
document.getElementById('search').addEventListener('input', filterTable);

// Function to sort employees based on the selected option
function applySorting() {
    const filterValue = document.getElementById('filter').value;

    let sortedData = [...employeeData]; // Create a copy to avoid modifying the original array

    if (filterValue === 'name-asc') {
        sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filterValue === 'name-desc') {
        sortedData.sort((a, b) => b.name.localeCompare(a.name));
    } else if (filterValue === 'hire-asc') {
        sortedData.sort((a, b) => new Date(a.hire_date) - new Date(b.hire_date));
    } else if (filterValue === 'hire-desc') {
        sortedData.sort((a, b) => new Date(b.hire_date) - new Date(a.hire_date));
    }

    displayEmployees(sortedData);
}

// Function to filter employees based on the query
// Event listener for removing an employee
/*document.getElementById('remove-employee-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form submission

    const emp_id = document.getElementById('emp_id').value; // Get the employee ID from the form

    try {
        // Send a POST request to the server to remove the employee
        const response = await fetch('/api/remove-employee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ emp_id })
        });

        const result = await response.json();

        // Handle success or failure
        if (response.ok) {
            document.getElementById('remove-message').innerText = `Employee with ID ${emp_id} has been removed.`;
            fetchEmployees(); // Refresh the employee list
        } else {
            document.getElementById('remove-message').innerText = result.message || 'Failed to remove employee.';
        }
    } catch (error) {
        console.error('Error removing employee:', error);
        document.getElementById('remove-message').innerText = 'Failed to remove employee.';
    }
});*/