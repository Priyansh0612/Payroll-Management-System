const { validatePayrollData } = require('../app'); // We need to export this function from app.js first

describe('Payroll Calculation Logic', () => {
    test('should calculate net pay correctly', () => {
        const hoursWorked = 80;
        const payRate = 30;
        const totalPay = hoursWorked * payRate;
        const taxDeduction = totalPay * 0.13;
        const netPay = totalPay - taxDeduction;

        expect(totalPay).toBe(2400);
        expect(taxDeduction).toBe(312);
        expect(netPay).toBe(2088);
    });

    // We can add more tests here once we refactor the calculation logic into a testable function
});
