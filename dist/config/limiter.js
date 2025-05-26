"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limiter = void 0;
const express_rate_limit_1 = require("express-rate-limit");
exports.limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000, // 1 minutes (Cuanto tiempo va recordar los request)
    limit: process.env.NODE_ENV === 'production' ? 5 : 100, //Permite 5 request por cada windowMs
    message: { "error": "Haz Alcanzado el Limite de Peticiones" }, // Mensaje que se enviara al cliente si supera el limite
});
//# sourceMappingURL=limiter.js.map