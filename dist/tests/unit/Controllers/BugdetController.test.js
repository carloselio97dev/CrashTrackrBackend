"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importar utilidades para simular peticiones HTTP y respuestas para pruebas
const node_mocks_http_1 = require("node-mocks-http");
// Importar datos simulados para las pruebas
const budgets_1 = require("../../mocks/budgets");
// Importar el modelo Budget que será mockeado
const Bugdet_1 = __importDefault(require("../../../models/Bugdet")); // NOTA: Hay un error de escritura aquí, debería ser "Budget"
// Importar el controlador que vamos a probar
const BudgetController_1 = require("../../../controllers/BudgetController");
const Expense_1 = __importDefault(require("../../../models/Expense"));
/**
 * CONFIGURACIÓN INICIAL DE PRUEBAS
 * Reemplazamos completamente el modelo Budget con un mock
 * Esto nos permite controlar su comportamiento sin usar una base de datos real
 */
jest.mock('../../../models/Bugdet', () => ({
    // Mockeamos los métodos que necesitamos para las pruebas
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn()
}));
/**
 * SUITE DE PRUEBAS para el método getAll del BudgetController
 * Prueba que el controlador filtre correctamente presupuestos por userId
 */
describe('BudgetController.getAll', () => {
    /**
     * Antes de cada prueba, configuramos el comportamiento simulado del método findAll
     * Esta función se ejecutará antes de cada prueba individual
     */
    beforeEach(() => {
        // Reiniciar el mock antes de configurarlo
        // Esto elimina cualquier configuración previa entre pruebas
        Bugdet_1.default.findAll.mockReset();
        // Implementamos una versión simulada de findAll que usa filtrado de arrays
        Bugdet_1.default.findAll.mockImplementation((options) => {
            // Filtramos el array de presupuestos usando el userId proporcionado en la consulta
            // Esto simula lo que haría una base de datos real con una consulta WHERE
            const updateBudget = budgets_1.budgets.filter(budgets => budgets.userId === options.where.userId);
            // Devolvemos los resultados envueltos en una promesa para simular operación asíncrona DB
            return Promise.resolve(updateBudget);
        });
    });
    /**
     * PRUEBA 1: Usuario con ID 1 debería recibir exactamente 2 presupuestos
     * Verifica que el filtrado por ID funcione correctamente
     */
    it('should retrieve 2 budgets for user with ID 1', async () => {
        // Crear una petición HTTP simulada con ID de usuario 1
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'GET',
            url: 'api/budgets',
            user: { id: 1 } // El usuario autenticado tiene ID 1
        });
        // Crear objeto de respuesta simulado para capturar resultados
        const res = (0, node_mocks_http_1.createResponse)();
        // Ejecutar el método del controlador que queremos probar
        await BudgetController_1.BudgetController.getAll(req, res);
        // Obtener los datos JSON que el controlador envió como respuesta
        const data = res._getJSONData();
        // Verificaciones (assertions) de los resultados esperados
        expect(data).toHaveLength(2); // Debe tener exactamente 2 presupuestos
        expect(res.statusCode).toBe(200); // Código de estado debe ser 200 (OK)
        expect(res.status).not.toBe(404); // No debe ser código 404 (Not Found)
    });
    /**
     * PRUEBA 2: Usuario con ID 2 debería recibir exactamente 1 presupuesto
     */
    it('should retrieve 1 budget for user with ID 2', async () => {
        // Simular petición de usuario con ID 2
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'GET',
            url: 'api/budgets',
            user: { id: 2 }
        });
        const res = (0, node_mocks_http_1.createResponse)();
        await BudgetController_1.BudgetController.getAll(req, res);
        // Verificar datos de respuesta
        const data = res._getJSONData();
        expect(data).toHaveLength(1); // Debe tener exactamente 1 presupuesto
        expect(res.statusCode).toBe(200);
        expect(res.status).not.toBe(404);
    });
    /**
     * PRUEBA 3: Usuario con ID 10 (que no existe) debería recibir 0 presupuestos
     * Verifica que un usuario sin presupuestos reciba array vacío, no error
     */
    it('should retrieve 0 budgets for user with ID 10', async () => {
        // Simular petición de usuario sin presupuestos
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'GET',
            url: 'api/budgets',
            user: { id: 10 } // Este ID no existe en nuestros datos de prueba
        });
        const res = (0, node_mocks_http_1.createResponse)();
        await BudgetController_1.BudgetController.getAll(req, res);
        // Verificar respuesta
        const data = res._getJSONData();
        expect(data).toHaveLength(0); // Debe devolver array vacío
        expect(res.statusCode).toBe(200); // Sigue siendo éxito aunque no haya datos
        expect(res.status).not.toBe(404);
    });
    /**
     * PRUEBA 4: El controlador debe manejar errores de base de datos correctamente
     * Simula una falla en la base de datos para verificar manejo de errores
     */
    it('should handle error when fetching budgets', async () => {
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'GET',
            url: 'api/budgets',
            user: { id: 1 }
        });
        const res = (0, node_mocks_http_1.createResponse)();
        // Cambiar la implementación del mock para que falle con un error
        // Esto simula una excepción en la base de datos
        Bugdet_1.default.findAll.mockRejectedValue(new Error('Database error'));
        await BudgetController_1.BudgetController.getAll(req, res);
        // Verificar manejo correcto del error
        expect(res.statusCode).toBe(500); // Debe devolver código 500 (Error interno)
        expect(res._getJSONData()).toEqual({ error: "Hubo un error" }); // Mensaje de error correcto
    });
});
/**
 * SUITE DE PRUEBAS para el método create del BudgetController
 * Prueba la creación de un nuevo presupuesto
 */
describe('BudgetController.create', () => {
    /**
     * PRUEBA: Verificar que se cree un nuevo presupuesto correctamente
     * Comprueba que el controlador asigna el userId, guarda el presupuesto y devuelve status 201
     */
    it('should create a new budget and respond with statusCode 201', async () => {
        // Crear un objeto presupuesto simulado con un método save mockeado
        // Este objeto simulará el comportamiento de una instancia de Budget en la base de datos
        const mockBudget = {
            save: jest.fn().mockResolvedValue(true) // El método save retornará una promesa resuelta con true
        };
        // Configurar el mock para que Budget.create retorne nuestro presupuesto simulado
        // Esto simula la creación de un nuevo registro en la base de datos
        Bugdet_1.default.create.mockResolvedValue(mockBudget);
        // Crear una petición HTTP simulada con datos de prueba
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'POST',
            url: 'api/budgets',
            user: {
                id: 1 // Usuario autenticado con ID 1
            },
            body: {
                name: 'Presupuesto de prueba',
                amount: 1000
            }
        });
        // Crear objeto de respuesta simulado para capturar resultados
        const res = (0, node_mocks_http_1.createResponse)();
        // Ejecutar el método del controlador que queremos probar
        await BudgetController_1.BudgetController.create(req, res);
        // Obtener los datos JSON que el controlador envió como respuesta
        const data = res._getJSONData();
        // Verificaciones (assertions) de los resultados esperados
        expect(res.statusCode).toBe(201); // Debe devolver código 201 (Creado)
        expect(data).toBe('Presupuesto Creado con Correctamente');
        // Verificar que se llamó al método save del presupuesto
        expect(mockBudget.save).toHaveBeenCalled();
        expect(mockBudget.save).toHaveBeenCalledTimes(1); // Verificamos que se llamó exactamente una vez
        // Verificar que se llamó a Budget.create con los datos correctos
        expect(Bugdet_1.default.create).toHaveBeenCalledWith(req.body);
    });
    /**
     * PRUEBA: Verificar que se manejen correctamente los errores durante la creación
     * Comprueba que el controlador responde con código 500 y mensaje de error adecuado
     */
    it('should handle budget creation error', async () => {
        // Crear un objeto presupuesto simulado con un método save mockeado
        const mockBudget = {
            save: jest.fn() // Mock del método save que no se llamará debido al error
        };
        // Configurar Budget.create para simular un error durante la creación
        // Esto simula un error en la base de datos al intentar crear el registro
        Bugdet_1.default.create.mockRejectedValue(new Error('Error al crear el presupuesto'));
        // Crear una petición HTTP simulada con datos de prueba
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'POST',
            url: 'api/budgets',
            user: {
                id: 1 // Usuario autenticado con ID 1
            },
            body: {
                name: 'Presupuesto de prueba',
                amount: 1000
            }
        });
        // Crear objeto de respuesta simulado para capturar resultados
        const res = (0, node_mocks_http_1.createResponse)();
        // Ejecutar el método del controlador que debería manejar el error
        await BudgetController_1.BudgetController.create(req, res);
        // Obtener la respuesta JSON generada por el controlador
        const data = res._getJSONData();
        // Verificaciones (assertions) para el caso de error
        expect(res.statusCode).toBe(500); // Debe devolver código 500 (Error interno)
        expect(data).toEqual({ error: "Error al crear el presupuesto" }); // Mensaje de error correcto
        // Verificar que NO se llamó al método save del presupuesto (porque hubo error antes)
        expect(mockBudget.save).not.toHaveBeenCalled();
        // Verificar que se llamó a Budget.create con los datos correctos (aunque falló)
        expect(Bugdet_1.default.create).toHaveBeenCalledWith(req.body);
    });
});
describe('BudgetController.getById', () => {
    beforeEach(() => {
        Bugdet_1.default.findByPk.mockImplementation(id => {
            const budget = budgets_1.budgets.filter(b => b.id === id)[0];
            return Promise.resolve(budget);
        });
    });
    it('should return a budget with ID 1 and 3 expenes', async () => {
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'GET',
            url: '/api/budgets/:budgetId',
            budget: { id: 1 }
        });
        const res = (0, node_mocks_http_1.createResponse)();
        await BudgetController_1.BudgetController.getById(req, res);
        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data.expenses).toHaveLength(3);
        expect(Bugdet_1.default.findByPk).toHaveBeenCalled();
        expect(Bugdet_1.default.findByPk).toHaveBeenCalledTimes(1);
        expect(Bugdet_1.default.findByPk).toHaveBeenCalledWith(req.budget.id, {
            include: [Expense_1.default]
        });
    });
    it('should return a budget with ID 2 and 2 expenes', async () => {
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'GET',
            url: '/api/budgets/id',
            budget: { id: 2 }
        });
        const res = (0, node_mocks_http_1.createResponse)();
        await BudgetController_1.BudgetController.getById(req, res);
        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data.expenses).toHaveLength(2);
    });
    it('should return a budget with ID 3 and 0 expenes', async () => {
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'GET',
            url: '/api/budgets/id',
            budget: { id: 3 }
        });
        const res = (0, node_mocks_http_1.createResponse)();
        await BudgetController_1.BudgetController.getById(req, res);
        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data.expenses).toHaveLength(0);
    });
});
describe('Budget Controller.updateByID', () => {
    it('should update the budget and return a success message', async () => {
        const budgetMock = {
            update: jest.fn().mockResolvedValue(true)
        };
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'PUT',
            url: '/api/budgets/:budgetId',
            budget: budgetMock,
            body: { name: 'Presupuesto Actualizado', amount: 5000 }
        });
        const res = (0, node_mocks_http_1.createResponse)();
        await BudgetController_1.BudgetController.updateById(req, res);
        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data).toBe("Presupuesto Actualizado Correctamente");
        expect(budgetMock.update).toHaveBeenCalled();
        expect(budgetMock.update).toHaveBeenCalledTimes(1);
        expect(budgetMock.update).toHaveBeenCalledWith(req.body);
    });
});
describe('Budget Controlle.deleteById', () => {
    it('should delete the budget and return a success message', async () => {
        const budgetMock = {
            destroy: jest.fn().mockResolvedValue(true)
        };
        const req = (0, node_mocks_http_1.createRequest)({
            method: 'DELETE',
            url: '/api/budgets/:budgetId',
            budget: budgetMock
        });
        const res = (0, node_mocks_http_1.createResponse)();
        await BudgetController_1.BudgetController.deleteById(req, res);
        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data).toBe("Presupuesto Eliminado Correctamente");
        expect(budgetMock.destroy).toHaveBeenCalled;
        expect(budgetMock.destroy).toHaveBeenCalledTimes(1);
    });
});
//# sourceMappingURL=BugdetController.test.js.map