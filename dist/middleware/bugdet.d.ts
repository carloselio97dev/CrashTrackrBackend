import { Request, Response, NextFunction } from "express";
import Budget from "../models/Bugdet";
declare global {
    namespace Express {
        interface Request {
            budget?: Budget;
        }
    }
}
export declare const validateBugdetId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const validateBudgetExist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const validateBudgetInput: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const hasAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
