"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const autenticate = async (req, res, next) => {
    const bearer = req.headers.authorization;
    if (!bearer) {
        const error = new Error('No Autorizado');
        res.status(401).json({ error: error.message });
        return;
    }
    const [, token] = bearer.split(' ');
    if (!token) {
        const error = new Error('Token no valido');
        res.status(401).json({ error: error.message });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (typeof decoded === 'object' && decoded.id) {
            req.user = await User_1.default.findByPk(decoded.id, {
                attributes: ['id', 'name', 'email']
            });
            next();
            return;
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Token no valido' });
        return;
    }
};
exports.autenticate = autenticate;
//# sourceMappingURL=auth.js.map