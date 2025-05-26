"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesController = void 0;
const Expense_1 = __importDefault(require("../models/Expense"));
class ExpensesController {
    static create = async (req, res) => {
        try {
            const expense = await Expense_1.default.create(req.body);
            expense.budgetId = req.budget.id;
            await expense.save();
            res.status(201).json({
                msg: 'Gasto Agregado Correctamente'
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error al crear el gasto" });
        }
    };
    static getById = async (req, res) => {
        res.json(req.expense);
    };
    static updateById = async (req, res) => {
        await req.expense.update(req.body);
        res.json({ msg: "Se actualizo Correctamente el gasto" });
    };
    static deleteById = async (req, res) => {
        await req.expense.destroy();
        res.json({ msg: "Gasto eliminado" });
    };
}
exports.ExpensesController = ExpensesController;
//# sourceMappingURL=ExpensesController.js.map