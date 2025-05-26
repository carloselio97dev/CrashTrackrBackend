import type { Request, Response } from 'express';
export declare class ExpensesController {
    static create: (req: Request, res: Response) => Promise<void>;
    static getById: (req: Request, res: Response) => Promise<void>;
    static updateById: (req: Request, res: Response) => Promise<void>;
    static deleteById: (req: Request, res: Response) => Promise<void>;
}
