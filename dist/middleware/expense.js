"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.belongtoBudget = exports.validateExpenseExist = exports.validateExpenseId = exports.validateExpenseInput = void 0;
const express_validator_1 = require("express-validator");
const Expense_1 = __importDefault(require("../models/Expense"));
const validateExpenseInput = async (req, res, next) => {
    await (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('El Nombre del Gasto no puede ir Vacia').run(req);
    await (0, express_validator_1.body)('amount')
        .notEmpty()
        .withMessage('La Cantidad del Gasto no puede ir vacia')
        .isNumeric().withMessage('Cantidad No Valida')
        .custom((value) => value > 0).withMessage('El Presupuesto debe ser mayor a 0').run(req);
    next();
};
exports.validateExpenseInput = validateExpenseInput;
const validateExpenseId = async (req, res, next) => {
    await (0, express_validator_1.param)('expenseId').isInt().custom(value => value > 0)
        .withMessage('ID no Valido').run(req);
    let errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.validateExpenseId = validateExpenseId;
const validateExpenseExist = async (req, res, next) => {
    try {
        const { expenseId } = req.params;
        const expense = await Expense_1.default.findByPk(expenseId);
        if (!expense) {
            const error = new Error('Gasto no encontrado');
            res.status(404).json({ error: error.message });
            return;
        }
        req.expense = expense;
        next();
    }
    catch (error) {
        //console.log(error);
        res.status(500).json({ error: "Hubo un error" });
    }
};
exports.validateExpenseExist = validateExpenseExist;
const belongtoBudget = async (req, res, next) => {
    if (req.budget.id !== req.expense.budgetId) {
        const error = new Error("Accion no Validad");
        return res.status(403).json({ error: error.message });
    }
    next();
};
exports.belongtoBudget = belongtoBudget;
//# sourceMappingURL=expense.js.map