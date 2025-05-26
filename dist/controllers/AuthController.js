"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../utils/auth");
const token_1 = require("../utils/token");
const Authemail_1 = require("../emails/Authemail");
const jwt_1 = require("../utils/jwt");
class AuthController {
    static createAccount = async (req, res) => {
        const { email, password, token } = req.body;
        //Prevent duplicate email
        const userExist = await User_1.default.findOne({ where: { email } });
        if (userExist) {
            const error = new Error('El usuario cono ese email ya esta registrado');
            res.status(409).json({ error: error.message });
            return;
        }
        try {
            const user = await User_1.default.create(req.body);
            user.password = await (0, auth_1.hashPassword)(password);
            const token = (0, token_1.generateToken)();
            user.token = token;
            //Variables Globlales en NODE
            if (process.env.NODE_ENV !== 'production') {
                globalThis.cashTrackrConfirmationToken = token;
            }
            await user.save();
            await Authemail_1.AuthEmail.sendConfirmationEmail({
                name: user.name,
                email: user.email,
                token: user.token
            });
            res.status(201).json({ msg: 'Cuenta Creada Correctamente' });
            return;
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Hubo un Error' });
            return;
        }
    };
    static confirmAccount = async (req, res) => {
        const { token } = req.body;
        const user = await User_1.default.findOne({ where: { token } });
        if (!user) {
            const error = new Error('Token no valido');
            res.status(401).json({ error: error.message });
            return;
        }
        user.confirm = true;
        user.token = null;
        await user.save();
        res.json("Cuenta Confirmada Correctamente");
        return;
    };
    static login = async (req, res) => {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ where: { email } });
        if (!user) {
            const error = new Error('El usuario no encontrado');
            res.status(404).json({ error: error.message });
            return;
        }
        if (!user.confirm) {
            const error = new Error('La cuenta no ha sido confirmado');
            res.status(403).json({ error: error.message });
            return;
        }
        const isPasswordCorrect = await (0, auth_1.checkPassword)(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('Password Incorrecto');
            res.status(401).json({ error: error.message });
            return;
        }
        const token = (0, jwt_1.generateJWT)(user.id);
        res.json(token);
    };
    static forgotPassword = async (req, res) => {
        const { email } = req.body;
        //Revisa si el usuario existe
        const user = await User_1.default.findOne({ where: { email } });
        if (!user) {
            const error = new Error('El usuario no encontrado');
            res.status(404).json({ error: error.message });
            return;
        }
        //Generar token y enviar email
        user.token = (0, token_1.generateToken)();
        await user.save();
        await Authemail_1.AuthEmail.sendPasswordResetToken({
            name: user.name,
            email: user.email,
            token: user.token
        });
        res.json({ msg: 'Revisa tu email para reestablecer tu password' });
        return;
    };
    static validateToken = async (req, res) => {
        const { token } = req.body;
        const tokenExists = await User_1.default.findOne({ where: { token } });
        if (!tokenExists) {
            const error = new Error('Token no valido');
            res.status(401).json({ error: error.message });
            return;
        }
        res.json({ msg: "Token Valido, asgina un nuevo password" });
    };
    static resetPasswordWithToken = async (req, res) => {
        const { token } = req.params;
        const { password } = req.body;
        const user = await User_1.default.findOne({ where: { token } });
        if (!user) {
            const error = new Error('Token no valido');
            res.status(401).json({ error: error.message });
            return;
        }
        //Asignar el nuevo password
        user.password = await (0, auth_1.hashPassword)(password);
        user.token = null;
        await user.save();
        res.json({ msg: 'El password se ha reestablecido correctamente' });
        return;
    };
    static user = async (req, res) => {
        //Autenticacion de usuario
        res.json(req.user);
    };
    static updateCurrentUserPassword = async (req, res) => {
        const { current_password, password } = req.body;
        const { id } = req.user;
        const user = await User_1.default.findByPk(id);
        const isPasswordCorrect = await (0, auth_1.checkPassword)(current_password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('Password Incorrecto');
            res.status(401).json({ error: error.message });
            return;
        }
        user.password = await (0, auth_1.hashPassword)(password);
        await user.save();
        res.json({ msg: "Password Modifico correctamente" });
        return;
    };
    static checkPassword = async (req, res) => {
        const { password } = req.body;
        const { id } = req.user;
        const user = await User_1.default.findByPk(id);
        const isPasswordCorrect = await (0, auth_1.checkPassword)(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('Password Incorrecto');
            res.status(401).json({ error: error.message });
            return;
        }
        res.json("Password Correcto");
        return;
    };
    static updateUserInfo = async (req, res) => {
        const { name, email } = req.body;
        const user = await User_1.default.findOne({ where: { email } });
        if (user && user.id !== req.user.id) {
            const error = new Error('Este correo ya está registrado por otro usuario.');
            res.status(409).json({ error: error.message });
            return;
        }
        req.user.name = name;
        req.user.email = email;
        await req.user.save();
        res.status(200).json({ msg: "Usuario actualizado correctamente" });
    };
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map