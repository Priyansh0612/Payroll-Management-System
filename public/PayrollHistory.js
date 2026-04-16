// Store payroll data globally
let allPayrollData = [];

// Fetch and initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayPayroll();

    // Event listeners for filters
    document.getElementById('searchPayroll').addEventListener('input', applyFilters);
    document.getElementById('departmentFilter').addEventListener('change', applyFilters);
    document.getElementById('sortFilter').addEventListener('change', applyFilters);
});

async function fetchAndDisplayPayroll() {
    try {
        const response = await fetch('/api/get-payroll');
        const data = await response.json();

        if (Array.isArray(data)) {
            allPayrollData = data;
            populateDepartmentFilter(data);
            applyFilters();
        } else {
            showNoData();
        }
    } catch (error) {
        console.error('Error fetching payroll:', error);
        showError();
    }
}

function populateDepartmentFilter(data) {
    const departmentFilter = document.getElementById('departmentFilter');
    const departments = new Set(data.map(p => p.department_name).filter(Boolean));

    // Keep "All Departments" and add unique departments
    departmentFilter.innerHTML = '<option value="all">All Departments</option>';
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentFilter.appendChild(option);
    });
}

function applyFilters() {
    const searchTerm = document.getElementById('searchPayroll').value.toLowerCase();
    const department = document.getElementById('departmentFilter').value;
    const sortBy = document.getElementById('sortFilter').value;

    let filtered = [...allPayrollData];

    // Filter by search term (name or ID)
    if (searchTerm) {
        filtered = filtered.filter(record => {
            const displayId = record.branch_emp_id ?
                `B${record.branch_id}-${String(record.branch_emp_id).padStart(3, '0')}` :
                record.employee_id;
            const name = (record.employee_name || '').toLowerCase();
            const id = String(displayId).toLowerCase();

            return name.includes(searchTerm) || id.includes(searchTerm);
        });
    }

    // Filter by department
    if (department !== 'all') {
        filtered = filtered.filter(record => record.department_name === department);
    }

    // Sort
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.pay_date) - new Date(a.pay_date);
            case 'oldest':
                return new Date(a.pay_date) - new Date(b.pay_date);
            case 'highest':
                return parseFloat(b.net_pay) - parseFloat(a.net_pay);
            case 'lowest':
                return parseFloat(a.net_pay) - parseFloat(b.net_pay);
            default:
                return 0;
        }
    });

    displayPayrollData(filtered);
}

function displayPayrollData(data) {
    const tbody = document.querySelector('#payrollTable tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No payroll records found.</td></tr>';
        return;
    }

    data.forEach(record => {
        const displayId = record.branch_emp_id ?
            `B${record.branch_id}-${String(record.branch_emp_id).padStart(3, '0')}` :
            record.employee_id;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${displayId}</td>
            <td>${record.employee_name || 'N/A'}</td>
            <td>${record.department_name || 'N/A'}</td>
            <td>$${parseFloat(record.gross_pay || 0).toFixed(2)}</td>
            <td>$${parseFloat(record.allowances || 0).toFixed(2)}</td>
            <td>$${parseFloat(record.deductions || 0).toFixed(2)}</td>
            <td><strong>$${parseFloat(record.net_pay || 0).toFixed(2)}</strong></td>
            <td>${new Date(record.pay_date).toLocaleDateString()}</td>
            <td>
                <button class="action-btn email-btn" onclick="emailPayslip(${record.employee_id})" 
                    style="background: var(--secondary-color); color: white; padding: 5px 10px; border-radius: 4px; border: none; cursor: pointer;">
                    <i class="fas fa-envelope"></i> Email
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showNoData() {
    const tbody = document.querySelector('#payrollTable tbody');
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No payroll history found.</td></tr>';
}

function showError() {
    const tbody = document.querySelector('#payrollTable tbody');
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: red;">Failed to load payroll history.</td></tr>';
}

async function emailPayslip(id) {
    if (!confirm('Are you sure you want to email the payslip to this employee?')) {
        return;
    }

    try {
        const response = await fetch('/api/email/payslip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ emp_id: id })
        });

        const result = await response.json();

        if (response.ok) {
            alert(`Email sent successfully! Preview: ${result.previewUrl}`);
            window.open(result.previewUrl, '_blank');
        } else {
            alert(`Failed to send email: ${result.message}`);
        }
    } catch (error) {
        console.error('Error sending email:', error);
        alert('An error occurred while sending the email.');
    }
}