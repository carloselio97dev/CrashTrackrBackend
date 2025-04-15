import type { Request, Response } from 'express';
import Budget from '../models/Bugdet';



export class BudgetController {

    static getAll = async (req: Request, res: Response) => {
        try {
            const budgets = await Budget.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                //TODO: FILTRAR POR EL USUARIO AUTENTICADO

            })
            res.json(budgets)
        } catch (error) {
            //console.log(error);
            res.status(500).json({ error: "Hubo un error" });
        }
    }
    static create = async (req: Request, res: Response) => {
        try {
            const budget = new Budget(req.body);
            await budget.save();
            res.status(201).json('Presupeusto Creado con Exito');

        } catch (error) {
            //console.log(error);
            res.status(500).json({ error: "Error al crear el presupuesto" });
        }

    }
    static getById = async (req: Request, res: Response) => {
            res.json(req.budget);
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