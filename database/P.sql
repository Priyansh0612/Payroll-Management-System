-- ==========================================
-- 1. SETUP DATABASE
-- ==========================================
CREATE DATABASE IF NOT EXISTS payroll_db;
USE payroll_db;

-- Drop tables in reverse order of dependency to avoid foreign key errors
DROP TABLE IF EXISTS payroll;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

-- ==========================================
-- 2. CREATE TABLES
-- ==========================================

-- Create Users table (Stores Branch Login Info)
CREATE TABLE users (
    Branch_id INT PRIMARY KEY AUTO_INCREMENT,
    Branch_name VARCHAR(500) NOT NULL UNIQUE, 
    Branch_Password VARCHAR(255) NOT NULL, 
    Branch_ContactNo VARCHAR(20) NOT NULL,
    Branch_Email VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employee') DEFAULT 'employee'
);

-- Create Departments table
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
);

-- Create Employees table
CREATE TABLE employees (
    emp_id INT AUTO_INCREMENT PRIMARY KEY, -- Global System ID (Hidden linking key)
    branch_id INT NOT NULL,
    branch_emp_id INT DEFAULT 0,           -- The "Badge Number" (Resets per branch)
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    address VARCHAR(255),
    position VARCHAR(255),
    department_id INT,
    hire_date DATE,
    salary DECIMAL(10, 2),
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    tax_id VARCHAR(50),
    FOREIGN KEY (branch_id) REFERENCES users(Branch_id), 
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- ==========================================
-- 3. THE TRIGGER (MAGIC FIX)
-- ==========================================
-- This section automatically calculates the branch_emp_id
-- so that every branch starts at Employee #1.
DELIMITER //

CREATE TRIGGER before_employee_insert
BEFORE INSERT ON employees
FOR EACH ROW
BEGIN
    DECLARE next_id INT;
    
    -- Check the highest ID currently in THIS specific branch
    SELECT COALESCE(MAX(branch_emp_id), 0) + 1 INTO next_id
    FROM employees
    WHERE branch_id = NEW.branch_id;
    
    -- Assign the new sequence number
    SET NEW.branch_emp_id = next_id;
END;
//
DELIMITER ;

-- ==========================================
-- 4. CREATE REMAINING TABLES
-- ==========================================

-- Create Payroll table
CREATE TABLE payroll (
    payroll_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id INT, -- Links to the global System ID
    pay_period_start DATE,
    pay_period_end DATE,
    hours_worked DECIMAL(10, 2),
    pay_rate DECIMAL(10, 2) DEFAULT 30.00,
    hra DECIMAL(10, 2) DEFAULT 0.00,
    da DECIMAL(10, 2) DEFAULT 0.00,
    pf DECIMAL(10, 2) DEFAULT 0.00,
    professional_tax DECIMAL(10, 2) DEFAULT 0.00,
    allowances DECIMAL(10, 2) DEFAULT 0.00,
    deductions DECIMAL(10, 2) DEFAULT 0.00,
    total_pay DECIMAL(10, 2),
    tax_deduction DECIMAL(10, 2) DEFAULT 0.00,
    net_pay DECIMAL(10, 2),
    pay_date DATE,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE
);

-- ==========================================
-- 5. INSERT DATA
-- ==========================================

-- Insert Users (Branches)
INSERT INTO users (Branch_name, Branch_Password, Branch_ContactNo, Branch_Email, role) VALUES 
('Hydro_One_1', 'HO@123', '+1 (365) 883 2370', 'Hydro123@gmail.com', 'admin'),
('Hydro_One_2', 'HO@456', '+1 (365) 883 2371', 'Hydro456@gmail.com', 'admin');

-- Insert Departments
INSERT INTO departments (department_name) VALUES 
('Human Resources'), 
('Finance'), 
('Engineering'), 
('Sales');

-- Insert Employees 
-- Note: We do NOT insert branch_emp_id here. The Trigger handles it.

-- Branch 1 Employees (Will be IDs 1-14)
INSERT INTO employees (branch_id, name, phone_number, email, address, position, department_id, hire_date, salary, bank_name, account_number, tax_id) VALUES
(1, 'Michael Scott', '647-123-4567', 'michael.scott@dundermifflin.com', '101 Scranton Ave, ON', 'Branch Manager', 1, '2023-06-15', 95000, 'TD Bank', '4532-1234-5678-9001', 'TAX-001-4567'),
(1, 'Pam Beesly', '416-234-5678', 'pam.beesly@dundermifflin.com', '202 Paper St, ON', 'Receptionist', 1, '2023-03-22', 45000, 'RBC', '4539-2345-6789-0112', 'TAX-002-5678'),
(1, 'Jim Halpert', '905-345-6789', 'jim.halpert@dundermifflin.com', '303 Office Lane, ON', 'Sales Representative', 1, '2021-11-01', 65000, 'Scotiabank', '4556-3456-7890-1223', 'TAX-003-6789'),
(1, 'Dwight Schrute', '647-456-7890', 'dwight.schrute@dundermifflin.com', '404 Beet Farm Rd, ON', 'Assistant to the Regional Manager', 4, '2019-02-25', 80000, 'BMO', '4024-4567-8901-2334', 'TAX-004-7890'),
(1, 'Angela Martin', '647-567-8901', 'angela.martin@dundermifflin.com', '505 Cat St, ON', 'Accounting Specialist', 3, '2020-09-10', 52000, 'CIBC', '4506-5678-9012-3445', 'TAX-005-8901'),
(1, 'Stanley Hudson', '416-678-9012', 'stanley.hudson@dundermifflin.com', '606 Pretzel Blvd, ON', 'Sales Representative', 3, '2019-07-15', 60000, 'TD Bank', '4532-6789-0123-4556', 'TAX-006-9012'),
(1, 'Phyllis Vance', '905-789-0123', 'phyllis.vance@dundermifflin.com', '707 Quiet Ave, ON', 'Sales Representative', 4, '2018-05-20', 58000, 'RBC', '4539-7890-1234-5667', 'TAX-007-0123'),
(1, 'Ryan Howard', '647-890-1234', 'ryan.howard@dundermifflin.com', '808 Temp Way, ON', 'Temp', 1, '2022-08-01', 40000, 'Scotiabank', '4556-8901-2345-6778', 'TAX-008-1234'),
(1, 'Kelly Kapoor', '416-901-2345', 'kelly.kapoor@dundermifflin.com', '909 Gossip St, ON', 'Customer Service Rep', 2, '2019-01-05', 45000, 'BMO', '4024-9012-3456-7889', 'TAX-009-2345'),
(1, 'Kevin Malone', '905-012-3456', 'kevin.malone@dundermifflin.com', '1010 Chili Ave, ON', 'Accounting Specialist', 3, '2017-04-10', 50000, 'CIBC', '4506-0123-4567-8990', 'TAX-010-3456'),
(1, 'Oscar Martinez', '647-123-4568', 'oscar.martinez@dundermifflin.com', '1111 Math Ln, ON', 'Senior Accountant', 3, '2015-12-01', 55000, 'TD Bank', '4532-1234-5678-9101', 'TAX-011-4568'),
(1, 'Meredith Palmer', '416-234-5679', 'meredith.palmer@dundermifflin.com', '1212 Party Blvd, ON', 'Supplier Relations', 3, '2016-02-20', 46000, 'RBC', '4539-2345-6789-0212', 'TAX-012-5679'),
(1, 'Creed Bratton', '905-345-6780', 'creed.bratton@dundermifflin.com', '1313 Mystery St, ON', 'Quality Assurance', 3, '2014-03-12', 47000, 'Scotiabank', '4556-3456-7890-1323', 'TAX-013-6780'),
(1, 'Toby Flenderson', '647-456-7891', 'toby.flenderson@dundermifflin.com', '1414 HR Rd, ON', 'HR Representative', 2, '2012-11-11', 48000, 'BMO', '4024-4567-8901-2434', 'TAX-014-7891');

-- Branch 2 Employees (Will RESTART at ID 1 because of the Trigger)
INSERT INTO employees (branch_id, name, phone_number, email, address, position, department_id, hire_date, salary, bank_name, account_number, tax_id) VALUES
(2, 'Leslie Knope', '780-123-9876', 'leslie.knope@pawnee.com', '123 Parks Blvd, AB', 'Government Official', 1, '2015-04-10', 87000, 'ATB Financial', '4716-1234-5678-9001', 'TAX-115-9876'),
(2, 'Ron Swanson', '587-456-1234', 'ron.swanson@pawnee.com', '456 Woodshop Lane, AB', 'Director', 1, '2010-09-17', 120000, 'TD Bank', '4532-2345-6789-0112', 'TAX-116-1234'),
(2, 'April Ludgate', '780-789-6543', 'april.ludgate@pawnee.com', '789 Emo St, AB', 'Intern', 3, '2023-01-20', 42000, 'RBC', '4539-3456-7890-1223', 'TAX-117-6543'),
(2, 'Tom Haverford', '780-432-9870', 'tom.haverford@pawnee.com', '202 Pawnee Plaza, AB', 'Marketing Executive', 2, '2020-08-12', 75000, 'Scotiabank', '4556-4567-8901-2334', 'TAX-118-9870'),
(2, 'Ann Perkins', '587-234-5678', 'ann.perkins@pawnee.com', '303 Nurse Rd, AB', 'Nurse', 2, '2018-03-15', 68000, 'BMO', '4024-5678-9012-3445', 'TAX-119-5678'),
(2, 'Andy Dwyer', '780-567-8901', 'andy.dwyer@pawnee.com', '404 Band St, AB', 'Shoeshiner', 4, '2019-10-25', 32000, 'CIBC', '4506-6789-0123-4556', 'TAX-120-8901'),
(2, 'Chris Traeger', '587-678-9012', 'chris.traeger@pawnee.com', '505 Wellness Way, AB', 'City Manager', 1, '2012-06-01', 95000, 'ATB Financial', '4716-7890-1234-5667', 'TAX-121-9012'),
(2, 'Ben Wyatt', '780-789-0123', 'ben.wyatt@pawnee.com', '606 Budget Blvd, AB', 'Accountant', 1, '2013-07-10', 93000, 'TD Bank', '4532-8901-2345-6778', 'TAX-122-0123'),
(2, 'Donna Meagle', '587-890-1234', 'donna.meagle@pawnee.com', '707 Mercedes Ln, AB', 'Office Manager', 2, '2011-09-30', 71000, 'RBC', '4539-9012-3456-7889', 'TAX-123-1234'),
(2, 'Jerry Gergich', '780-901-2345', 'jerry.gergich@pawnee.com', '808 Mistake St, AB', 'Public Servant', 3, '2008-02-20', 48000, 'Scotiabank', '4556-0123-4567-8990', 'TAX-124-2345'),
(2, 'Mona-Lisa Saperstein', '587-012-3456', 'mona-lisa.saperstein@pawnee.com', '909 Chaos Rd, AB', 'Sales Rep', 3, '2022-05-15', 41000, 'BMO', '4024-1234-5678-9101', 'TAX-125-3456'),
(2, 'Jean-Ralphio Saperstein', '780-345-6789', 'jean-ralphio.saperstein@pawnee.com', '1010 Party Ave, AB', 'Entrepreneur', 2, '2020-11-01', 67000, 'CIBC', '4506-2345-6789-0212', 'TAX-126-6789'),
(2, 'Craig Middlebrooks', '587-456-7890', 'craig.middlebrooks@pawnee.com', '1111 Passion St, AB', 'Office Supervisor', 2, '2017-08-10', 70000, 'ATB Financial', '4716-3456-7890-1323', 'TAX-127-7890'),
(2, 'Ethel Beavers', '780-678-9012', 'ethel.beavers@pawnee.com', '1212 Archives Ln, AB', 'Clerk', 4, '2010-01-01', 45000, 'TD Bank', '4532-4567-8901-2434', 'TAX-128-9012');

-- Extra Employees (Friends Cast & Duplicate Stanley)
INSERT INTO employees (branch_id, name, phone_number, email, address, position, department_id, hire_date, salary, bank_name, account_number, tax_id) VALUES
(1, 'Monica Geller', '416-345-6543', 'monica.geller@friends.com', '123 Central Perk, NY', 'Chef', 3, '2022-09-01', 60000, 'TD Bank', '4532-5678-9012-3545', 'TAX-215-6543'),
(1, 'Ross Geller', '647-234-8765', 'ross.geller@friends.com', '456 Dino Ave, NY', 'Paleontologist', 3, '2021-04-15', 85000, 'RBC', '4539-6789-0123-4656', 'TAX-216-8765'),
(2, 'Rachel Green', '587-987-4321', 'rachel.green@friends.com', '789 Fashion Blvd, NY', 'Fashion Executive', 2, '2020-12-05', 70000, 'Scotiabank', '4556-7890-1234-5767', 'TAX-217-4321'),
(2, 'Chandler Bing', '780-543-2109', 'chandler.bing@friends.com', '202 Sarcastic St, NY', 'IT Specialist', 2, '2021-07-07', 80000, 'BMO', '4024-8901-2345-6878', 'TAX-218-2109'),
(1, 'Phoebe Buffay', '905-678-3456', 'phoebe.buffay@friends.com', '101 Smelly Cat Ln, NY', 'Musician', 3, '2018-02-10', 45000, 'CIBC', '4506-9012-3456-7989', 'TAX-219-3456'),
(2, 'Joey Tribbiani', '780-678-1234', 'joey.tribbiani@friends.com', '404 Actor Blvd, NY', 'Actor', 3, '2019-05-20', 55000, 'ATB Financial', '4716-0123-4567-8090', 'TAX-220-1234'),
(1, 'Stanley Hudson', '647-543-0987', 'stanley.hudson@dundermifflin.com', '505 Crossword Lane, ON', 'Sales Associate', 4, '2017-01-15', 68000, 'TD Bank', '4532-1234-5678-9201', 'TAX-221-0987');


-- Insert sample payroll data with realistic breakdowns
-- Breakdown: Basic = hours × rate, HRA = 30%, DA = 20%, PF = 10%, Professional Tax = $200, Tax = 13%
-- Allowances = Transport + Meal allowances, Deductions = Loan/Insurance/Advance repayments
INSERT INTO payroll (emp_id, pay_period_start, pay_period_end, hours_worked, pay_rate, hra, da, pf, professional_tax, allowances, deductions, total_pay, tax_deduction, net_pay, pay_date)
VALUES
-- November 2024 Payroll (10 records)
(1, '2024-11-01', '2024-11-15', 160, 30.00, 1440.00, 960.00, 480.00, 200.00, 300.00, 150.00, 7500.00, 975.00, 5695.00, '2024-11-20'),
(2, '2024-11-01', '2024-11-15', 160, 28.12, 1349.76, 899.84, 449.92, 200.00, 250.00, 100.00, 6999.76, 909.97, 5339.87, '2024-11-20'),
(3, '2024-11-01', '2024-11-15', 160, 32.50, 1560.00, 1040.00, 520.00, 200.00, 400.00, 200.00, 8720.00, 1133.60, 6666.40, '2024-11-20'),
(4, '2024-11-01', '2024-11-15', 160, 35.00, 1680.00, 1120.00, 560.00, 200.00, 500.00, 300.00, 9460.00, 1229.80, 7170.20, '2024-11-20'),
(5, '2024-11-01', '2024-11-15', 160, 27.08, 1299.84, 866.56, 433.28, 200.00, 200.00, 50.00, 6699.20, 870.90, 4945.02, '2024-11-20'),
(6, '2024-11-01', '2024-11-15', 160, 31.25, 1500.00, 1000.00, 500.00, 200.00, 350.00, 175.00, 8350.00, 1085.50, 6389.50, '2024-11-20'),
(7, '2024-11-01', '2024-11-15', 160, 30.21, 1450.08, 966.72, 483.36, 200.00, 300.00, 120.00, 8033.76, 1044.39, 6185.99, '2024-11-20'),
(8, '2024-11-01', '2024-11-15', 120, 25.00, 900.00, 600.00, 300.00, 200.00, 150.00, 0.00, 4650.00, 604.50, 3545.50, '2024-11-20'),
(9, '2024-11-01', '2024-11-15', 160, 26.04, 1249.92, 833.28, 416.64, 200.00, 180.00, 80.00, 6429.60, 835.85, 4896.71, '2024-11-20'),
(10, '2024-11-01', '2024-11-15', 160, 28.13, 1350.24, 900.16, 450.08, 200.00, 220.00, 100.00, 6970.80, 906.20, 5314.52, '2024-11-20'),

-- October 2024 Payroll (10 records)
(1, '2024-10-01', '2024-10-15', 160, 30.00, 1440.00, 960.00, 480.00, 200.00, 300.00, 150.00, 7500.00, 975.00, 5695.00, '2024-10-20'),
(3, '2024-10-01', '2024-10-15', 160, 32.50, 1560.00, 1040.00, 520.00, 200.00, 400.00, 200.00, 8720.00, 1133.60, 6666.40, '2024-10-20'),
(11, '2024-10-01', '2024-10-15', 160, 29.17, 1400.16, 933.44, 466.72, 200.00, 280.00, 140.00, 7280.80, 946.50, 5527.58, '2024-10-20'),
(12, '2024-10-01', '2024-10-15', 160, 26.88, 1290.24, 860.16, 430.08, 200.00, 190.00, 90.00, 6641.20, 863.36, 5057.76, '2024-10-20'),
(13, '2024-10-01', '2024-10-15', 160, 27.71, 1330.08, 886.72, 443.36, 200.00, 210.00, 75.00, 6860.40, 891.85, 5249.99, '2024-10-20'),
(14, '2024-10-01', '2024-10-15', 160, 28.75, 1380.00, 920.00, 460.00, 200.00, 250.00, 125.00, 7150.00, 929.50, 5435.50, '2024-10-20'),
(15, '2024-10-01', '2024-10-15', 160, 31.77, 1524.96, 1016.64, 508.32, 200.00, 380.00, 190.00, 7903.84, 1027.50, 5977.82, '2024-10-20'),
(16, '2024-10-01', '2024-10-15', 160, 35.42, 1700.16, 1133.44, 566.72, 200.00, 450.00, 250.00, 8950.80, 1163.60, 6770.48, '2024-10-20'),
(17, '2024-10-01', '2024-10-15', 140, 22.50, 945.00, 630.00, 315.00, 200.00, 120.00, 0.00, 4845.00, 629.85, 3700.15, '2024-10-20'),
(18, '2024-10-01', '2024-10-15', 160, 33.33, 1599.84, 1066.56, 533.28, 200.00, 360.00, 180.00, 8359.20, 1086.70, 6359.22, '2024-10-20');

SELECT branch_id, emp_id, branch_emp_id, name 
FROM employees 
ORDER BY branch_id, branch_emp_id;

SELECT Branch_id, Branch_name, Branch_Password, role FROM users;