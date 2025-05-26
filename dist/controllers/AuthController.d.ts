import { Request, RequestHandler, Response } from "express";
export declare class AuthController {
    static createAccount: (req: Request, res: Response) => Promise<void>;
    static confirmAccount: RequestHandler;
    static login: (req: Request, res: Response) => Promise<void>;
    static forgotPassword: RequestHandler;
    static validateToken: RequestHandler;
    static resetPasswordWithToken: RequestHandler;
    static user: RequestHandler;
    static updateCurrentUserPassword: RequestHandler;
    static checkPassword: RequestHandler;
    static updateUserInfo: RequestHandler;
}
