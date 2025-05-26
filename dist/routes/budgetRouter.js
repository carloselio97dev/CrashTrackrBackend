"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BudgetController_1 = require("../controllers/BudgetController");
const validations_1 = require("../middleware/validations");
const bugdet_1 = require("../middleware/bugdet");
const ExpensesController_1 = require("../controllers/ExpensesController");
const expense_1 = require("../middleware/expense");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.autenticate); //Genera el req.user 
//Validar que el ID del presupuesto sea un entero positivo  y que exista en la base de datos
router.param('budgetId', bugdet_1.validateBugdetId);
router.param('budgetId', bugdet_1.validateBudgetExist); //Genera req.budget
router.param('budgetId', bugdet_1.hasAccess);
router.param('expenseId', expense_1.validateExpenseId);
router.param('expenseId', expense_1.validateExpenseExist);
router.param('expenseId', expense_1.belongtoBudget);
router.get('/', BudgetController_1.BudgetController.getAll);
router.post('/', bugdet_1.validateBudgetInput, validations_1.handleInputsErrors, BudgetController_1.BudgetController.create);
router.get('/:budgetId', BudgetController_1.BudgetController.getById);
router.put('/:budgetId', bugdet_1.validateBudgetInput, validations_1.handleInputsErrors, BudgetController_1.BudgetController.updateById);
router.delete('/:budgetId', BudgetController_1.BudgetController.deleteById);
/** Router for expenses */ //Patron de Arquitectura ROA URL FUNICONA COMO IDENTIFICADOR DE LOS RECURSOS EN LA BASE DE DATOS
router.post('/:budgetId/expenses', expense_1.validateExpenseInput, validations_1.handleInputsErrors, ExpensesController_1.ExpensesController.create);
router.get('/:budgetId/expenses/:expenseId', ExpensesController_1.ExpensesController.getById);
router.put('/:budgetId/expenses/:expenseId', expense_1.validateExpenseInput, validations_1.handleInputsErrors, ExpensesController_1.ExpensesController.updateById);
router.delete('/:budgetId/expenses/:expenseId', ExpensesController_1.ExpensesController.deleteById);
exports.default = router;
//# sourceMappingURL=budgetRouter.js.map