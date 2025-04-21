import type { Request, Response } from 'express';
import Budget from '../models/Bugdet';
import Expense from '../models/Expense';



export class BudgetController {

    static getAll = async (req: Request, res: Response) => {
        try {
            const budgets = await Budget.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
               
                where:{
                    userId:req.user.id
                }
            })
            res.json(budgets)
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Hubo un error" });
        }
    }
    static create = async (req: Request, res: Response) => {
     
        try {
            const budget = await  Budget.create(req.body);
            budget.userId=req.user!.id;

            await budget.save();
            res.status(201).json('Presupuesto Creado con Correctamente');

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error al crear el presupuesto" });
        }

    }
    //Trae todos los gastos de un presupuesto
    static getById = async (req: Request, res: Response) => {
            const budget= await Budget.findByPk(req.budget.id, {
                include:[Expense]
            })
           
            res.json(budget);
    }



    static updateById = async (req: Request, res: Response) => {  
         //Escribir los cambios del Body 
         await req.budget.update(req.body);
         //Guardar los cambios en la base de datos
         res.json('Presupuest Actualizado Correctamente')

    }
    static deleteById = async (req: Request, res: Response) => {
        //Eliminar el presupuesto
        await req.budget.destroy();
        res.json('Presupuesto Eliminado Correctamente');

    }
}