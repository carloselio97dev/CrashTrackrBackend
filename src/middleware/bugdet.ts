import { Request, Response, NextFunction } from "express";
import { param, validationResult, body } from "express-validator";
import Budget from "../models/Bugdet";

declare global {
    namespace Express {
        interface Request {
            budget?: Budget
        }
    }
}

export const validateBugdetId = async (req: Request, res: Response, next: NextFunction) => {
    // Validar que el ID del presupuesto sea un entero positivo  y que exista en la base de datos
    await param('budgetId')
        .isInt().withMessage('El ID del Presupuesto no es Valido')
        .custom((value) => value > 0).withMessage('Id no Valido')
        .run(req);
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return;
    }

    next();
}
export const validateBudgetExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId } = req.params
        const budget = await Budget.findByPk(budgetId);
        if (!budget) {
            const error = new Error('Presupuesto no encontrado');
            res.status(404).json({ error: error.message });
            return;
        }

        req.budget = budget;

        next();

    } catch (error) {
        //console.log(error);
        res.status(500).json({ error: "Hubo un error" });
    }
}

export const validateBudgetInput = async (req: Request, res: Response, next: NextFunction) => {
    await body('name')
        .notEmpty()
        .withMessage('El Nombre del Presupuesto es Obligatorio').run(req)
    await body('amount')
        .notEmpty()
        .withMessage('La Cantidad del Presupuesto no puede ir vacia')
        .isNumeric().withMessage('Cantidad No Valida')
        .custom((value) => value > 0).withMessage('El Presupuesto debe ser mayor a 0').run(req)
    next();
}

export const hasAccess = async (req: Request, res: Response, next: NextFunction) => {
    if(req.budget.userId!== req.user.id){
        const error = new Error('Accion no Valida');
        res.status(401).json({ error: error.message });
        return;
    }
    next();
}