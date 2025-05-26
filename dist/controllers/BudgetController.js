"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetController = void 0;
const Bugdet_1 = __importDefault(require("../models/Bugdet"));
const Expense_1 = __importDefault(require("../models/Expense"));
class BudgetController {
    static getAll = async (req, res) => {
        try {
            const budgets = await Bugdet_1.default.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                where: {
                    userId: req.user.id
                }
            });
            res.json(budgets);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Hubo un error" });
        }
    };
    static create = async (req, res) => {
        try {
            const budget = await Bugdet_1.default.create(req.body);
            budget.userId = req.user.id;
            await budget.save();
            res.status(201).json({ msg: 'Presupuesto Creado con Correctamente' });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error al crear el presupuesto" });
        }
    };
    //Trae todos los gastos de un presupuesto
    static getById = async (req, res) => {
        const budget = await Bugdet_1.default.findByPk(req.budget.id, {
            include: [Expense_1.default]
        });
        res.json(budget);
    };
    static updateById = async (req, res) => {
        //Escribir los cambios del Body 
        await req.budget.update(req.body);
        //Guardar los cambios en la base de datos
        res.json({ msg: 'Presupuesto Actualizado Correctamente' });
    };
    static deleteById = async (req, res) => {
        //Eliminar el presupuesto
        await req.budget.destroy();
        res.json({ msg: 'Presupuesto Eliminado Correctamente' });
    };
}
exports.BudgetController = BudgetController;
//# sourceMappingURL=BudgetController.js.map