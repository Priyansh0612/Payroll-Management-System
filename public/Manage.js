// Handle any custom JS for the Manage page, if needed

// Example: Displaying a confirmation message before redirecting when clicking a button
document.querySelector("button").addEventListener("click", function(e) {
    e.preventDefault();
    
    const button = e.target;

    // If the clicked button is "Manage Employees", show a confirmation alert
    if (button.innerText === "Manage Employees") {
        const confirmRedirect = confirm("Do you want to manage employees?");
        if (confirmRedirect) {
            window.location.href = "Info.html"; // Redirect to employee information page
        }
    }

    // If the clicked button is "Manage Payroll", show a confirmation alert
    if (button.innerText === "Manage Payroll") {
        const confirmPayroll = confirm("Do you want to manage payroll?");
        if (confirmPayroll) {
            window.location.href = "Payroll.html"; // Redirect to payroll management page
        }
    }
});
