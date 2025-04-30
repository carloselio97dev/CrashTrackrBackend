import  { Request, RequestHandler, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/Authemail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
    static createAccount = async (req: Request, res: Response)=> {

            const {email, password,token}= req.body;
            //Prevent duplicate email
            const userExist= await User.findOne({where:{email}});
            if(userExist){
                const error=new Error('El usuario cono ese email ya esta registrado')
                 res.status(409).json({error: error.message})
                 return;

            }
            try {
                const user =await  User.create(req.body);
                user.password= await hashPassword(password)
                const token= generateToken();
                user.token=token;

                //Variables Globlales en NODE
                if(process.env.NODE_ENV !=='production'){
                    globalThis.cashTrackrConfirmationToken=token;
                }


                await user.save()

                await AuthEmail.sendConfirmationEmail({
                        name:user.name,
                        email:user.email,
                        token:user.token
                })

                res.status(201).json({ msg: 'Cuenta Creada Correctamente' });
                return;

               
            } catch (error) {
                console.log(error);
                res.status(500).json({ error: 'Hubo un Error' });
                return;
            }
    }

    static confirmAccount:RequestHandler = async (req: Request, res: Response)=> {
           const {token}=req.body; 
           const user= await User.findOne({where:{token}});
           if(!user){
                const error=new Error('Token no valido')
                res.status(401).json({error: error.message})
                return;
           }
           user.confirm=true;
           user.token=null;
           await user.save()

            res.json("Cuenta Confirmada Correctamente");
            return;
    }
    static login = async (req: Request, res: Response)=> {
          const {email, password}=req.body;
          const user= await User.findOne({where:{email}});
            if(!user){
                const error=new Error('El usuario no encontrado')
                res.status(404).json({error: error.message})
                return;
            }
            if(!user.confirm){
                const error=new Error('La cuenta no ha sido confirmado')
                res.status(403).json({error: error.message})
                return;
            }
           const isPasswordCorrect =await  checkPassword(password, user.password);
           if(!isPasswordCorrect){
                const error=new Error('Password Incorrecto')
                res.status(401).json({error: error.message})
                return;
           }
           const token =generateJWT(user.id);
           res.json(token);
           
    }

    static forgotPassword:RequestHandler = async (req: Request, res: Response)=> {
           const {email}= req.body;
            //Revisa si el usuario existe
              const user= await User.findOne({where:{email}});
              if(!user){
                const error=new Error('El usuario no encontrado')
                res.status(404).json({error: error.message})
                return;
              }
                //Generar token y enviar email
                user.token=generateToken();
                await user.save(); 
                await AuthEmail.sendPasswordResetToken({
                    name:user.name,
                    email:user.email,
                    token:user.token
                })

                
              res.json('Revisa tu email para reestablecer tu password');
              return;

    }
    static validateToken:RequestHandler = async (req: Request, res: Response)=> {
            const {token}= req.body;
            const tokenExists= await User.findOne({where:{token}});
            if(!tokenExists){
                const error=new Error('Token no valido')
                res.status(401).json({error: error.message})
                return;
            }
            res.json("Token Valido");
            
    }
    static resetPasswordWithToken:RequestHandler = async (req: Request, res: Response)=> {
            const {token}=req.params;
            const {password}=req.body;

            const user= await User.findOne({where:{token}});
            if(!user){
                const error=new Error('Token no valido')
                res.status(401).json({error: error.message})
                return;
            }
            //Asignar el nuevo password
            user.password= await hashPassword(password);
            user.token=null;
            await user.save();

            res.json('El password se ha reestablecido correctamente')
            return; 
    }

    static user:RequestHandler = async (req: Request, res: Response)=> {
        //Autenticacion de usuario
        res.json(req.user);
    }
    static updateCurrentUserPassword:RequestHandler = async (req: Request, res: Response)=> {
            
        const {current_password, password}=req.body;
        const {id}=req.user;

        const user= await User.findByPk(id);

        const isPasswordCorrect =await  checkPassword(current_password, user.password);
        if(!isPasswordCorrect){
            const error=new Error('Password Incorrecto')
            res.status(401).json({error: error.message})
            return;
        }
        
        user.password= await hashPassword(password);
        await user.save();
        res.json("Password Modifico correctamente")
        return;

    }
    static checkPassword:RequestHandler = async (req: Request, res: Response)=> {
        const { password}=req.body;
        const {id}=req.user;

        const user= await User.findByPk(id);

        const isPasswordCorrect =await  checkPassword(password, user.password);
        if(!isPasswordCorrect){
            const error=new Error('Password Incorrecto')
            res.status(401).json({error: error.message})
            return;
        }
        res.json("Password Correcto");
        return;
    }
}