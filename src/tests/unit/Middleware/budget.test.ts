/**
 * Import necessary testing utilities and components to test
 */
import { createRequest, createResponse } from 'node-mocks-http';
import { hasAccess, validateBudgetExist } from '../../../middleware/bugdet';
import Budget from '../../../models/Bugdet';
import { budgets } from '../../mocks/budgets';

/**
 * Mock the Budget model to control its behavior during tests
 * This replaces the actual database interaction with controlled test responses
 */
jest.mock('../../../models/Bugdet', () => ({
    findByPk: jest.fn()
}))

/**
 * Tests for the validateBudgetExist middleware
 * This middleware verifies if a budget with the given ID exists before proceeding
 */
describe('budget Middleware - validateBudgetExists', () => {
    /**
     * Test case: Budget doesn't exist in database
     * Should return 404 error and not proceed to next middleware
     */
    it('should handle non-existent budget', async () => {
        // Setup mock to return null (budget not found)
        (Budget.findByPk as jest.Mock).mockResolvedValue(null);
        
        // Create mock request with budgetId in params
        const req = createRequest({
            params: {
                budgetId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn(); // Mock the next middleware function

        // Call the middleware
        await validateBudgetExist(req, res, next)
        
        // Assertions
        const data = res._getJSONData();
        expect(res.statusCode).toBe(404); // Should return 404 Not Found
        expect(data).toEqual({ error: "Presupuesto no encontrado" }); // Should include error message
        expect(next).not.toHaveBeenCalled(); // Should not call next middleware
    })

    /**
     * Test case: Database error occurs when looking up budget
     * Should return 500 error and not proceed to next middleware
     */
    it('should handle non-existent budget', async () => {
        // Setup mock to throw an error (database error)
        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error);
        
        // Create mock request with budgetId in params
        const req = createRequest({
            params: {
                budgetId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn();

        // Call the middleware
        await validateBudgetExist(req, res, next)
        
        // Assertions
        const data = res._getJSONData();
        expect(res.statusCode).toBe(500); // Should return 500 Server Error
        expect(data).toEqual({ error: "Hubo un error" }); // Should include error message
        expect(next).not.toHaveBeenCalled(); // Should not call next middleware
    })

    /**
     * Test case: Budget exists
     * Should add budget to request object and proceed to next middleware
     */
    it('should procced to next middleware if budget exits ', async () => {
        // Setup mock to return a budget from our test data
        (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0]);

        // Create mock request with budgetId in params
        const req = createRequest({
            params: {
                budgetId: 1
            }
        })
        const res = createResponse();
        const next = jest.fn();

        // Call the middleware
        await validateBudgetExist(req, res, next);
        
        // Assertions
        expect(next).toHaveBeenCalled(); // Should call next middleware
        expect(req.budget).toEqual(budgets[0]) // Should attach budget to request
    })
})

/**
 * Tests for the hasAccess middleware
 * This middleware checks if the logged-in user has access to the requested budget
 */
describe('budget Middleware - hasAccess', async() => {
    /**
     * Test case: User has access to budget
     * Should proceed to next middleware
     */
    it('should call next() if user has access to budget', async () => {
        // Create mock request with budget and user objects
        const req = createRequest({
            budget: budgets[0],  // Budget created by user with id 1
            user: { id: 1 }      // This user is authorized
        })
        const res = createResponse();
        const next = jest.fn();
        
        // Call the middleware
        await hasAccess(req, res, next);
        
        // Assertions
        expect(next).toHaveBeenCalled(); // Should call next middleware
        expect(next).toHaveBeenCalledTimes(1); // Should be called exactly once
    })

    /**
     * Test case: User does not have access to budget
     * Should return 401 unauthorized error
     */
    it('should return 401 error if userId does not have access to budget', async () => {
        // Create mock request with budget and user objects
        const req = createRequest({
            budget: budgets[0],  // Budget created by user with id 1
            user: { id: 2 }      // Different user who should not have access
        })
        const res = createResponse();
        const next = jest.fn();
        
        // Call the middleware
        await hasAccess(req, res, next);
        
        // Assertions
        expect(next).not.toHaveBeenCalled(); // Should not call next middleware
        expect(res.statusCode).toBe(401); // Should return 401 Unauthorized
        expect(res._getJSONData()).toEqual({error:"Accion no Valida"}); // Should include error message
    })
});