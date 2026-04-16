document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.role !== 'admin') {
        // Hide Admin-only links
        const adminLinks = [
            'GeneratePayroll.html',
            'ManagePayroll.html',
            'NewEmp.html',
            'RemoveEmp.html',
            'UpdateEmp.html'
        ];

        const links = document.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && adminLinks.some(adminLink => href.includes(adminLink))) {
                link.style.display = 'none';
            }
        });

        // Also hide by specific IDs if they exist
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => el.style.display = 'none');
    }
});
