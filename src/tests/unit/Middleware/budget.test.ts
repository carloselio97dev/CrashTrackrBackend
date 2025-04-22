import { createRequest, createResponse } from 'node-mocks-http';
import { hasAccess, validateBudgetExist } from '../../../middleware/bugdet';
import Budget from '../../../models/Bugdet';
import { budgets } from '../../mocks/budgets';

// Mockear el modelo Budget para simular sus métodos en las pruebas
// En este caso solo mockea findByPk que es el método utilizado en los middlewares
jest.mock('../../../models/Bugdet', () => ({
    findByPk: jest.fn()
}))

/**
 * Pruebas para el middleware validateBudgetExist
 * Este middleware verifica si un presupuesto existe antes de continuar con la petición
 */
describe('budget Middleware - validateBudgetExists', () => {
    // Prueba para cuando el presupuesto no existe en la base de datos
    it('should handle non-existent budget', async () => {
        // Configurar mock para simular que no se encontró el presupuesto (retorna null)
        (Budget.findByPk as jest.Mock).mockResolvedValue(null);
        
        // Crear objetos simulados de request, response y next
        const req = createRequest({
            params: {
                budgetId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn();

        // Ejecutar el middleware
        await validateBudgetExist(req, res, next)
        
        // Verificar respuesta esperada: status 404 y mensaje de error
        const data = res._getJSONData();
        expect(res.statusCode).toBe(404);
        expect(data).toEqual({ error: "Presupuesto no encontrado" });
        expect(next).not.toHaveBeenCalled(); // No debe llamar a next() en caso de error
    })

    // NOTA: El nombre de esta prueba debería cambiarse ya que prueba un error de servidor
    // no un presupuesto no encontrado como indica actualmente
    it('should handle server error when finding budget', async () => {
        // Configurar mock para simular un error en la búsqueda
        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error);
        
        const req = createRequest({
            params: {
                budgetId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn();

        // Ejecutar el middleware
        await validateBudgetExist(req, res, next)
        
        // Verificar respuesta esperada: status 500 y mensaje de error
        const data = res._getJSONData();
        expect(res.statusCode).toBe(500);
        expect(data).toEqual({ error: "Hubo un error" });
        expect(next).not.toHaveBeenCalled();
    })

    // Prueba para cuando el presupuesto sí existe
    it('should proceed to next middleware if budget exists', async () => {
        // Configurar mock para simular que se encontró el presupuesto
        (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0]);

        const req = createRequest({
            params: {
                budgetId: 1
            }
        })
        const res = createResponse();
        const next = jest.fn();

        // Ejecutar el middleware
        await validateBudgetExist(req, res, next);
        
        // Verificar que se llamó a next() y que el presupuesto se adjuntó al request
        expect(next).toHaveBeenCalled();
        expect(req.budget).toEqual(budgets[0])
    })
})

/**
 * Pruebas para el middleware hasAccess
 * Este middleware verifica si el usuario tiene acceso al presupuesto
 */
describe('budget Middleware - hasAccess', () => {
    // Prueba para cuando el usuario tiene acceso al presupuesto
    it('should call next() if user has access to budget', async () => {
        // Crear request con usuario id 1 que coincide con el creador del presupuesto
        const req = createRequest({
            budget: budgets[0],
            user: { id: 1 }
        })
        const res = createResponse();
        const next = jest.fn();
        
        // Ejecutar el middleware
        await hasAccess(req, res, next);
        
        // Verificar que se llamó a next()
        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
    })

    // Prueba para cuando el usuario NO tiene acceso al presupuesto
    it('should return 401 error if userId does not have access to budget', async () => {
        // Crear request con usuario id 2 que NO coincide con el creador del presupuesto
        const req = createRequest({
            budget: budgets[0],
            user: { id: 2 }
        })
        const res = createResponse();
        const next = jest.fn();
        
        // Ejecutar el middleware
        await hasAccess(req, res, next);
        
        // Verificar respuesta esperada: status 401 y mensaje de error
        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(401);
        expect(res._getJSONData()).toEqual({error:"Accion no Valida"});
    })
});