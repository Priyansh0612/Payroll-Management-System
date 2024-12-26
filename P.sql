-- Create the database

CREATE DATABASE payroll_db;
USE payroll_db;

-- Create Users table 
CREATE TABLE users (
    Branch_id INT PRIMARY KEY AUTO_INCREMENT, -- Use AUTO_INCREMENT for User_id
    Branch_name VARCHAR(500) NOT NULL UNIQUE, -- Ensure unique usernames
    Branch_Password VARCHAR(255) NOT NULL, -- Increase length for better security
    Branch_ContactNo VARCHAR(20) NOT NULL,
    Branch_Email VARCHAR(255) NOT NULL
    
);

-- Create Departments table
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE -- Ensure unique depa rtment names
);

-- Create Employees table
CREATE TABLE employees (
    emp_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    address VARCHAR(255),
    position VARCHAR(255),
    department_id INT, -- Foreign key to departments table
    hire_date DATE,
    salary DECIMAL(10, 2),
    FOREIGN KEY (branch_id) REFERENCES users(Branch_id), 
    FOREIGN KEY (department_id) REFERENCES departments(department_id) -- Foreign key constraint
);

-- Create Payroll table
CREATE TABLE payroll (
    payroll_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id INT,
    pay_period_start DATE,   -- Pay period start date
    pay_period_end DATE,     -- Pay period end date
    hours_worked DECIMAL(10, 2),
    pay_rate DECIMAL(10, 2) DEFAULT 30.00,  -- Pay rate (default $30/hr)
    total_pay DECIMAL(10, 2),
    tax_deduction DECIMAL(10, 2) DEFAULT 0.00,  -- Tax deductions
    net_pay DECIMAL(10, 2),
    pay_date DATE,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE
);

-- Insert sample data for Users
INSERT INTO users (Branch_name, Branch_Password,Branch_ContactNo,Branch_Email) VALUES 
('Hydro_One_1', 'HO@123','+1 (365) 883 2370','Hydro123@gmail.com'),
('Hydro_One_2', 'HO@456','+1 (365) 883 2371','Hydro456@gmail.com');

-- Insert sample data for Departments
INSERT INTO departments (department_name) VALUES 
('Human Resources'), 
('Finance'), 
('Engineering'), 
('Sales');

-- Insert sample data for Employees
INSERT INTO employees (branch_id, name, phone_number, email, address, position, department_id, hire_date, salary) 
VALUES
-- Branch 1 Employees
(1, 'Michael Scott', '647-123-4567', 'michael.scott@dundermifflin.com', '101 Scranton Ave, ON', 'Branch Manager', 1, '2023-06-15', 95000),
(1, 'Pam Beesly', '416-234-5678', 'pam.beesly@dundermifflin.com', '202 Paper St, ON', 'Receptionist', 1, '2023-03-22', 45000),
(1, 'Jim Halpert', '905-345-6789', 'jim.halpert@dundermifflin.com', '303 Office Lane, ON', 'Sales Representative', 1, '2021-11-01', 65000),
(1, 'Dwight Schrute', '647-456-7890', 'dwight.schrute@dundermifflin.com', '404 Beet Farm Rd, ON', 'Assistant to the Regional Manager', 4, '2019-02-25', 80000),
(1, 'Angela Martin', '647-567-8901', 'angela.martin@dundermifflin.com', '505 Cat St, ON', 'Accounting Specialist', 3, '2020-09-10', 52000),
(1, 'Stanley Hudson', '416-678-9012', 'stanley.hudson@dundermifflin.com', '606 Pretzel Blvd, ON', 'Sales Representative', 3, '2019-07-15', 60000),
(1, 'Phyllis Vance', '905-789-0123', 'phyllis.vance@dundermifflin.com', '707 Quiet Ave, ON', 'Sales Representative', 4, '2018-05-20', 58000),
(1, 'Ryan Howard', '647-890-1234', 'ryan.howard@dundermifflin.com', '808 Temp Way, ON', 'Temp', 1, '2022-08-01', 40000),
(1, 'Kelly Kapoor', '416-901-2345', 'kelly.kapoor@dundermifflin.com', '909 Gossip St, ON', 'Customer Service Rep', 2, '2019-01-05', 45000),
(1, 'Kevin Malone', '905-012-3456', 'kevin.malone@dundermifflin.com', '1010 Chili Ave, ON', 'Accounting Specialist', 3, '2017-04-10', 50000),
(1, 'Oscar Martinez', '647-123-4568', 'oscar.martinez@dundermifflin.com', '1111 Math Ln, ON', 'Senior Accountant', 3, '2015-12-01', 55000),
(1, 'Meredith Palmer', '416-234-5679', 'meredith.palmer@dundermifflin.com', '1212 Party Blvd, ON', 'Supplier Relations', 3, '2016-02-20', 46000),
(1, 'Creed Bratton', '905-345-6780', 'creed.bratton@dundermifflin.com', '1313 Mystery St, ON', 'Quality Assurance', 3, '2014-03-12', 47000),
(1, 'Toby Flenderson', '647-456-7891', 'toby.flenderson@dundermifflin.com', '1414 HR Rd, ON', 'HR Representative', 2, '2012-11-11', 48000),

-- Branch 2 Employees
(2, 'Leslie Knope', '780-123-9876', 'leslie.knope@pawnee.com', '123 Parks Blvd, AB', 'Government Official', 1, '2015-04-10', 87000),
(2, 'Ron Swanson', '587-456-1234', 'ron.swanson@pawnee.com', '456 Woodshop Lane, AB', 'Director', 1, '2010-09-17', 120000),
(2, 'April Ludgate', '780-789-6543', 'april.ludgate@pawnee.com', '789 Emo St, AB', 'Intern', 3, '2023-01-20', 42000),
(2, 'Tom Haverford', '780-432-9870', 'tom.haverford@pawnee.com', '202 Pawnee Plaza, AB', 'Marketing Executive', 2, '2020-08-12', 75000),
(2, 'Ann Perkins', '587-234-5678', 'ann.perkins@pawnee.com', '303 Nurse Rd, AB', 'Nurse', 2, '2018-03-15', 68000),
(2, 'Andy Dwyer', '780-567-8901', 'andy.dwyer@pawnee.com', '404 Band St, AB', 'Shoeshiner', 4, '2019-10-25', 32000),
(2, 'Chris Traeger', '587-678-9012', 'chris.traeger@pawnee.com', '505 Wellness Way, AB', 'City Manager', 1, '2012-06-01', 95000),
(2, 'Ben Wyatt', '780-789-0123', 'ben.wyatt@pawnee.com', '606 Budget Blvd, AB', 'Accountant', 1, '2013-07-10', 93000),
(2, 'Donna Meagle', '587-890-1234', 'donna.meagle@pawnee.com', '707 Mercedes Ln, AB', 'Office Manager', 2, '2011-09-30', 71000),
(2, 'Jerry Gergich', '780-901-2345', 'jerry.gergich@pawnee.com', '808 Mistake St, AB', 'Public Servant', 3, '2008-02-20', 48000),
(2, 'Mona-Lisa Saperstein', '587-012-3456', 'mona-lisa.saperstein@pawnee.com', '909 Chaos Rd, AB', 'Sales Rep', 3, '2022-05-15', 41000),
(2, 'Jean-Ralphio Saperstein', '780-345-6789', 'jean-ralphio.saperstein@pawnee.com', '1010 Party Ave, AB', 'Entrepreneur', 2, '2020-11-01', 67000),
(2, 'Craig Middlebrooks', '587-456-7890', 'craig.middlebrooks@pawnee.com', '1111 Passion St, AB', 'Office Supervisor', 2, '2017-08-10', 70000),
(2, 'Ethel Beavers', '780-678-9012', 'ethel.beavers@pawnee.com', '1212 Archives Ln, AB', 'Clerk', 4, '2010-01-01', 45000),

-- Additional Employees
(1, 'Monica Geller', '416-345-6543', 'monica.geller@friends.com', '123 Central Perk, NY', 'Chef', 3, '2022-09-01', 60000),
(1, 'Ross Geller', '647-234-8765', 'ross.geller@friends.com', '456 Dino Ave, NY', 'Paleontologist', 3, '2021-04-15', 85000),
(2, 'Rachel Green', '587-987-4321', 'rachel.green@friends.com', '789 Fashion Blvd, NY', 'Fashion Executive', 2, '2020-12-05', 70000),
(2, 'Chandler Bing', '780-543-2109', 'chandler.bing@friends.com', '202 Sarcastic St, NY', 'IT Specialist', 2, '2021-07-07', 80000),
(1, 'Phoebe Buffay', '905-678-3456', 'phoebe.buffay@friends.com', '101 Smelly Cat Ln, NY', 'Musician', 3, '2018-02-10', 45000),
(2, 'Joey Tribbiani', '780-678-1234', 'joey.tribbiani@friends.com', '404 Actor Blvd, NY', 'Actor', 3, '2019-05-20', 55000),
(1, 'Stanley Hudson', '647-543-0987', 'stanley.hudson@dundermifflin.com', '505 Crossword Lane, ON', 'Sales Associate', 4, '2017-01-15', 68000);


INSERT INTO payroll (emp_id, pay_period_start, pay_period_end, hours_worked, pay_rate, total_pay, tax_deduction, net_pay, pay_date)
VALUES
(1, '2024-11-01', '2024-11-15', 80, 30.00, 2400.00, 300.00, 2100.00, '2024-11-20'),
(2, '2024-11-01', '2024-11-15', 90, 28.00, 2520.00, 330.00, 2190.00, '2024-11-20'),
(3, '2024-11-01', '2024-11-15', 85, 29.00, 2465.00, 320.00, 2145.00, '2024-11-20'),
(4, '2024-11-01', '2024-11-15', 78, 27.00, 2106.00, 280.00, 1826.00, '2024-11-20'),
(5, '2024-11-01', '2024-11-15', 95, 35.00, 3325.00, 430.00, 2895.00, '2024-11-20'),
(6, '2024-11-01', '2024-11-15', 100, 40.00, 4000.00, 520.00, 3480.00, '2024-11-20'),
(7, '2024-11-01', '2024-11-15', 72, 25.00, 1800.00, 220.00, 1580.00, '2024-11-20'),
(8, '2024-11-01', '2024-11-15', 88, 30.00, 2640.00, 340.00, 2300.00, '2024-11-20'),
(9, '2024-11-01', '2024-11-15', 80, 32.00, 2560.00, 310.00, 2250.00, '2024-11-20'),
(10, '2024-11-01', '2024-11-15', 75, 30.00, 2250.00, 290.00, 1960.00, '2024-11-20'),
(11, '2024-11-01', '2024-11-15', 92, 30.00, 2760.00, 360.00, 2400.00, '2024-11-20'),
(12, '2024-11-01', '2024-11-15', 85, 28.00, 2380.00, 300.00, 2080.00, '2024-11-20'),
(13, '2024-11-01', '2024-11-15', 90, 33.00, 2970.00, 380.00, 2590.00, '2024-11-20'),
(14, '2024-11-01', '2024-11-15', 75, 30.00, 2250.00, 290.00, 1960.00, '2024-11-20'),
(15, '2024-11-01', '2024-11-15', 82, 30.00, 2460.00, 320.00, 2140.00, '2024-11-20'),
(16, '2024-11-01', '2024-11-15', 88, 31.00, 2728.00, 350.00, 2378.00, '2024-11-20'),
(17, '2024-11-01', '2024-11-15', 80, 29.00, 2320.00, 300.00, 2020.00, '2024-11-20'),
(18, '2024-11-01', '2024-11-15', 95, 34.00, 3230.00, 420.00, 2810.00, '2024-11-20'),
(19, '2024-11-01', '2024-11-15', 78, 26.00, 2028.00, 270.00, 1758.00, '2024-11-20'),
(20, '2024-11-01', '2024-11-15', 84, 32.00, 2688.00, 340.00, 2348.00, '2024-11-20');



-- Use the generated emp_id values to insert into Payroll
-- In this case, adjust these IDs based on the output of the previous SELECT statement

SET SQL_SAFE_UPDATES = 0; -- Disable safe update mode

UPDATE employees 
SET branch_id = (
    SELECT Branch_id 
    FROM users 
    WHERE Branch_id = employees.branch_id
)
WHERE EXISTS (
    SELECT 1 
    FROM users 
    WHERE Branch_id = employees.branch_id
);
 SELECT e.emp_id, e.name, e.phone_number, e.email, e.address, e.hire_date, e.position
    FROM employees e
    WHERE e.branch_id = 1;


-- Display all users
SELECT * FROM payroll;
SELECT * FROM departments;
SELECT * FROM users;
SELECT * FROM employees;

    
SHOW FULL TABLES WHERE payroll LIKE "%VIEW";








