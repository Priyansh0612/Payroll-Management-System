let employeeData = {}; // Global object to store fetched employee details

// Fetch employee details when the form is submitted
document.getElementById('employee-id-form').addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent form submission
    const empId = document.getElementById('emp-id').value;  // Get employee ID

    fetchEmployeeData(empId);  // Fetch employee data based on ID
});

function fetchEmployeeData(empId) {
    // Fetch employee details from the server
    fetch(`/api/get-employee-details?emp_id=${empId}`, {  // Pass emp_id as query parameter
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
                    toast.show('Employee not found', 'error');
                    throw new Error('Employee not found');
                }
                throw new Error('Failed to fetch employee details');
            }
            return response.json();
        })
        .then((employee) => {
            document.getElementById('payroll-table').style.display = 'table';
            const employeeName = employee.name; // Store employee name in a variable
            const employeeDepartment = employee.department_name; // Store department name in a variable
            employeeData = { name: employeeName, department_name: employeeDepartment }; // Store both details globally

            displayEmployeeData(employeeName, employeeDepartment); // Show employee data (name and department)
            document.getElementById('generatePayroll').style.display = 'block';  // Show Generate Payroll button
        })
        .catch((error) => {
            console.error('Error:', error);
            // Error is already handled by toast in the throw block or here if needed
            if (error.message !== 'Employee not found' && error.message !== 'Unauthorized: Please log in') {
                toast.show(error.message, 'error');
            }
        });
}

function displayEmployeeData(employeeName, employeeDepartment) {
    const tableBody = document.querySelector('#payroll-table tbody');
    tableBody.innerHTML = `
        <tr>
            <td>${employeeName}</td>
            <td>${employeeDepartment}</td> <!-- Display department name -->
        </tr>
    `;
}

function clearEmployeeData() {
    const tableBody = document.querySelector('#payroll-table tbody');
    tableBody.innerHTML = '';  // Clears the table body
}

// displayMessage function removed in favor of Toast


// Show the payroll form when Generate Payroll button is clicked
document.getElementById('generatePayroll').addEventListener('click', function () {
    document.getElementById('payroll-form').style.display = 'block';
});

// Submit payroll data
document.getElementById('submitPayroll').addEventListener('click', function () {
    const empId = document.getElementById('emp-id').value;
    const payPeriodStart = document.getElementById('payPeriodStart').value;
    const payPeriodEnd = document.getElementById('payPeriodEnd').value;
    const hoursWorked = document.getElementById('hoursWorked').value;

    // Automatically set the pay date as the same as pay period end date
    const payEndDate = new Date(payPeriodEnd); // Convert pay period end date to a Date object
    const payDate = new Date(payEndDate); // Create a new Date object
    payDate.setDate(payEndDate.getDate() + 2); // Add 2 days

    const formattedPayDate = payDate.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD


    const payrollData = {
        emp_id: empId,
        pay_period_start: payPeriodStart,
        pay_period_end: payPeriodEnd,
        hours_worked: hoursWorked,
        pay_date: formattedPayDate, // Pass the pay date automatically
        name: employeeData.name, // Use name from global employee data
        department_name: employeeData.department_name, // Use department from global employee data

    };

    fetch('/api/generate-payroll', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payrollData),
    })
        .then(response => response.json())
        .then(data => {
            // Show payroll summary
            const summaryDiv = document.getElementById('payrollSummary');
            const taxDeductions = parseFloat(data.tax_deduction).toFixed(2); // Use tax_deduction from the server response

            summaryDiv.innerHTML = `
            <h3>Payroll Summary</h3>
            <p><strong>Employee Name:</strong> ${data.employee.name}</p>
            <p><strong>Department:</strong> ${data.employee.department_name}</p>
            <p><strong>Bank:</strong> ${data.employee.bank_name}</p>
            <p><strong>Account Number:</strong> ${data.employee.account_number}</p>
            <p><strong>Pay Period:</strong> ${payPeriodStart} to ${payPeriodEnd}</p>
            <p><strong>Hours Worked:</strong> ${hoursWorked}</p>
            <p><strong>Hourly Rate:</strong> $30/hr</p>
            <p><strong>Basic Pay:</strong> $${data.total_pay}</p> <!-- total_pay is Basic Pay now -->
            <p><strong>Allowances:</strong> $${data.allowances} (HRA: $${data.hra}, DA: $${data.da})</p>
            <p><strong>Deductions:</strong> $${data.deductions} (PF: $${data.pf}, Prof Tax: $${data.professional_tax}, Tax: $${data.tax_deduction})</p>
            <p><strong>Net Pay:</strong> $${data.net_pay}</p>
            <p><strong>Pay Date:</strong> ${formattedPayDate}</p> <!-- Automatically display pay date -->
        `;
            // Display the summary and hide the form
            summaryDiv.style.display = 'block';
            document.getElementById('doneButton').style.display = 'block';
            document.getElementById('payroll-form').style.display = 'none';
            document.getElementById('generatePayroll').style.display = 'none';  // Hide Generate Payroll button
        })
        .catch(err => {
            console.error('Error generating payroll:', err);
            toast.show('Error generating payroll.', 'error');
        });
});
