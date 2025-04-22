import { expenses } from './../../mocks/expenses';
import { createRequest, createResponse } from "node-mocks-http";
import Expense from "../../../models/Expense";
import { ExpensesController } from "../../../controllers/ExpensesController";


jest.mock('../../../models/Expense',  () => ({
    create: jest.fn()
}))

describe('ExpressController.create', () => {
    it('should create a new expense',async () => {
        const expensesMock = {
            save: jest.fn().mockResolvedValue(true)
        };
        (Expense.create as jest.Mock).mockResolvedValue(expensesMock)

        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            body: {
                name: 'Test Expenses',
                amount: 500
            },
            budget: { id: 1 }
        })

        const res = createResponse();
        await ExpensesController.create(req, res);
        const data=res._getJSONData();
        expect(res.statusCode).toBe(201);
        expect(data).toEqual("Gasto Agregado Correctamente");
        expect(expensesMock.save).toHaveBeenCalled();
        expect(expensesMock.save).toHaveBeenCalledTimes(1);
        expect(Expense.create).toHaveBeenCalledWith(req.body);
    })

    it('should handle expense create  error', async () => {
        const expensesMock = {
            save: jest.fn()
        };

        (Expense.create as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            body: {
                name: 'Test Expenses',
                amount: 500
            },
            budget: { id: 1 }
        })

        const res = createResponse();
        await ExpensesController.create(req, res);
        const data=res._getJSONData();
        expect(res.statusCode).toBe(500);
        expect(data).toEqual({ error: "Error al crear el gasto" });
    });
});

describe('Expensess.getById',()=>{

    it('should return a expense with ID 1 ', async ()=>{

        const req=createRequest({
            method:'GET',
            url:'/api/budgets/:budgetId/expenses/:expenseId',
            expenses:expenses[0]
        })
        
        const res=createResponse();
        await ExpensesController.getById(req,res);
        const data=res._getJSONData();
        expect(res.status).toBe(200);
        expect(data.expenses).toHaveLength(1);
        expect(data.expenses).toHaveBeenCalled();
    })
})

describe('Expenses.updateById', () => { 

    it("should update the expenses and returun a success message", async()=>{

        const expensesMock={
            update:jest.fn().mockResolvedValue(true)
        }

        const req=createRequest({
            method:'PUT',
            url:'/api/budgets/:budgetId/expenses/:expenseId',
            expenses:expensesMock,
            body: { name:"Pollo",amount:600}
        })

        const res=createResponse();
        await ExpensesController.updateById(req,res);
        const data=res._getJSONData();

        expect(res.statusCode).toBe(200);
        expect(data).toBe("Se actualizo Correctamente el gasto");
        expect(expensesMock.update).toHaveBeenCalled();
        expect(expensesMock.update).toHaveBeenCalledTimes(1);
        expect(expensesMock.update).toHaveBeenCalledWith(req.body);
        
    })


 })