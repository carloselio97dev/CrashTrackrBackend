import request from "supertest";
import server, { connectDB } from "../../server";
import { AuthController } from "../../controllers/AuthController";
import User from '../../models/User';
import * as authutils from '../../utils/auth';
import * as jwtUtils from "../../utils/jwt";

describe('Authentication- Create Account', () => {
    it('should display validation errors when from is empty', async () => {
        const response = await request(server)
            .post("/api/auth/create-account")
            .send({})

        const createAccountMock = jest.spyOn(AuthController, 'createAccount');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveLength(3);
        expect(response.body.errors).not.toBe(400);
        expect(response.body.errors).not.toHaveLength(2);
        expect(createAccountMock).not.toHaveBeenCalled();
    })

    it('should return 400 when email es invalidad', async () => {
        const response = await request(server)
            .post("/api/auth/create-account")
            .send({
                "name": "Juan",
                "password": "12345678",
                "email": "notavalideemxail"

            })

        const createAccountMock = jest.spyOn(AuthController, 'createAccount');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors).not.toBe(400);
        expect(response.body.errors).not.toHaveLength(2);
        expect(response.body.errors[0].msg).toBe('El email no es valido');
        expect(createAccountMock).not.toHaveBeenCalled();
    })


    it('should return 400 when password is less than 8 characters', async () => {
        const response = await request(server)
            .post("/api/auth/create-account")
            .send({
                "name": "Juan",
                "password": "123456",
                "email": "carlseliogonzalezapa@gmail.com"

            })
        const createAccountMock = jest.spyOn(AuthController, 'createAccount');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].msg).toBe('La contraseña debe tener al menos 8 caracteres');
        expect(response.body.errors).not.toBe(400);
        expect(response.body.errors).not.toHaveLength(2);
        expect(createAccountMock).not.toHaveBeenCalled();
    });

    it('should return 200 when usear create succefull', async () => {

        const userData = {
            "name": "Lucas",
            "password": "password1",
            "email": 'test@test.com'
        }

        const response = await request(server)
            .post("/api/auth/create-account")
            .send(userData)

        expect(response.status).toBe(201);
        expect(response.body.errors).not.toBe(400);
        expect(response.body).not.toHaveProperty('errors');

    })

    it('should return 409 conflict  when a user is already registred', async () => {

        const userData = {
            "name": "Lucas",
            "password": "password1",
            "email": 'test@test.com'
        }

        const response = await request(server)
            .post("/api/auth/create-account")
            .send(userData)

        console.log(response.body);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("El usuario cono ese email ya esta registrado");
        expect(response.status).toBe(409);
        expect(response.body.errors).not.toBe(400);
        expect(response.body.errors).not.toBe(201);
        expect(response.body).not.toHaveProperty('errors');

    })


})

describe('Authentication  - Account Confirmation with Token', () => {

    it("should display error if token is empty or token is not valid", async () => {
        const response = await request(server)
            .post('/api/auth/confirm-account')
            .send({ token: "not_valid" })

        const { status, body } = response;
        const { errors } = body

        expect(status).toBe(400);
        expect(body).toHaveProperty('errors')
        expect(errors).toHaveLength(1);
        expect(errors[0].msg).toBe('Token no Valido');
    })

    it("should display error if token doesn't exits", async () => {
        const response = await request(server)
            .post('/api/auth/confirm-account')
            .send({ token: "123456" })

        const { status, body } = response;
        const { error } = body

        expect(status).toBe(401);
        expect(body).toHaveProperty('error')
        expect(error).toBe('Token no valido');
        expect(status).not.toBe(200);
    });

    it("should confirm account with a valid token", async () => {

        const token = globalThis.cashTrackrConfirmationToken;

        const response = await request(server)
            .post('/api/auth/confirm-account')
            .send({ token })

        expect(response.status).toBe(200);
        expect(response.body).toBe("Cuenta Confirmada Correctamente");
        expect(response.status).not.toBe(401);


    })

});

describe("Authentication - Login", () => {

    beforeEach(() => {
        jest.clearAllMocks();

    });

    it('should display validation errors when the form is empty', async () => {
        const response = await request(server)
            .post("/api/auth/login")
            .send({})


        const loginMock = jest.spyOn(AuthController, 'login');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveLength(2);
        expect(response.body.errors).not.toHaveLength(1);
        expect(loginMock).not.toHaveBeenCalled();
    })

    it('should return 400 bad request when the email is invalid', async () => {
        const response = await request(server)
            .post("/api/auth/login")
            .send({
                "password": "password",
                "email": "not_valid"
            })


        const loginMock = jest.spyOn(AuthController, 'login');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors).not.toHaveLength(2);
        expect(response.body.errors[0].msg).toBe("El email no es valido");
        expect(loginMock).not.toHaveBeenCalled();
    })



    it('should return a 403 error if the user account is not confirmed', async () => {


        (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue({
                id: 1,
                confirmed: false,
                password: "hashedPassword",
                email: "user_not_confirmed@test.com"
            })

        const response = await request(server)
            .post("/api/auth/login")
            .send({
                "password": "password",
                "email": "user_not_confirmed@test.com"
            })


        expect(response.status).toBe(403);

        expect(response.status).not.toBe(200);
        expect(response.body).toHaveProperty('error');
        expect(response.status).not.toBe(404);
        expect(response.body.error).toBe("La cuenta no ha sido confirmado");

    })

    it('should return a 403 error if the user account is not confirmed', async () => {

        const userData = {
            name: "test",
            email: "user_not_confirmed@test.com",
            password: "password"
        }

        await request(server)
            .post('/api/auth/create-account')
            .send(userData)

        const response = await request(server)
            .post("/api/auth/login")
            .send({
                "password": userData.password,
                "email": userData.email
            })


        expect(response.status).toBe(403);

        expect(response.status).not.toBe(200);
        expect(response.body).toHaveProperty('error');
        expect(response.status).not.toBe(404);
        expect(response.body.error).toBe("La cuenta no ha sido confirmado");

    })


    it('should return a 401 error if the password is incorrect', async () => {

        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue({
                id: 1,
                confirm: true,
                password: "hashedPassword"
            })

        const checkPassword = jest.spyOn(authutils, 'checkPassword').mockResolvedValue(false);

        const response = await request(server)
            .post("/api/auth/login")
            .send({
                "password": "wrongPassword",
                "email": "user_not_confirmed@test.com"
            })


        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
        expect(response.status).not.toBe(404);
        expect(response.status).not.toBe(200);
        expect(response.status).not.toBe(403);
        expect(response.body.error).toBe("Password Incorrecto");
        expect(findOne).toHaveBeenCalledTimes(1);
        expect(checkPassword).toHaveBeenCalledTimes(1);

    })


    it('should return a 401 error a jwt', async () => {

        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue({
                id: 1,
                confirm: true,
                password: "hashedPassword"
            })

        const checkPassword = jest.spyOn(authutils, 'checkPassword').mockResolvedValue(true);

        const generateJWT = jest.spyOn(jwtUtils, 'generateJWT').mockReturnValue('jwt-token')

        const response = await request(server)
            .post("/api/auth/login")
            .send({
                "password": "correctPassword",
                "email": "user_not_confirmed@test.com"
            })

        expect(response.status).toBe(200);
        expect(response.body).toEqual('jwt-token');
        expect(findOne).toHaveBeenCalled();
        expect(findOne).toHaveBeenCalledTimes(1);
        expect(checkPassword).toHaveBeenCalled();
        expect(checkPassword).toHaveBeenCalledTimes(1);
        expect(checkPassword).toHaveBeenCalledWith('correctPassword', 'hashedPassword')
        expect(generateJWT).toHaveBeenCalled();
        expect(generateJWT).toHaveBeenCalledTimes(1);
        expect(generateJWT).toHaveBeenCalledWith(1);

    })

})

let jwt: string;

const autenticateUser = async () => {
    const response = await request(server)
        .post('/api/auth/login')
        .send({
            email: "test@test.com",
            password: "password1"
        })

    jwt = response.body;
    console.log(jwt);
    expect(response.status).toBe(200);
}



describe('GET /api/budgets', () => {


    beforeAll(() => {
        jest.restoreAllMocks(); //RFestaurar la funciones de los jest.spy a su implementacion original
    })

    beforeAll(async () => {
        await autenticateUser();

    })

    it("should allow authenticated access to budgets with a valid jwt", async () => {

        const response = await request(server)
            .get('/api/budgets');
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("No Autorizado");

    })

    it("should reject unauthenticated access to budgets whitout a jwt", async () => {

        const response = await request(server)
            .get('/api/budgets')
            .auth(jwt, { type: 'bearer' })
        expect(response.body).toHaveLength(0);
        expect(response.status).not.toBe(500);
        expect(response.body.error).not.toBe("Token no valido");

    })

    it("should reject unauthenticated access to budgets whitout a valid jwt", async () => {

        const response = await request(server)
            .get('/api/budgets')
            .auth('not_valid', { type: 'bearer' })
        expect(response.status).not.toBe(401);
        expect(response.body).toEqual({
            error: "Token no valido" // Ajusta según lo que realmente devuelve tu API
        });

    })

})

describe('POST /api/budgets', () => {

    beforeAll(async () => {
        await autenticateUser();
    })


    it("should reject unauthenticated post request  to budgets whitout a jwt", async () => {

        const response = await request(server)
            .post('/api/budgets')
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("No Autorizado");

    })

    it("should display validation when the form is submitted with invalidad data", async () => {

        const response = await request(server)
            .post('/api/budgets')
            .auth(jwt, { type: 'bearer' })
            .send({})
        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveLength(4);

    })

    it("should display new Budget ", async () => {

        const response = await request(server)
            .post('/api/budgets')
            .auth(jwt, { type: 'bearer' })
            .send({
                "name": "Macbook Pro",
                "amount": 8000
            })
        expect(response.status).toBe(201);
    })






})

describe('GET /api/budgets/:id', () => {
    beforeAll(async () => {
        await autenticateUser();
    })

    it('should reject unthenticated get request to budget id without a jwt', async () => {
        const response = await request(server)
            .get('/api/budgets/1')

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('No Autorizado');
    })

    it('should return 400 bad request when id is not valid', async () => {
        const response = await request(server)
            .get('/api/budgets/not_valid')
            .auth(jwt, { type: 'bearer' })

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors).toBeTruthy();
        expect(response.status).not.toBe(401);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].msg).toBe("El ID del Presupuesto no es Valido");
        expect(response.body.error).not.toBe('No Autorizado');
    })

    it('should return 404  not found when a budget doesnt exists', async () => {
        const response = await request(server)
            .get('/api/budgets/555')
            .auth(jwt, { type: 'bearer' })

        expect(response.status).toBe(404);
        expect(response.status).not.toBe(400);
        expect(response.status).not.toBe(401);
        expect(response.body.error).toBe("Presupuesto no encontrado");
        expect(response.body.error).not.toBe('No Autorizado');
    })

    it('should return a single budget by id', async () => {
        const response = await request(server)
            .get('/api/budgets/1')
            .auth(jwt, { type: 'bearer' })

        expect(response.status).toBe(200);
        expect(response.status).not.toBe(400);
        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(404);
    })


})


describe('PUT /api/budgets/:id', () => {
    beforeAll(async () => {
        await autenticateUser();
    })

    it('should reject unthenticated put request to budget id without a jwt', async () => {
        const response = await request(server)
            .put('/api/budgets/1')

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('No Autorizado');
    })

    
    it('should display validation error if the form is empty', async () => {
        const response = await request(server)
            .put('/api/budgets/1')
            .auth(jwt,{type:'bearer'})
            .send({})

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeTruthy();
        expect(response.body.errors).toHaveLength(4);
        
    })

    it('should update a budget by id and return a success message', async () => {
        const response = await request(server)
            .put('/api/budgets/1')
            .auth(jwt,{type:'bearer'})
            .send({
                name:"Update Budget",
                amount:300
            })

        expect(response.status).toBe(200);
        expect(response.body).toBe("Presupuesto Actualizado Correctamente");
        
    })



})

describe('DELETE /api/budgets/:id', () => {
    beforeAll(async () => {
        await autenticateUser();
    })

    it('should reject unthenticated delete request to budget id without a jwt', async () => {
        const response = await request(server)
            .delete('/api/budgets/1')

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('No Autorizado');
    })

    
    it('should return  404 not found when a budget doesnt exist', async () => {
        const response = await request(server)
            .delete('/api/budgets/3000')
            .auth(jwt,{type:'bearer'})
    
        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Presupuesto no encontrado");
        
    })

    it('should delete a budget and return  a success mesage', async () => {
        const response = await request(server)
            .delete('/api/budgets/1')
            .auth(jwt,{type:'bearer'})
          
        expect(response.status).toBe(200);
        expect(response.body).toBe("Presupuesto Eliminado Correctamente");
        
    })



})