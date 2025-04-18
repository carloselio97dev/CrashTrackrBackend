import { transport } from "../config/nodemailer"

type EmailType = {
    name:string,
    email:string,
    token:string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user:EmailType) =>{
        const email = await  transport.sendMail({
                from:'CrashTrackr <admin@cashtracker.com',
                to:user.email,
                subject:'CashTracker - Confirma tu cuenta',
                html:`<p>Hola ${user.name}, has creado tu cuenta en CrashTrackr ya esta casi lista</p>
                    <p>Visita el siguiente enlace </p>
                    <a href="#">Confirmar cuenta</a>
                    <p>Ingresa el código <b>${user.token}</b></p>
                    `
        })
        console.log('Mensaje Enviado', email.messageId);
    }

    static sendPasswordResetToken = async (user:EmailType) =>{
        const email = await  transport.sendMail({
                from:'CrashTrackr <admin@cashtracker.com',
                to:user.email,
                subject:'CashTracker - Reestablece tu contraseña',
                html:`<p>Hola ${user.name}, haz solicitado reestrablecer tu password</p>
                    <p>Visita el siguiente enlace </p>
                    <a href="#">Reestablecer Password</a>
                    <p>Ingresa el código <b>${user.token}</b></p>
                    `
        })
        console.log('Mensaje Enviado', email.messageId);
    }
}