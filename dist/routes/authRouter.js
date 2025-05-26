"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const AuthController_1 = require("../controllers/AuthController");
const validations_1 = require("../middleware/validations");
const limiter_1 = require("../config/limiter");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.default)();
router.use(limiter_1.limiter);
router.post('/create-account', (0, express_validator_1.body)('name').notEmpty().withMessage('El nombre es obligatorio'), (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'), (0, express_validator_1.body)('email').isEmail().withMessage('El email no es valido'), validations_1.handleInputsErrors, AuthController_1.AuthController.createAccount);
router.post('/confirm-account', (0, express_validator_1.body)('token')
    .isLength({ min: 6, max: 6 })
    .withMessage('Token no Valido'), validations_1.handleInputsErrors, AuthController_1.AuthController.confirmAccount);
router.post('/login', (0, express_validator_1.body)('email').isEmail().withMessage('El email no es valido'), (0, express_validator_1.body)('password').notEmpty().withMessage('La contraseña es obligatoria'), validations_1.handleInputsErrors, AuthController_1.AuthController.login);
router.post('/forgot-password', (0, express_validator_1.body)('email').isEmail().withMessage('El email no es valido'), validations_1.handleInputsErrors, AuthController_1.AuthController.forgotPassword);
router.post('/validate-token', (0, express_validator_1.body)('token').notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage('Toke no Valido'), validations_1.handleInputsErrors, AuthController_1.AuthController.validateToken);
router.post('/reset-password/:token', (0, express_validator_1.param)('token').notEmpty(), (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'), validations_1.handleInputsErrors, AuthController_1.AuthController.resetPasswordWithToken);
router.get('/user', auth_1.autenticate, AuthController_1.AuthController.user);
router.post('/update-password', auth_1.autenticate, (0, express_validator_1.body)('current_password').notEmpty().withMessage('El password actual no puede estar vacio'), (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('El nuevo Password es muy corto'), validations_1.handleInputsErrors, AuthController_1.AuthController.updateCurrentUserPassword);
router.post('/check-password', auth_1.autenticate, (0, express_validator_1.body)('password').notEmpty().withMessage('El password actual no puede estar vacio'), validations_1.handleInputsErrors, AuthController_1.AuthController.checkPassword);
router.put('/user', (0, express_validator_1.body)('name').notEmpty().withMessage('El Nombre no  puede estar vacio'), (0, express_validator_1.body)('email').notEmpty().withMessage('El Email no  puede estar vacio'), validations_1.handleInputsErrors, auth_1.autenticate, AuthController_1.AuthController.updateUserInfo);
exports.default = router;
//# sourceMappingURL=authRouter.js.map