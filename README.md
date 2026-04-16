<div align="center">
  <img src="./public/Images/logo.png" alt="Payroll Management System Logo" width="120" />
  <h1>Payroll Management System</h1>
  <p><i>A modern, robust, and secure full-stack web application designed for multi-branch organizations to handle employee records, deductions, and payroll efficiently.</i></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-v16+-success.svg?logo=nodedotjs)](https://nodejs.org) 
  [![Express.js](https://img.shields.io/badge/Express-v4.17-lightgrey.svg?logo=express)](https://expressjs.com) 
  [![MySQL](https://img.shields.io/badge/MySQL-v5.7+-blue.svg?logo=mysql)](https://www.mysql.com) 
</div>

---

## 🌟 Key Features

- **🔐 Secure Authentication:** Enterprise-grade security featuring encrypted login with `bcrypt` password hashing and robust Express session management.
- **👥 Employee Management:** End-to-end CRUD for managing employees featuring automatic, isolated badge ID assignments (e.g., `B1-019`).
- **💰 One-Click Payroll Generation:** Automatically calculate basic pay with customizable dynamic tax deductions, including HRA, DA, PF, Professional Tax, and Income Tax.
- **📊 Traceable Payroll History:** View, filter, and export detailed past payroll records to PDF.
- **🏢 Branch Isolation:** Strict data partitioning ensuring branch managers can only access data belonging to their respective branch.
- **✨ Modern Glassmorphism UI:** Stunning, responsive interface built to operate smoothly across all standard desktop web browsers.

---

## 🏗️ Architecture & Stack

### System Layout
The system follows a typical Model-View-Controller (MVC) architecture separating concerns effectively between the database layer, API endpoints, and the client UI.

*Refer to the [Class Diagram](./docs/diagrams/payroll_class_diagram.png) and [Activity Diagram](./docs/diagrams/payroll_activity_diagram.png) to explore the system's underlying structure.*

### Tech Stack
| Tier | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Glassmorphism), Vanilla ES6 JavaScript, FontAwesome |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (with automatic triggers and relational schema) |
| **Security/Auth** | `bcryptjs`, `express-session`, `cors` |
| **Testing** | Jest, Supertest |

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js:** `v16.14.0` or higher
- **MySQL:** `v5.7` or higher

### 1. Database Setup
1. Launch your MySQL server and connect via your preferred SQL client or terminal:
   ```bash
   mysql -u root -p
   ```
2. Import the provided schema + sample data:
   ```sql
   SOURCE ./database/P.sql;
   ```
3. *(Optional)* Update the database credentials in `src/db.js` if you use a password other than the placeholder `Priyansh@0612` for your `root` MySQL user.

### 2. Install & Run
Run the following commands in your terminal from the project's root directory:
```bash
# Install NPM dependencies
npm install

# Start the application
npm start
```
You should see:
```text
STARTING APP.JS WITH DEBUGGING - VERSION 2
Connected to the database.
```

### 3. Access the Application
Open your web browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

To login, you can use the default administrator credentials:
> **Branch 1 Admin** -> Username: `Hydro_One_1` | Password: `HO@123`
>  
> **Branch 2 Admin** -> Username: `Hydro_One_2` | Password: `HO@456`

---

## 📂 Project Structure

```text
├── database/                   # Contains raw SQL schemas & migrations
│   └── P.sql                   
├── docs/                       # Architectural diagrams and blueprints
│   └── diagrams/               
├── public/                     # Frontend client views, styles, and js logic
│   ├── P.HTML                  
│   ├── Manage.html             
│   ├── GeneratePayroll.html    
│   ├── Images/                 
│   └── js/                     
├── src/                        # Primary backend source code
│   ├── app.js                  # Express Entry Router
│   └── db.js                   # Node-MySQL connection singleton
├── tests/                      # Jest API & Auth test suites
│   └── auth.test.js            
├── package.json                # Project manifest and core scripts
└── .gitignore                  # Git exclusions tracking rules
```

---

## 💡 Usage Highlights

1. **Dashboard Overview:** Displays high-level access routes to Add, Remove, and View employees alongside generating customized payroll statements.
2. **Badge IDs:** Each employee receives a badge ID tied to their hiring branch (`B<branch_id>-<assigned_id>`). All search lookups require strict use of this Badge ID format for security. 
3. **Pay Periods:** When generating payroll, select hours worked and define both the start and end of the pay period. The net pay alongside itemized breakdown of withholdings will calculate instantly.

---

## 🔮 Roadmap

- **Two-Factor Authentication (2FA):** Enhanced login security via SMS or authenticator apps.
- **Advanced Export Utilities:** Capability to securely download exhaustive payroll reports mapping as `.xlsx` alongside PDF files.
- **Audit Logs:** Implemented ledger to track all administrative activity (employee additions, removals, access timestamps).
- **TypeScript Migration:** Refactoring core models manually to TS to ensure maximal runtime safety parameters.

---

## 👨‍💻 Support & Contact

Designed and engineered by Priyansh Patel.

For questions, troubleshooting, or support:
- ✉️ **Email:** priyanshp0612@gmail.com


*All rights reserved.*
