const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const bcrypt = require('bcryptjs');
const cors = require('cors');
app.use(cors());
app.use(express.json({ limit: '10mb' }));;

app.use(cors({
    origin: '*', // Replace '*' with the appropriate domain(s) you want to allow
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));


// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ppatel@186', // Replace with your MySQL password
    database: 'payroll_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup express-session
app.use(session({
    secret: '123456', // Change this to a random secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'P.html'));
});

// Fetch all employees for the logged-in user's branch
app.get('/api/get-employees', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const branchId = req.session.user.id; // Get branch ID from session

    const query = `
    SELECT e.emp_id, e.name, e.phone_number, e.email, e.address, e.hire_date, e.position
    FROM employees e
    WHERE e.branch_id = ?;
    `;

    db.query(query, [branchId], (err, results) => {
        if (err) {
            console.error('Error fetching employees:', err);
            return res.status(500).json({ message: 'Database query failed' });
        }
        res.status(200).json(results); // Return the required employee details
    });
});


// Search Employees Route
app.post('/api/search-employee', (req, res) => {
    const { emp_name, emp_id } = req.body;

    let query = 'SELECT e.emp_id, e.name, e.phone_number, e.email, e.address, e.hire_date, e.position FROM employees e WHERE 1=1';
    let values = [];

    // Filter by employee name if provided
    if (emp_name) {
        query += ' AND e.name LIKE ?'; // Corrected 'employee_name' to 'e.name'
        values.push(`%${emp_name}%`);
    }

    // Filter by employee ID if provided
    if (emp_id && emp_id !== 'all') {
        query += ' AND e.emp_id = ?';
        values.push(emp_id);
    }

    if (!emp_name && !emp_id) {

        return res.status(400).json({ message: 'Please provide search criteria.' });
    }
    
    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error fetching Employee:', err);
            return res.status(500).json({ message: 'Error fetching Employee' });
        }
        res.json(results); // Return filtered results
    });
});

 app.get('/api/get-branch-id', (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const branchId = req.session.user.id; // Get branch ID from session
    res.json({ branch_id: branchId }); // Send branch ID to frontend
});




// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide both username and password.' });
    }

    const query = 'SELECT * FROM users WHERE Branch_name = ?';

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'An error occurred. Please try again later.' });
        }

        // If no user is found with the provided username
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username. Please try again.' });
        }

        // Retrieve the stored password hash from the database
        

        const storedHash = results[0].Branch_Password;
        const branchId = results[0].Branch_id;
        //console.log('Stored hash from DB:', storedHash);
        //console.log('Entered password:', password);

        // If the password is hashed, use bcrypt to compare
        if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) { // Check for bcrypt hash
            // Use bcrypt to compare entered password with the stored hash
            bcrypt.compare(password, storedHash, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).json({ message: 'An error occurred. Please try again later.' });
                }

                if (isMatch) {
                    // Passwords match, create a session
                    req.session.user = {
                        id: results[0].Branch_id,
                        branch: results[0].Branch_name,
                    };
                    return res.json({ message: 'Login successful', user: req.session.user});
                } else {
                    return res.status(401).json({ message: 'Invalid password. Please try again.' });
                }
            });
        } else {
            // If the password is not hashed (initial password), compare directly
            if (password === storedHash) {
                // Passwords match, create a session for the user
                req.session.user = {
                    id: results[0].Branch_id,
                    branch: results[0].Branch_name,
                };

                res.json({ message: 'Login successful', user: req.session.user });
            } else {
                res.status(401).json({ message: 'Invalid password. Please try again.' });
            }
        }
    });
});

// Dashboard Route
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to login if not logged in
    }
    res.sendFile(path.join(__dirname, 'public', 'Manage.html')); // Serve dashboard HTML
});

//Logout Route
app.get('/logout', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to login if the user is not logged in
    }

    // Destroy the session to log out the user
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to destroy session:', err);
            return res.status(500).send('Something went wrong'); // Handle errors gracefully
        }
        // Redirect to login page after session is destroyed
        res.redirect('/');
    });
});

// Info Route
app.get('/info', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to login if not logged in
    }

    res.sendFile(path.join(__dirname, 'public', 'Info.html')); // Serve the info page
});

// Add Employee Route
app.post('/api/add-employee', (req, res) => {
    console.log(req.body);

    const { branch_id, name, phone_number, email, address, position, department, hire_date, salary } = req.body;

    // Validate input
    if (!branch_id || !name || !phone_number || !email || !address || !position || !department || !hire_date || !salary) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Get the logged-in user's branch_id (assumes the branch_id is attached to the user object after authentication)
    

    // Check if the department exists in the departments table (optional check, depending on your use case)
    db.query('SELECT * FROM departments WHERE department_id = ?', [department], (err, departmentResults) => {
        if (err) {
            console.error('Error checking department:', err);
            return res.status(500).json({ message: 'Failed to check department' });
        }
        if (departmentResults.length === 0) {
            return res.status(400).json({ message: 'Invalid department' });
        }

        // Insert employee if all checks pass
        const query = `
            INSERT INTO employees (branch_id, name, phone_number, email, address, position, department_id, hire_date, salary)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(query, [branch_id, name, phone_number, email, address, position, department, hire_date, salary], (err, result) => {
            if (err) {
                console.error('Error adding employee:', err);
                return res.status(500).json({ message: 'Failed to add employee' });
            }

            // Fetch the newly added employee's data and return it in the response
            const newEmployee = {
                emp_id: result.insertId,
                branch_id,
                name,
                phone_number,
                email,
                address,
                position,
                department_id: department,
                hire_date,
                salary
            };

            res.status(200).json({ message: 'Employee added successfully', employee: newEmployee });
        });
    });
});



// Remove Employee Route
app.post('/api/remove-employee', (req, res) => {
    const { emp_id } = req.body;

    if (!emp_id) {
        return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Delete the employee from the employees table
    const query = 'DELETE FROM employees WHERE emp_id = ?';

    db.query(query, [emp_id], (err, result) => {
        if (err) {
            console.error('Error removing employee:', err);
            return res.status(500).json({ message: 'Failed to remove employee' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee removed successfully' });
    });
});



// Update Employee Route
// Update employee details
app.put('/api/update-employee', (req, res) => {
    const { emp_id, name, phone_number, email, address } = req.body; // Extract all fields from request body

    // Validate input
    if (!emp_id || !name || !phone_number || !email || !address) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
        UPDATE employees
        SET name = ?, phone_number = ?, email = ?, address = ?
        WHERE emp_id = ?`;  // Make sure you use emp_id for the update condition

    db.query(query, [name, phone_number, email, address, emp_id], (err, result) => {
        if (err) {
            console.error('Error updating employee:', err);
            return res.status(500).json({ message: 'Failed to update employee' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee updated successfully' });
    });
});


function validatePayrollData(data) {
    const { emp_id, hours_worked, pay_period_start, pay_period_end } = data;
    
    if (!emp_id || !hours_worked || !pay_period_start || !pay_period_end ) {
        return { valid: false, message: 'All fields are required.' };
    }

    if (isNaN(hours_worked) || hours_worked <= 0) {
        return { valid: false, message: 'Hours worked must be a positive number.' };
    }

    // Validate pay period dates
    if (new Date(pay_period_start) > new Date(pay_period_end)) {
        return { valid: false, message: 'Pay period start date cannot be after the end date.' };
    }

    return { valid: true };
}

app.get('/api/get-employee-details', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const branchId = req.session.user.id; // Get branch ID from session
    const empId = req.query.emp_id;

    const query = `
   SELECT e.name, d.department_name
   FROM employees e
   JOIN departments d ON e.department_id = d.department_id
   WHERE e.branch_id = ? AND e.emp_id = ?;
    `;

    db.query(query, [branchId, empId], (err, results) => {
        if (err) {
            console.error('Error fetching employee details:', err);
            return res.status(500).json({ message: 'Database query failed' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(results[0]); // Return employee details
    });
});

// Handle payroll generation
app.post('/api/generate-payroll', (req, res) => {
    const { emp_id, hours_worked, pay_period_start, pay_period_end, name, department_name } = req.body;

    // Input validation
    const validation = validatePayrollData(req.body);
    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    const pay_rate = 30; // $30/hr (You can also get this from the database if it's dynamic)

    // Calculate total pay before deductions
    const total_pay = hours_worked * pay_rate;
    const tax_deduction = total_pay * 0.13; // 13% tax
   
    // Calculate net pay after deductions
    const net_pay = total_pay - tax_deduction;

    // Automatically set the pay date as the same as pay period end date
    const pay_date = pay_period_end;

    // Save payroll to the database
    const query = `
        INSERT INTO payroll (emp_id, pay_period_start, pay_period_end, hours_worked, pay_rate, total_pay, tax_deduction, net_pay, pay_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [emp_id, pay_period_start, pay_period_end, hours_worked, pay_rate, total_pay, tax_deduction, net_pay, pay_date], (err) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ message: 'Error saving payroll data.' });
        }

        // Return the payroll summary with employee details
        res.json({
            employee: {
                name: name,
                department_name: department_name
            },
            pay_period_start,
            pay_period_end,
            hours_worked,
            pay_rate,
            total_pay,
            tax_deduction,
            net_pay,
            pay_date,  // Return the pay date (same as pay period end date)
        });
    });
});


app.get('/payroll', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to login if not logged in
    }

    res.sendFile(path.join(__dirname, 'public', 'ManagePayroll.html')); // Serve the info page
});

app.get('/Generatepayroll', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to login if not logged in
    }

    res.sendFile(path.join(__dirname, 'public', 'GeneratePayroll.html')); // Serve the info page
});

// Example using Express.js to handle password change
app.post('/api/change-password', (req, res) => {
    const { branchId, newPassword } = req.body;

    if (!branchId || !newPassword) {
        return res.status(400).json({ message: 'Branch ID and new password are required.' });
    }

    // Example password validation (optional)
    
    // Hash the new password
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Error hashing password. Please try again.' });
        }

        // Update the password in the database
        const query = 'UPDATE users SET Branch_Password = ? WHERE Branch_id = ?';
        db.query(query, [hashedPassword, branchId], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database update failed. Please try again.' });
            }

            if (result.affectedRows > 0) {
                return res.json({ message: 'Password changed successfully!' });
            } else {
                return res.status(404).json({ message: 'Branch not found or no changes made.' });
            }
        });
    });
});

  app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to login if not logged in
    }

    res.sendFile(path.join(__dirname, 'public', 'Profile.html')); // Serve the info page
});

app.get('/api/get-branch-details', (req, res) => {
    // Ensure the user is logged in and the session contains a branchId
    const branchId = req.session.user ? req.session.user.id : null;

    if (!branchId) {
        return res.status(401).json({ error: 'User not logged in or branch ID not found' });
    }

    const query = 'SELECT Branch_id, Branch_name, Branch_ContactNo, Branch_Email FROM users WHERE Branch_id = ?';

    db.query(query, [branchId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (result.length > 0) {
            res.json(result[0]); // Send the first result (branch details)
        } else {
            res.status(404).json({ error: 'Branch not found' });
        }
    });
});

// Route to fetch payroll data
app.get('/api/get-payroll', (req, res) => {
    // Check if the user is logged in and has a branch ID in the session
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const branchId = req.session.user.id; // Get branch ID from session

    // Query to fetch payroll data for the specific branch
    const query = `
    SELECT payroll.payroll_id,             
        employees.emp_id AS employee_id,  
        employees.name AS employee_name, 
        payroll.pay_rate AS hourly_pay, 
        payroll.hours_worked, 
        payroll.total_pay AS gross_pay, 
        payroll.tax_deduction AS tax_deductions, 
        payroll.net_pay, 
        payroll.pay_period_end AS pay_date,  
        departments.department_name
    FROM payroll
    JOIN employees ON payroll.emp_id = employees.emp_id
    JOIN departments ON employees.department_id = departments.department_id
    WHERE employees.branch_id = ?;`;

    // Execute the query with the branch ID filter
    db.query(query, [branchId], (err, results) => {
        if (err) {
            console.error('Error fetching payroll data:', err);
            return res.status(500).json({ message: 'Database query failed' });
        }

        if (results.length > 0) {
            res.status(200).json(results); // Send success response with filtered data
        } else {
            res.status(404).json({ message: 'No payroll data available for this branch.' });
        }
    });
});

// Route to fetch filtered payroll data based on employee name, employee ID, and department
app.post('/api/get-filtered-payroll', (req, res) => {
    const { searchTerm, department } = req.body;

    // Base query
    let query = `
    SELECT payroll.payroll_id,             
    employees.emp_id AS employee_id,  
    employees.name AS employee_name, 
    payroll.pay_rate AS hourly_pay, 
    payroll.hours_worked, 
    payroll.total_pay AS gross_pay, 
    payroll.tax_deduction AS tax_deductions,  -- Corrected column name
    payroll.net_pay, 
    payroll.pay_period_end,  
    (payroll.pay_period_end + INTERVAL 2 DAY) AS pay_date,
    departments.department_name
    FROM payroll
    JOIN employees ON payroll.emp_id = employees.emp_id  -- Corrected join
    JOIN departments ON employees.department_id = departments.department_id;
    WHERE 1=1
    `;

    let values = [];

    // Add search filter for employee name or employee ID
    if (searchTerm) {
        query += ` AND (LOWER(employees.name) LIKE LOWER(?) OR LOWER(employees.emp_id) LIKE LOWER(?))`;
        values.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Add department filter if not "all"
    if (department && department !== 'all') {
        query += ` AND LOWER(departments.department_name) = LOWER(?)`;
        values.push(department);
    }

    // Execute the query with filters
    db.query(query, values, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database query failed', error: err.message });
        }

        if (results.length > 0) {
            res.json(results); // Send filtered payroll data
        } else {
            res.status(404).json({ message: 'No matching payroll data found.' });
        }
    });
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
