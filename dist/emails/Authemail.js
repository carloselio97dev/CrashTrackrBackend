"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthEmail = void 0;
const nodemailer_1 = require("../config/nodemailer");
class AuthEmail {
    static sendConfirmationEmail = async (user) => {
        const email = await nodemailer_1.transport.sendMail({
            from: 'CrashTrackr <admin@cashtracker.com',
            to: user.email,
            subject: 'CashTracker - Confirma tu cuenta',
            html: `<p>Hola ${user.name}, has creado tu cuenta en CrashTrackr ya esta casi lista</p>
                    <p>Visita el siguiente enlace </p>
                    <a href=${process.env.FRONTED_URL}/auth/confirm-account>Confirmar cuenta</a>
                    <p>Ingresa el código <b>${user.token}</b></p>
                    `
        });
        console.log('Mensaje Enviado', email.messageId);
    };
    static sendPasswordResetToken = async (user) => {
        const email = await nodemailer_1.transport.sendMail({
            from: 'CrashTrackr <admin@cashtracker.com',
            to: user.email,
            subject: 'CashTracker - Reestablece tu contraseña',
            html: `<p>Hola ${user.name}, haz solicitado reestrablecer tu password</p>
                    <p>Visita el siguiente enlace </p>
                    <a href=${process.env.FRONTED_URL}/auth/new-password>Reestablecer Password</a>
                    <p>Ingresa el código <b>${user.token}</b></p>
                    `
        });
        console.log('Mensaje Enviado', email.messageId);
    };
}
exports.AuthEmail = AuthEmail;
//# sourceMappingURL=Authemail.js.map