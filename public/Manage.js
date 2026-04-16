// Fetch and display dashboard stats on load
document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardStats();
});

async function fetchDashboardStats() {
    try {
        const response = await fetch('/api/dashboard-stats');
        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }
        const stats = await response.json();

        // Update DOM
        document.getElementById('total-employees').textContent = stats.totalEmployees;
        document.getElementById('total-payroll').textContent = formatCurrency(stats.lastPayrollTotal);
        document.getElementById('department-count').textContent = stats.departmentCount;

        // Render Charts
        renderCharts(stats.payrollByDept, stats.employeesByDept);

    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('total-employees').textContent = '-';
        document.getElementById('total-payroll').textContent = '-';
        document.getElementById('department-count').textContent = '-';
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

function renderCharts(payrollData, employeeData) {
    // Payroll Chart
    const payrollCtx = document.getElementById('payrollChart').getContext('2d');
    new Chart(payrollCtx, {
        type: 'bar',
        data: {
            labels: payrollData.map(d => d.department_name),
            datasets: [{
                label: 'Total Payroll ($)',
                data: payrollData.map(d => d.total),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
            },
            scales: {
                y: { beginAtZero: true, ticks: { color: 'white' } },
                x: { ticks: { color: 'white' } }
            }
        }
    });

    // Employee Chart
    const employeeCtx = document.getElementById('employeeChart').getContext('2d');
    new Chart(employeeCtx, {
        type: 'doughnut',
        data: {
            labels: employeeData.map(d => d.department_name),
            datasets: [{
                data: employeeData.map(d => d.count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ],
                borderColor: 'white',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right', labels: { color: 'white' } }
            }
        }
    });
}

// Existing button logic (if any needed, but inline onclicks handle navigation)
// We can keep the confirmation logic if desired, but for now let's keep it simple and clean.
