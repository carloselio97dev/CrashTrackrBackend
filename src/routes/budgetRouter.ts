import { Router } from 'express';
import { body, param } from 'express-validator';
import { BudgetController } from '../controllers/BudgetController';
import { handleInputsErrors } from '../middleware/validations';
import { hasAccess, validateBudgetExist, validateBudgetInput, validateBugdetId } from '../middleware/bugdet';
import { ExpensesController } from '../controllers/ExpensesController';
import { validateExpenseExist, validateExpenseId, validateExpenseInput } from '../middleware/expense';
import { autenticate } from '../middleware/auth';

const router= Router();

router.use(autenticate); //Genera el req.user 
//Validar que el ID del presupuesto sea un entero positivo  y que exista en la base de datos
router.param('budgetId', validateBugdetId)
router.param('budgetId', validateBudgetExist) //Genera req.budget
router.param('budgetId', hasAccess);

router.param('expenseId', validateExpenseId);
router.param('expenseId', validateExpenseExist);

router.get('/', BudgetController.getAll)

router.post('/',
    validateBudgetInput,
    handleInputsErrors,
    BudgetController.create);

router.get('/:budgetId',BudgetController.getById);

router.put('/:budgetId',
    validateBudgetInput,
    handleInputsErrors,
    BudgetController.updateById);

router.delete('/:budgetId',BudgetController.deleteById)

/** Router for expenses */ //Patron de Arquitectura ROA URL FUNICONA COMO IDENTIFICADOR DE LOS RECURSOS EN LA BASE DE DATOS
router.post('/:budgetId/expenses',
    validateExpenseInput,
    handleInputsErrors,
    ExpensesController.create)

router.get('/:budgetId/expenses/:expenseId', ExpensesController.getById)
router.put('/:budgetId/expenses/:expenseId',
    validateExpenseInput,
    handleInputsErrors,
    ExpensesController.updateById)
router.delete('/:budgetId/expenses/:expenseId', ExpensesController.deleteById)


export default router;