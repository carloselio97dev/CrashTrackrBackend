import { Request, Response, NextFunction } from "express";
import { param, validationResult, body } from "express-validator";
import Expense from "../models/Expense";


declare global {
    namespace Express {
        interface Request {
            expense?: Expense
        }
    }
}


export const validateExpenseInput = async (req: Request, res: Response, next: NextFunction) => {
    await body('name')
        .notEmpty()
        .withMessage('El Nombre del Gasto no puede ir Vacia').run(req)
    await body('amount')
        .notEmpty()
        .withMessage('La Cantidad del Gasto no puede ir vacia')
        .isNumeric().withMessage('Cantidad No Valida')
        .custom((value) => value > 0).withMessage('El Presupuesto debe ser mayor a 0').run(req)
    next();
}

export const validateExpenseId = async (req: Request, res: Response, next: NextFunction) => {
    await param('expenseId').isInt().custom(value=>value>0)
    .withMessage('ID no Valido').run(req)
    let errors = validationResult(req)
    
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return;
    }
    next();
}

export const validateExpenseExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { expenseId } = req.params
        const expense = await Expense.findByPk(expenseId);
        if (!expense) {
            const error = new Error('Gasto no encontrado');
            res.status(404).json({ error: error.message });
            return;
        }

        req.expense = expense;

        next();

    } catch (error) {
        //console.log(error);
        res.status(500).json({ error: "Error al crear el presupuesto" });
    }
}