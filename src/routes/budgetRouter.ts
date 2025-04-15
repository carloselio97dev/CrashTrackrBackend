import { Router } from 'express';
import { body, param } from 'express-validator';
import { BudgetController } from '../controllers/BudgetController';
import { handleInputsErrors } from '../middleware/validations';
import { validateBudgetExist, validateBudgetInput, validateBugdetId } from '../middleware/bugdet';

const router= Router();

//Validar que el ID del presupuesto sea un entero positivo  y que exista en la base de datos
router.param('budgetId', validateBugdetId)
router.param('budgetId', validateBudgetExist)

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


export default router;