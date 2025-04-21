// Importar utilidades para simular peticiones HTTP y respuestas para pruebas
import { createRequest, createResponse } from 'node-mocks-http'
// Importar datos simulados para las pruebas
import { budgets } from '../mocks/budgets'
// Importar el modelo Budget que será mockeado
import Budget from '../../models/Bugdet'  // NOTA: Hay un error de escritura aquí, debería ser "Budget"
// Importar el controlador que vamos a probar
import { BudgetController } from '../../controllers/BudgetController'

/**
 * CONFIGURACIÓN INICIAL DE PRUEBAS
 * Reemplazamos completamente el modelo Budget con un mock
 * Esto nos permite controlar su comportamiento sin usar una base de datos real
 */
jest.mock('../../models/Bugdet', () => ({
    // Mockeamos los métodos que necesitamos para las pruebas
    findAll: jest.fn(),
    create: jest.fn() // Mock del método create para la prueba de creación
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
       (Budget.findAll as jest.Mock).mockReset();
       
       // Implementamos una versión simulada de findAll que usa filtrado de arrays
       (Budget.findAll as jest.Mock).mockImplementation((options) => {
        // Filtramos el array de presupuestos usando el userId proporcionado en la consulta
        // Esto simula lo que haría una base de datos real con una consulta WHERE
        const updateBudget = budgets.filter(budgets => budgets.userId === options.where.userId);
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
        const req = createRequest({
            method: 'GET',
            url: 'api/budgets',
            user: { id: 1 } // El usuario autenticado tiene ID 1
        });

        // Crear objeto de respuesta simulado para capturar resultados
        const res = createResponse();
        
        // Ejecutar el método del controlador que queremos probar
        await BudgetController.getAll(req, res);

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
        const req = createRequest({
            method: 'GET',
            url: 'api/budgets',
            user: { id: 2 }
        });

        const res = createResponse();
        await BudgetController.getAll(req, res);
        
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
        const req = createRequest({
            method: 'GET',
            url: 'api/budgets',
            user: { id: 10 } // Este ID no existe en nuestros datos de prueba
        });

        const res = createResponse();
        await BudgetController.getAll(req, res);
        
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
        const req = createRequest({
            method: 'GET',
            url: 'api/budgets',
            user: { id: 1 }
        });
        const res = createResponse();

        // Cambiar la implementación del mock para que falle con un error
        // Esto simula una excepción en la base de datos
        (Budget.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));
       
        await BudgetController.getAll(req, res);

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
        (Budget.create as jest.Mock).mockResolvedValue(mockBudget);

        // Crear una petición HTTP simulada con datos de prueba
        const req = createRequest({
            method: 'POST',
            url: 'api/budgets',
            user: {
                id: 1  // Usuario autenticado con ID 1
            },
            body: {
                name: 'Presupuesto de prueba',
                amount: 1000 
            }
        });

        // Crear objeto de respuesta simulado para capturar resultados
        const res = createResponse();

        // Ejecutar el método del controlador que queremos probar
        await BudgetController.create(req, res);

        // Obtener los datos JSON que el controlador envió como respuesta
        const data = res._getJSONData();

        // Verificaciones (assertions) de los resultados esperados
        expect(res.statusCode).toBe(201); // Debe devolver código 201 (Creado)
        expect(data).toBe('Presupuesto Creado con Correctamente'); 
        
        // Verificar que se llamó al método save del presupuesto
        expect(mockBudget.save).toHaveBeenCalled(); 
        expect(mockBudget.save).toHaveBeenCalledTimes(1); // Verificamos que se llamó exactamente una vez
        
        // Verificar que se llamó a Budget.create con los datos correctos
        expect(Budget.create).toHaveBeenCalledWith(req.body);
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
        (Budget.create as jest.Mock).mockRejectedValue(new Error('Error al crear el presupuesto'));

        // Crear una petición HTTP simulada con datos de prueba
        const req = createRequest({
            method: 'POST',
            url: 'api/budgets',
            user: {
                id: 1  // Usuario autenticado con ID 1
            },
            body: {
                name: 'Presupuesto de prueba',
                amount: 1000 
            }
        });

        // Crear objeto de respuesta simulado para capturar resultados
        const res = createResponse();
        
        // Ejecutar el método del controlador que debería manejar el error
        await BudgetController.create(req, res);
        
        // Obtener la respuesta JSON generada por el controlador
        const data = res._getJSONData();
    
        // Verificaciones (assertions) para el caso de error
        expect(res.statusCode).toBe(500); // Debe devolver código 500 (Error interno)
        expect(data).toEqual({ error: "Error al crear el presupuesto" }); // Mensaje de error correcto
        
        // Verificar que NO se llamó al método save del presupuesto (porque hubo error antes)
        expect(mockBudget.save).not.toHaveBeenCalled(); 
        
        // Verificar que se llamó a Budget.create con los datos correctos (aunque falló)
        expect(Budget.create).toHaveBeenCalledWith(req.body);
    });
});