import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/AuthController";
import User from "../../../models/User";
import { checkPassword, hashPassword } from "../../../utils/auth";
import { generateToken } from "../../../utils/token";
import { AuthEmail } from "../../../emails/Authemail";
import { generateJWT } from "../../../utils/jwt";


jest.mock('../../../models/User', () => ({
    findOne: jest.fn(),
    create: jest.fn()
}));
jest.mock('../../../utils/auth', () => ({
    hashPassword: jest.fn(),
    checkPassword: jest.fn()
}));

jest.mock('../../../utils/token', () => ({
    generateToken: jest.fn(),
}));
jest.mock('../../../utils/jwt',()=>({
    generateJWT:jest.fn()
}))

describe('AuthController.createAccount', () => {

    beforeEach(() => {
        jest.resetAllMocks();
    })

    it('Should Return a 409 and  error message if  the email is already registed', async () => {

        (User.findOne as jest.Mock).mockResolvedValue(true);

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: {
                email: "test@test.com",
                password: "testpassword"
            }

        });

        const res = createResponse();

        await AuthController.createAccount(req, res)
        expect(res.statusCode).toBe(409);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(409);
        expect(data).toHaveProperty('error', 'El usuario cono ese email ya esta registrado');
        expect(User.findOne).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalledTimes(1)
    })

    it('Should register a new user and return a success message', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: {
                email: "test@test.com",
                password: "testpassword",
                name: "TestName"
            }
        });

        const res = createResponse();

        const mockUser = { ...req.body, save: jest.fn() };
        (User.create as jest.Mock).mockResolvedValue(mockUser);
        (hashPassword as jest.Mock).mockResolvedValue('hashedpassword');
        (generateToken as jest.Mock).mockReturnValue('123456');
        jest.spyOn(AuthEmail, "sendConfirmationEmail").mockImplementation(() => Promise.resolve());

        await AuthController.createAccount(req, res)
        expect(User.create).toHaveBeenCalledWith(req.body);
        expect(User.create).toHaveBeenCalledTimes(1);
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.statusCode).toBe(201);
        expect(mockUser.password).toBe('hashedpassword');
        expect(mockUser.token).toBe('123456');
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
            name: req.body.name,
            email: req.body.email,
            token: '123456'
        })
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1);
    });
});

describe('AuthController.login', () => {
    it('Should Return a 404 if user is not found', async () => {

        (User.findOne as jest.Mock).mockResolvedValue(null);

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: "test@test.com",
                password: "testpassword"
            }

        });

        const res = createResponse();

        await AuthController.login(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(404);
        expect(data).toEqual({ error: "El usuario no encontrado" });
    })

    it('Should Return a 403  if the account  has not been confirmed', async () => {

        (User.findOne as jest.Mock).mockResolvedValue({
                id:1,
                email:"test@test.com",
                password:"password",
                confirm:false
        });

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: "test@test.com",
                password: "testpassword"
            }

        });

        const res = createResponse();

        await AuthController.login(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(403);
        expect(data).toEqual({ error: "La cuenta no ha sido confirmado" });
    })

    it('Should Return a 401 if the password is incorrect', async () => {

        const userMock= {
            id:1,
            email:"test@test.com",
            password:"password",
            confirm:true
        };

        (User.findOne as jest.Mock).mockResolvedValue(userMock);

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: "test@test.com",
                password: "testpassword"
            }

        });

        const res = createResponse();
        (checkPassword as jest.Mock).mockResolvedValue(false);

        await AuthController.login(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(401);
        expect(data).toEqual({ error: "Password Incorrecto" });
        expect(checkPassword).toHaveBeenCalledWith(req.body.password, userMock.password);
        expect(checkPassword).toHaveBeenCalledTimes(1);
    });

    it('Should Return a JWT if athentication is succefull', async () => {

        const userMock= {
            id:1,
            email:"test@test.com",
            password:"hashed_password",
            confirm:true
        };

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: "test@test.com",
                password: "password"
            }

        });

        const res = createResponse();
        
       const fakejwt='fake_jwt'; (User.findOne as jest.Mock).mockResolvedValue(userMock);
        (checkPassword as jest.Mock).mockResolvedValue(true);
         (generateJWT as jest.Mock).mockReturnValue(fakejwt);

        await AuthController.login(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data).toEqual(fakejwt);
        expect(generateJWT).toHaveBeenCalledWith(userMock.id);
    })

});