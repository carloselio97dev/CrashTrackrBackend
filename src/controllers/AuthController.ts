import  { Request, RequestHandler, Response } from "express";
import User from "../models/User";
import { hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/Authemail";

export class AuthController {
    static createAccount:RequestHandler = async (req: Request, res: Response)=> {

            const {email, password,token}= req.body;
            //Prevent duplicate email
            const userExist= await User.findOne({where:{email}});
            if(userExist){
                const error=new Error('El usuario cono ese email ya esta registrado')
                 res.status(409).json({error: error.message})
                 return;

            }
            try {
                const user = new User(req.body);
                user.password= await hashPassword(password)
                user.token= generateToken();
                await user.save()

                await AuthEmail.sendConfirmationEmail({
                        name:user.name,
                        email:user.email,
                        token:user.token
                })

                res.json({ msg: 'Cuenta Creada Correctamente' });
                return;

               
            } catch (error) {
                //console.log(error);
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
 }
