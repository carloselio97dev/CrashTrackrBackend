import Router from 'express'
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { handleInputsErrors } from '../middleware/validations';
import { limiter } from '../config/limiter';

const router = Router()


router.post('/create-account', 
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('password').isLength({min:8}).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('email').isEmail().withMessage('El email no es valido'),
    handleInputsErrors,
    AuthController.createAccount);


router.post('/confirm-account',
    limiter, // Limitar el numero de peticiones a 5 por minuto 
    body('token').notEmpty()
    .isLength({min:6,max:6})
    .withMessage('Toke no Valido'),
    handleInputsErrors,
    AuthController.confirmAccount)

export default router;