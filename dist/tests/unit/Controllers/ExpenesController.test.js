"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expenses_1 = require("./../../mocks/expenses");
const node_mocks_http_1 = require("node-mocks-http");
const Expense_1 = __importDefault(require("../../../models/Expense"));
const ExpensesController_1 = require("../../../controllers/ExpensesController");
jest.mock('../../../models/Expense', () => ({
    create: jest.fn()
}));
describe('ExpressController.create', () => {
    it('should create a new expense', async () => {
        const expensesMock = {
            save: jest.fn().mockResolvedValue(true)
        };
        Expense_1.default.create.mockResolvedValue(expensesMock);
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            body: {
                name: 'Test Expenses',
                amount: 500
            },
            budget: { id: 1 }
        });
        const res = (0, node_mocks_http_1.createResponse)();
        await ExpensesController_1.ExpensesController.create(req, res);
        const data = res._getJSONData();
        expect(res.statusCode).toBe(201);
        expect(data).toEqual("Gasto Agregado Correctamente");
        expect(expensesMock.save).toHaveBeenCalled();
        expect(expensesMock.save).toHaveBeenCalledTimes(1);
        expect(Expense_1.default.create).toHaveBeenCalledWith(req.body);
    });
    it('should handle expense create  error', async () => {
        const expensesMock = {
            save: jest.fn()
        };
        Expense_1.default.create.mockRejectedValue(new Error);
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            body: {
                name: 'Test Expenses',
                amount: 500
            },
            budget: { id: 1 }
        });
        const res = (0, node_mocks_http_1.createResponse)();
        await ExpensesController_1.ExpensesController.create(req, res);
        const data = res._getJSONData();
        expect(res.statusCode).toBe(500);
        expect(data).toEqual({ error: "Error al crear el gasto" });
    });
});
describe('ExpensesController.getById', () => {
    it('should return a expense with ID 1 ', async () => {
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'GET',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenses_1.expenses[0]
        });
        const res = (0, node_mocks_http_1.createResponse)();
        await ExpensesController_1.ExpensesController.getById(req, res);
        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data).toEqual(expenses_1.expenses[0]);
    });
});
describe('Expenses.updateById', () => {
    it("should update the expenses and returun a success message", async () => {
        const expenseMock = {
            ...expenses_1.expenses[0],
            update: jest.fn().mockResolvedValue(true)
        };
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'PUT',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenseMock,
            body: { name: "Updated Expenses", amount: 600 }
        });
        const res = (0, node_mocks_http_1.createResponse)();
        await ExpensesController_1.ExpensesController.updateById(req, res);
        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data).toBe("Se actualizo Correctamente el gasto");
        expect(expenseMock.update).toHaveBeenCalled();
        expect(expenseMock.update).toHaveBeenCalledTimes(1);
        expect(expenseMock.update).toHaveBeenCalledWith(req.body);
    });
});
//# sourceMappingURL=ExpenesController.test.js.map