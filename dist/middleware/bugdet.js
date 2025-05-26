"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAccess = exports.validateBudgetInput = exports.validateBudgetExist = exports.validateBugdetId = void 0;
const express_validator_1 = require("express-validator");
const Bugdet_1 = __importDefault(require("../models/Bugdet"));
const validateBugdetId = async (req, res, next) => {
    // Validar que el ID del presupuesto sea un entero positivo  y que exista en la base de datos
    await (0, express_validator_1.param)('budgetId')
        .isInt().withMessage('El ID del Presupuesto no es Valido').bail()
        .custom((value) => value > 0).withMessage('Id no Valido').bail()
        .run(req);
    let errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.validateBugdetId = validateBugdetId;
const validateBudgetExist = async (req, res, next) => {
    try {
        const { budgetId } = req.params;
        const budget = await Bugdet_1.default.findByPk(budgetId);
        if (!budget) {
            const error = new Error('Presupuesto no encontrado');
            res.status(404).json({ error: error.message });
            return;
        }
        req.budget = budget;
        next();
    }
    catch (error) {
        //console.log(error);
        res.status(500).json({ error: "Hubo un error" });
    }
};
exports.validateBudgetExist = validateBudgetExist;
const validateBudgetInput = async (req, res, next) => {
    await (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('El Nombre del Presupuesto es Obligatorio').run(req);
    await (0, express_validator_1.body)('amount')
        .notEmpty()
        .withMessage('La Cantidad del Presupuesto no puede ir vacia')
        .isNumeric().withMessage('Cantidad No Valida')
        .custom((value) => value > 0).withMessage('El Presupuesto debe ser mayor a 0').run(req);
    next();
};
exports.validateBudgetInput = validateBudgetInput;
const hasAccess = async (req, res, next) => {
    if (req.budget.userId !== req.user.id) {
        const error = new Error('Accion no Valida');
        res.status(401).json({ error: error.message });
        return;
    }
    next();
};
exports.hasAccess = hasAccess;
//# sourceMappingURL=bugdet.js.map