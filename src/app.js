const mysql = require('mysql2');
const express = require('express');
const util = require('util');
console.log('STARTING APP.JS WITH DEBUGGING - VERSION 2');
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
// MySQL Database Connection
const db = require('./db');

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
app.use(express.static(path.join(__dirname, '../public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'P.html'));
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

        const user = results[0];
        const storedHash = user.Branch_Password;

        // Helper to complete login
        const completeLogin = () => {
            req.session.user = {
                id: user.Branch_id,
                branch: user.Branch_name,
                role: user.role || 'employee' // Default to employee if role is missing
            };
            res.json({ message: 'Login successful', user: req.session.user });
        };

        // If the password is hashed, use bcrypt to compare
        if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) { // Check for bcrypt hash
            // Use bcrypt to compare entered password with the stored hash
            bcrypt.compare(password, storedHash, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).json({ message: 'An error occurred. Please try again later.' });
                }

                if (isMatch) {
                    completeLogin();
                } else {
                    return res.status(401).json({ message: 'Invalid password. Please try again.' });
                }
            });
        } else {
            // If the password is not hashed (initial password), compare directly
            if (password === storedHash) {
                completeLogin();
            } else {
                res.status(401).json({ message: 'Invalid password. Please try again.' });
            }
        }
    });
});

// Database Migration: Add role column if it doesn't exist
const migrationQuery = `
    SELECT count(*) as count 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'role' 
    AND table_schema = 'payroll_db';
`;

db.query(migrationQuery, (err, results) => {
    if (err) {
        console.error('Migration check failed:', err);
        return;
    }

    if (results[0].count === 0) {
        console.log('Adding role column to users table...');
        const alterQuery = "ALTER TABLE users ADD COLUMN role ENUM('admin', 'employee') DEFAULT 'employee'";
        db.query(alterQuery, (err) => {
            if (err) console.error('Failed to add role column:', err);
            else console.log('Role column added successfully.');
        });
    }
});

// Dashboard Route
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to login if not logged in
    }
    res.sendFile(path.join(__dirname, '../public', 'Manage.html')); // Serve dashboard HTML
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

    res.sendFile(path.join(__dirname, '../public', 'Info.html')); // Serve the info page
});

// Middleware to check role
function checkRole(role) {
    return (req, res, next) => {
        if (req.session.user && req.session.user.role === role) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
    };
}

// Database Migration: Add banking and tax columns if they don't exist
const migrationBankingQuery = `
    SELECT count(*) as count 
    FROM information_schema.columns 
    WHERE table_name = 'employees' 
    AND column_name = 'bank_name' 
    AND table_schema = 'payroll_db';
`;

db.query(migrationBankingQuery, (err, results) => {
    if (err) {
        console.error('Error checking for bank_name column:', err);
        return;
    }
});

// Database Migration: Add payroll breakdown columns if they don't exist
const migrationPayrollQuery = `
    SELECT count(*) as count 
    FROM information_schema.columns 
    WHERE table_name = 'payroll' 
    AND column_name = 'hra' 
    AND table_schema = 'payroll_db';
`;

db.query(migrationPayrollQuery, (err, results) => {
    if (err) {
        console.error('Error checking for payroll columns:', err);
        return;
    }

    if (results[0].count === 0) {
        console.log('Adding breakdown columns to payroll table...');
        const addPayrollColumnsQuery = `
            ALTER TABLE payroll 
            ADD COLUMN hra DECIMAL(10, 2) DEFAULT 0.00,
            ADD COLUMN da DECIMAL(10, 2) DEFAULT 0.00,
            ADD COLUMN pf DECIMAL(10, 2) DEFAULT 0.00,
            ADD COLUMN professional_tax DECIMAL(10, 2) DEFAULT 0.00,
            ADD COLUMN allowances DECIMAL(10, 2) DEFAULT 0.00,
            ADD COLUMN deductions DECIMAL(10, 2) DEFAULT 0.00;
        `;
        db.query(addPayrollColumnsQuery, (err, result) => {
            if (err) {
                console.error('Error adding payroll breakdown columns:', err);
            } else {
                console.log('Payroll breakdown columns added successfully.');
            }
        });
    }
});

// Add Employee Route
app.post('/api/add-employee', checkRole('admin'), (req, res) => {
    const { name, phone_number, email, address, position, department, hire_date, salary, bank_name, account_number, tax_id } = req.body;
    const branch_id = req.session.user.id; // Get branch ID from session

    // Validate input
    if (!branch_id || !name || !phone_number || !email || !address || !position || !department || !hire_date || !salary) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check for duplicate email or phone number
    const checkDuplicateQuery = 'SELECT * FROM employees WHERE email = ? OR phone_number = ?';
    db.query(checkDuplicateQuery, [email, phone_number], (err, results) => {
        if (err) {
            console.error('Error checking duplicates:', err);
            return res.status(500).json({ message: 'Database error checking duplicates' });
        }

        if (results.length > 0) {
            return res.status(409).json({ message: 'Employee with this email or phone number already exists' });
        }

        // Check if the department exists in the departments table (optional check, depending on your use case)
        // Get department_id
        const getDeptQuery = 'SELECT department_id FROM departments WHERE department_name = ?';
        db.query(getDeptQuery, [department], (err, deptResults) => {
            if (err) {
                console.error('Error fetching department:', err);
                return res.status(500).json({ message: 'Database error fetching department' });
            }

            let department_id;
            if (deptResults.length > 0) {
                department_id = deptResults[0].department_id;
                insertEmployee(department_id);
            } else {
                // Insert new department if not exists
                const insertDeptQuery = 'INSERT INTO departments (department_name) VALUES (?)';
                db.query(insertDeptQuery, [department], (err, result) => {
                    if (err) {
                        console.error('Error inserting department:', err);
                        return res.status(500).json({ message: 'Database error creating department' });
                    }
                    department_id = result.insertId;
                    insertEmployee(department_id);
                });
            }
        });

        function insertEmployee(department_id) {
            // The trigger will automatically assign branch_emp_id
            const insertQuery = `
                INSERT INTO employees (branch_id, name, phone_number, email, address, position, department_id, hire_date, salary, bank_name, account_number, tax_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(insertQuery, [branch_id, name, phone_number, email, address, position, department_id, hire_date, salary, bank_name, account_number, tax_id], (err, result) => {
                if (err) {
                    console.error('Error adding employee:', err);
                    return res.status(500).json({ message: 'Database error adding employee' });
                }

                // Fetch the assigned branch_emp_id
                db.query('SELECT branch_emp_id FROM employees WHERE emp_id = ?', [result.insertId], (err, idResult) => {
                    if (err) {
                        return res.status(201).json({ message: 'Employee added successfully', emp_id: result.insertId });
                    }
                    res.status(201).json({
                        message: 'Employee added successfully',
                        emp_id: result.insertId,
                        branch_emp_id: idResult[0].branch_emp_id
                    });
                });
            });
        }
    });
});

// Remove Employee Route
app.post('/api/remove-employee', checkRole('admin'), (req, res) => {
    let { emp_id } = req.body;

    if (!emp_id) {
        return res.status(400).json({ message: 'Employee ID is required' });
    }

    // ONLY accept badge format (e.g., "B1-007")
    const badgeMatch = emp_id.match(/^B(\d+)-(\d+)$/);

    if (!badgeMatch) {
        return res.status(400).json({ message: 'Invalid format! Please use badge format (e.g., B1-007)' });
    }

    // Parse badge ID
    const branch_id = parseInt(badgeMatch[1]);
    const branch_emp_id = parseInt(badgeMatch[2]);

    // Check if user is trying to access another branch's employee
    if (branch_id !== req.session.user.id) {
        return res.status(403).json({ message: 'Access denied! You can only remove employees from your own branch.' });
    }

    // Look up the emp_id from branch_id and branch_emp_id
    const lookupQuery = 'SELECT emp_id FROM employees WHERE branch_id = ? AND branch_emp_id = ?';
    db.query(lookupQuery, [branch_id, branch_emp_id], (err, results) => {
        if (err) {
            console.error('Error looking up employee:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Employee not found with badge ID: ' + emp_id });
        }

        // Delete the employee
        const actualEmpId = results[0].emp_id;
        const deleteQuery = 'DELETE FROM employees WHERE emp_id = ?';

        db.query(deleteQuery, [actualEmpId], (err, result) => {
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
});



// Update Employee Route
// Update employee details
app.put('/api/update-employee', checkRole('admin'), (req, res) => {
    let { emp_id, name, phone_number, email, address, bank_name, account_number, tax_id } = req.body;

    // Validate input
    if (!emp_id || !name || !phone_number || !email || !address) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // ONLY accept badge format (e.g., "B1-007")
    const badgeMatch = emp_id.match(/^B(\d+)-(\d+)$/);

    if (!badgeMatch) {
        return res.status(400).json({ message: 'Invalid format! Please use badge format (e.g., B1-007)' });
    }

    // Parse badge ID
    const branch_id = parseInt(badgeMatch[1]);
    const branch_emp_id = parseInt(badgeMatch[2]);

    // Check if user is trying to access another branch's employee
    if (branch_id !== req.session.user.id) {
        return res.status(403).json({ message: 'Access denied! You can only update employees from your own branch.' });
    }

    // Look up the emp_id from branch_id and branch_emp_id
    const lookupQuery = 'SELECT emp_id FROM employees WHERE branch_id = ? AND branch_emp_id = ?';
    db.query(lookupQuery, [branch_id, branch_emp_id], (err, results) => {
        if (err) {
            console.error('Error looking up employee:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Employee not found with badge ID: ' + emp_id });
        }

        // Update the employee
        const actualEmpId = results[0].emp_id;
        const updateQuery = `
            UPDATE employees
            SET name = ?, phone_number = ?, email = ?, address = ?, bank_name = ?, account_number = ?, tax_id = ?
            WHERE emp_id = ?`;

        db.query(updateQuery, [name, phone_number, email, address, bank_name, account_number, tax_id, actualEmpId], (err, result) => {
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
});


function validatePayrollData(data) {
    const { emp_id, hours_worked, pay_period_start, pay_period_end } = data;

    if (!emp_id || !hours_worked || !pay_period_start || !pay_period_end) {
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
    let empId = req.query.emp_id;

    // ONLY accept badge format (e.g., "B1-007")
    const badgeMatch = empId.match(/^B(\d+)-(\d+)$/);

    if (!badgeMatch) {
        return res.status(400).json({ message: 'Invalid format! Please use badge format (e.g., B1-007)' });
    }

    // Parse badge ID
    const badge_branch_id = parseInt(badgeMatch[1]);
    const branch_emp_id = parseInt(badgeMatch[2]);

    // Check if user is trying to access another branch's employee
    if (badge_branch_id !== branchId) {
        return res.status(403).json({ message: 'Access denied! You can only view employees from your own branch.' });
    }

    const query = `
        SELECT e.name, d.department_name
        FROM employees e
        JOIN departments d ON e.department_id = d.department_id
        WHERE e.branch_id = ? AND e.branch_emp_id = ? `;

    db.query(query, [badge_branch_id, branch_emp_id], (err, results) => {
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
app.post('/api/generate-payroll', checkRole('admin'), (req, res) => {
    let { emp_id, hours_worked, pay_period_start, pay_period_end, name, department_name } = req.body;

    // ONLY accept badge format (e.g., "B1-007")
    const badgeMatch = emp_id.match(/^B(\d+)-(\d+)$/);

    if (!badgeMatch) {
        return res.status(400).json({ message: 'Invalid format! Please use badge format (e.g., B1-007)' });
    }

    // Parse badge ID
    const branch_id = parseInt(badgeMatch[1]);
    const branch_emp_id = parseInt(badgeMatch[2]);

    // Check if user is trying to access another branch's employee
    if (branch_id !== req.session.user.id) {
        return res.status(403).json({ message: 'Access denied! You can only generate payroll for employees from your own branch.' });
    }

    // Look up the actual emp_id from badge ID
    const lookupQuery = 'SELECT emp_id, account_number, bank_name FROM employees WHERE branch_id = ? AND branch_emp_id = ?';
    db.query(lookupQuery, [branch_id, branch_emp_id], (err, results) => {
        if (err) {
            console.error('Error looking up employee:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Employee not found with badge ID: ' + emp_id });
        }

        // Use the actual emp_id for the rest of the process
        const actualEmpId = results[0].emp_id;
        const accountNumber = results[0].account_number;
        const bankName = results[0].bank_name;

        // Continue with payroll generation using actualEmpId
        generatePayrollForEmployee(actualEmpId, accountNumber, bankName);
    });

    function generatePayrollForEmployee(actualEmpId, accountNumber, bankName) {
        // Input validation
        const validation = validatePayrollData(req.body);
        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        const pay_rate = 30; // $30/hr (You can also get this from the database if it's dynamic)

        // Calculate Basic Pay
        const basic_pay = hours_worked * pay_rate;

        // Calculate Allowances
        const hra = basic_pay * 0.20; // 20% HRA
        const da = basic_pay * 0.10;  // 10% DA
        const allowances = hra + da;

        // Calculate Gross Pay (Basic + Allowances)
        const gross_pay = basic_pay + allowances;

        // Calculate Deductions
        const pf = basic_pay * 0.12; // 12% PF
        const professional_tax = basic_pay * 0.02; // 2% Professional Tax
        const tax_deduction = basic_pay * 0.13; // 13% Income Tax
        const deductions = pf + professional_tax + tax_deduction;

        // Calculate Net Pay
        const net_pay = gross_pay - deductions;

        // Automatically set the pay date as pay period end date + 2 days
        const payEndDate = new Date(pay_period_end);
        const payDateObj = new Date(payEndDate);
        payDateObj.setDate(payEndDate.getDate() + 2);
        const pay_date = payDateObj.toISOString().split('T')[0];

        // Save payroll to the database
        const query = `
        INSERT INTO payroll(emp_id, pay_period_start, pay_period_end, hours_worked, pay_rate, total_pay, hra, da, pf, professional_tax, allowances, deductions, tax_deduction, net_pay, pay_date)
                        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `;
        db.query(query, [actualEmpId, pay_period_start, pay_period_end, hours_worked, pay_rate, basic_pay, hra, da, pf, professional_tax, allowances, deductions, tax_deduction, net_pay, pay_date], (err) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).json({ message: 'Error saving payroll data.' });
            }

            // Mask account number - show only last 4 digits
            let maskedAccount = 'N/A';
            if (accountNumber) {
                const last4 = accountNumber.slice(-4);
                maskedAccount = `xxxx-xxxx-xxxx-${last4}`;
            }

            // Return the payroll summary with employee details
            res.json({
                employee: {
                    name: name,
                    department_name: department_name,
                    bank_name: bankName || 'N/A',
                    account_number: maskedAccount
                },
                pay_period_start,
                pay_period_end,
                hours_worked,
                pay_rate,
                total_pay: basic_pay,
                hra,
                da,
                pf,
                professional_tax,
                allowances,
                deductions,
                tax_deduction,
                net_pay,
                pay_date,  // Return the calculated pay date
            });
        });
    }
});


app.get('/payroll', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to login if not logged in
    }
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access Denied');
    }

    res.sendFile(path.join(__dirname, '../public', 'ManagePayroll.html')); // Serve the info page
});

app.get('/Generatepayroll', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to login if not logged in
    }
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access Denied');
    }

    res.sendFile(path.join(__dirname, '../public', 'GeneratePayroll.html')); // Serve the info page
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

    res.sendFile(path.join(__dirname, '../public', 'Profile.html')); // Serve the info page
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

// Get Employees Route
app.get('/api/get-employees', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const branchId = req.session.user.id;

    const query = `
        SELECT e.emp_id, e.branch_emp_id, e.branch_id, e.name, e.phone_number, e.email, e.address, e.position, e.hire_date, e.bank_name, e.account_number, e.tax_id, d.department_name AS department_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.department_id
        WHERE e.branch_id = ? `;

    db.query(query, [branchId], (err, results) => {
        if (err) {
            console.error('Error fetching employees:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        console.log('Get Employees Result:', util.inspect(results, { showHidden: true, depth: null }));
        const mappedResults = results.map(row => ({
            ...row,
            department_name: row.department_name
        }));
        console.log('Mapped Results:', mappedResults);
        res.json(mappedResults);
    });
});

// Get Payroll Route
app.get('/api/get-payroll', (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const branchId = req.session.user.id;

    const query = `
    SELECT payroll.payroll_id,
                            employees.emp_id AS employee_id,
                                employees.branch_emp_id,
                                employees.branch_id,
                                employees.name AS employee_name,
                                    payroll.pay_rate AS hourly_pay,
                                        payroll.hours_worked,
                                        payroll.total_pay AS gross_pay,
                                            payroll.hra,
                                            payroll.da,
                                            payroll.pf,
                                            payroll.professional_tax,
                                            payroll.allowances,
                                            payroll.deductions,
                                            payroll.tax_deduction AS income_tax,
                                                payroll.net_pay,
                                                payroll.pay_period_end AS pay_date,
                                                    departments.department_name
    FROM payroll
    JOIN employees ON payroll.emp_id = employees.emp_id
    JOIN departments ON employees.department_id = departments.department_id
    WHERE employees.branch_id = ?; `;

    db.query(query, [branchId], (err, results) => {
        if (err) {
            console.error('Error fetching payroll:', err);
            return res.status(500).json({ message: 'Error fetching payroll data' });
        }
        res.json(results);
    });
});

// Route to fetch filtered payroll data based on employee name, employee ID, and department
app.post('/api/get-filtered-payroll', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const branchId = req.session.user.id;
    const { searchTerm, department } = req.body;

    // Base query
    let query = `
    SELECT payroll.payroll_id,
                            employees.emp_id AS employee_id,
                                employees.name AS employee_name,
                                    payroll.pay_rate AS hourly_pay,
                                        payroll.hours_worked,
                                        payroll.total_pay AS gross_pay,
                                            payroll.tax_deduction AS tax_deductions,
                                                payroll.net_pay,
                                                payroll.pay_period_end,
                                                (payroll.pay_period_end + INTERVAL 2 DAY) AS pay_date,
                                                    departments.department_name
    FROM payroll
    JOIN employees ON payroll.emp_id = employees.emp_id
    JOIN departments ON employees.department_id = departments.department_id
    WHERE employees.branch_id = ?
                        `;

    let values = [branchId];

    // Add search filter for employee name or employee ID
    if (searchTerm) {
        query += ` AND(LOWER(employees.name) LIKE LOWER(?) OR LOWER(employees.emp_id) LIKE LOWER(?))`;
        values.push(`% ${searchTerm}% `, ` % ${searchTerm}% `);
    }

    // Add department filter if not "all"
    if (department && department !== 'all') {
        query += ` AND LOWER(departments.department_name) = LOWER(?)`;
        values.push(department);
    }

    // Execute the query with filters
    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error fetching filtered payroll:', err);
            return res.status(500).json({ message: 'Database query failed', error: err.message });
        }

        if (results.length > 0) {
            res.json(results); // Send filtered payroll data
        } else {
            res.status(404).json({ message: 'No matching payroll data found.' });
        }
    });
});


// Dashboard Stats Route
app.get('/api/dashboard-stats', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const branchId = req.session.user.id;

    // Queries
    const totalEmployeesQuery = 'SELECT COUNT(*) AS count FROM employees WHERE branch_id = ?';
    const lastPayrollTotalQuery = `
        SELECT SUM(p.total_pay) as total
        FROM payroll p
        JOIN employees e ON p.emp_id = e.emp_id
        WHERE e.branch_id = ?
    `;
    const departmentCountQuery = `
        SELECT COUNT(DISTINCT department_id) AS count 
        FROM employees 
        WHERE branch_id = ?
                    `;

    // Chart Data Queries
    const payrollByDeptQuery = `
        SELECT d.department_name, SUM(p.total_pay) as total
        FROM payroll p
        JOIN employees e ON p.emp_id = e.emp_id
        JOIN departments d ON e.department_id = d.department_id
        WHERE e.branch_id = ?
                    GROUP BY d.department_name
                        `;

    const employeesByDeptQuery = `
        SELECT d.department_name, COUNT(e.emp_id) as count
        FROM employees e
        JOIN departments d ON e.department_id = d.department_id
        WHERE e.branch_id = ?
                    GROUP BY d.department_name
                        `;

    try {
        // Execute queries using Promise.all for efficiency
        const [
            employeesResult,
            payrollResult,
            deptResult,
            payrollByDeptResult,
            employeesByDeptResult
        ] = await Promise.all([
            new Promise((resolve, reject) => db.query(totalEmployeesQuery, [branchId], (err, res) => err ? reject(err) : resolve(res))),
            new Promise((resolve, reject) => db.query(lastPayrollTotalQuery, [branchId], (err, res) => err ? reject(err) : resolve(res))),
            new Promise((resolve, reject) => db.query(departmentCountQuery, [branchId], (err, res) => err ? reject(err) : resolve(res))),
            new Promise((resolve, reject) => db.query(payrollByDeptQuery, [branchId], (err, res) => err ? reject(err) : resolve(res))),
            new Promise((resolve, reject) => db.query(employeesByDeptQuery, [branchId], (err, res) => err ? reject(err) : resolve(res)))
        ]);

        res.json({
            totalEmployees: employeesResult[0].count,
            lastPayrollTotal: payrollResult[0].total || 0,
            departmentCount: deptResult[0].count,
            payrollByDept: payrollByDeptResult,
            employeesByDept: employeesByDeptResult
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

// Email Service
const { sendPayslipEmail } = require('./utils/emailService');

// Email Payslip Route
app.post('/api/email/payslip', (req, res) => {
    const { emp_id } = req.body;

    if (!emp_id) {
        return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Fetch employee details and latest payroll
    const query = `
        SELECT e.name, e.email, p.net_pay, p.pay_period_end
        FROM employees e
        JOIN payroll p ON e.emp_id = p.emp_id
        WHERE e.emp_id = ?
                    ORDER BY p.pay_date DESC
        LIMIT 1
    `;

    db.query(query, [emp_id], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Employee or payroll record not found' });
        }

        const { name, email, net_pay, pay_period_end } = results[0];

        if (!email) {
            return res.status(400).json({ message: 'Employee does not have an email address' });
        }

        const result = await sendPayslipEmail(email, name, new Date(pay_period_end).toLocaleDateString(), net_pay);

        if (result.success) {
            res.json({ message: 'Email sent successfully', previewUrl: result.previewUrl });
        } else {
            res.status(500).json({ message: 'Failed to send email', error: result.error });
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = { app, validatePayrollData };
