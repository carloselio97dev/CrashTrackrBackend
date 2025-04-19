import Router from 'express'
import { body, param } from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { handleInputsErrors } from '../middleware/validations';
import { limiter } from '../config/limiter';
import { autenticate } from '../middleware/auth';

const router = Router()

router.use(limiter)
router.post('/create-account',
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('email').isEmail().withMessage('El email no es valido'),
    handleInputsErrors,
    AuthController.createAccount);


router.post('/confirm-account',
    body('token').notEmpty()
        .isLength({ min: 6, max: 6 })
        .withMessage('Toke no Valido'),
    handleInputsErrors,
    AuthController.confirmAccount)

router.post('/login',
    body('email').isEmail().withMessage('El email no es valido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    handleInputsErrors,
    AuthController.login);

router.post('/forgot-password',
    body('email').isEmail().withMessage('El email no es valido'),
    handleInputsErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token').notEmpty()
        .isLength({ min: 6, max: 6 })
        .withMessage('Toke no Valido'),
    handleInputsErrors,
    AuthController.validateToken
)

router.post('/reset-password/:token',
    param('token').notEmpty(),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    handleInputsErrors,
    AuthController.resetPasswordWithToken
)

router.get('/user',
    autenticate,
    AuthController.user);

router.post('/update-password',
    autenticate,
    body('current_password').notEmpty().withMessage('El password actual no puede estar vacio'),
    body('password').isLength({ min: 8 }).withMessage('El nuevo Password es muy corto'),
    handleInputsErrors,
    AuthController.updateCurrentUserPassword)

router.post('/check-password',
    autenticate,
    body('password').notEmpty().withMessage('El password actual no puede estar vacio'),
    handleInputsErrors,
    AuthController.checkPassword)

export default router;