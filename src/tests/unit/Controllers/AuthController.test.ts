import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/AuthController";
import User from "../../../models/User";

jest.mock("../../../models/User")

describe('AuthController.createAccount',()=>{

    it('Should Return a 409 and  error message if  the email is already registed', async ()=>{

        (User.findOne as jest.Mock).mockResolvedValue(true);

        const req=createRequest({
            method:'POST',
            url:'/api/auth/create-account',
            body:{
                email:"test@test.com",
                password:"testpassword"
            }

        });

        const res=createResponse();

        await AuthController.createAccount(req,res)
        expect(res.statusCode).toBe(409);
        
    })
})