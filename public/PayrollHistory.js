// Fetch payroll data and display in the table

function loadPayrollData() {
    fetch('/api/get-payroll')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch payroll data.');
            }
            return response.json();
        })
        .then(data => {
            console.log("Payroll Data:", data);  // Log data for inspection
            const payrollTable = document.getElementById('payrollData');
            payrollTable.innerHTML = ''; // Clear existing data

            if (Array.isArray(data) && data.length) {
                data.forEach(payroll => {
                    const row = document.createElement('tr');

                    // Ensure correct numeric values or mark them as invalid
                    const hourlyPay = !isNaN(payroll.hourly_pay) ? parseFloat(payroll.hourly_pay).toFixed(2) : 'Invalid';
                    const grossPay = !isNaN(payroll.gross_pay) ? parseFloat(payroll.gross_pay).toFixed(2) : 'Invalid';
                    const netPay = !isNaN(payroll.net_pay) ? parseFloat(payroll.net_pay).toFixed(2) : 'Invalid';
                    const payDate = payroll.pay_date ? new Date(payroll.pay_date).toLocaleDateString() : 'Invalid';
                    const taxDeductions = !isNaN(payroll.tax_deductions) ? parseFloat(payroll.tax_deductions).toFixed(2) : 'Invalid';
                    // Ensure hours_worked is a number or 'Invalid'
                    const hoursWorked = !isNaN(payroll.hours_worked) ? payroll.hours_worked : 'Invalid';

                    
                    // Add a new row with all payroll data, including payroll_id, employee_id, employee_name, etc.
                    row.innerHTML = `
                        <td>${payroll.payroll_id}</td>
                        <td>${payroll.employee_id}</td>
                        <td>${payroll.employee_name}</td>
                        <td>${payroll.department_name}</td>
                        <td>${hourlyPay}</td>
                        <td>${hoursWorked}</td>
                        <td>${grossPay}</td>
                        <td>${taxDeductions}</td>
                        <td>${netPay}</td>
                        <td>${payDate}</td>
                    `;
                    payrollTable.appendChild(row);
                });
            } else {
                payrollTable.innerHTML = '<tr><td colspan="10">No payroll data available.</td></tr>';
            }

            // Dynamically populate the department filter dropdown
            populateDepartmentFilter(data);
        })
        .catch(error => {
            console.error('Error fetching payroll data:', error);
            alert('An error occurred while fetching payroll data. Please try again later.');
        });
}

loadPayrollData();
// Populate the department filter with unique department names
function populateDepartmentFilter(data) {
    const departmentFilter = document.getElementById('departmentFilter');
    const departments = new Set(data.map(payroll => payroll.department_name)); // Extract unique department names

    // Clear existing options and add a default option
    departmentFilter.innerHTML = '<option value="all">All Departments</option>';
    departments.forEach(department => {
        const option = document.createElement('option');
        option.value = department.toLowerCase();
        option.textContent = department;
        departmentFilter.appendChild(option);
    });
}

// Apply search and department filters to the payroll table
function applyFilters() {
    const searchTerm = document.getElementById('searchPayroll').value.toLowerCase(); // Get search input
    const departmentFilter = document.getElementById('departmentFilter').value.toLowerCase(); // Get department filter value

    const payrollRows = document.querySelectorAll('#payrollData tr'); // Get all table rows

    payrollRows.forEach(row => {
        const employeeName = row.querySelector('td:nth-child(3)').textContent.toLowerCase(); // Employee name
        const employeeId = row.querySelector('td:nth-child(2)').textContent.toLowerCase(); // Employee ID
        const department = row.querySelector('td:nth-child(4)').textContent.toLowerCase(); // Department name

        // Filter rows based on search (employee name or employee ID) and department
        const matchesSearch = employeeName.includes(searchTerm) || employeeId.includes(searchTerm);
        const matchesDepartment = departmentFilter === 'all' || department === departmentFilter;

        row.style.display = matchesSearch && matchesDepartment ? '' : 'none'; // Show or hide row
    });
}


// Initial call to load payroll data


// Add event listeners to apply filters dynamically
document.getElementById('searchPayroll').addEventListener('input', applyFilters);
document.getElementById('departmentFilter').addEventListener('change', applyFilters);