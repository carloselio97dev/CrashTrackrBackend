"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_mocks_http_1 = require("node-mocks-http");
const expense_1 = require("../../../middleware/expense");
const Expense_1 = __importDefault(require("../../../models/Expense"));
const expenses_1 = require("../../mocks/expenses");
const bugdet_1 = require("../../../middleware/bugdet");
const budgets_1 = require("../../mocks/budgets");
jest.mock('../../../models/Expense', () => ({
    findByPk: jest.fn()
}));
describe('Expenses Middleware - validateExists', () => {
    beforeEach(() => {
        Expense_1.default.findByPk.mockImplementation((id) => {
            const expense = expenses_1.expenses.filter(e => e.id === id)[0] ?? null;
            return Promise.resolve(expense);
        });
    });
    it('should handle a non-existent-budget', async () => {
        const req = (0, node_mocks_http_1.createRequest)({
            params: { expenseId: 120 }
        });
        const res = (0, node_mocks_http_1.createResponse)();
        const next = jest.fn();
        await (0, expense_1.validateExpenseExist)(req, res, next);
        const data = res._getJSONData();
        expect(res.statusCode).toBe(404);
        expect(data).toEqual({ error: "Gasto no encontrado" });
        expect(next).not.toHaveBeenCalled();
    });
    it('should call next middleware if existent-budget', async () => {
        const req = (0, node_mocks_http_1.createRequest)({
            params: { expenseId: 1 }
        });
        const res = (0, node_mocks_http_1.createResponse)();
        const next = jest.fn();
        await (0, expense_1.validateExpenseExist)(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(req.expense).toEqual(expenses_1.expenses[0]);
    });
    it('should handle internal server error', async () => {
        Expense_1.default.findByPk.mockRejectedValue(new Error);
        const req = (0, node_mocks_http_1.createRequest)({
            params: { expenseId: 1 }
        });
        const res = (0, node_mocks_http_1.createResponse)();
        const next = jest.fn();
        await (0, expense_1.validateExpenseExist)(req, res, next);
        const data = res._getJSONData();
        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(500);
        expect(data).toEqual({ error: "Hubo un error" });
    });
    it("should prevent unauthorized users from adding expenses", async () => {
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            budget: budgets_1.budgets[0],
            user: { id: 20 },
            body: { name: 'Expenses Text', amount: 3000 }
        });
        const res = (0, node_mocks_http_1.createResponse)();
        const next = jest.fn();
        (0, bugdet_1.hasAccess)(req, res, next);
        const data = res._getJSONData();
        expect(res.statusCode).toBe(401);
        expect(data).toEqual({ error: "Accion no Valida" });
        expect(next).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=expenses.test.js.map