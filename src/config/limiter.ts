import { rateLimit } from 'express-rate-limit';

export const limiter=  rateLimit({
    windowMs:  60 * 1000, // 1 minutes (Cuanto tiempo va recordar los request)
    limit:5, //Permite 5 request por cada windowMs
    message: {"error":"Haz Alcanzado el Limite de Peticiones"}, // Mensaje que se enviara al cliente si supera el limite

})