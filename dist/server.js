"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const express_1 = __importDefault(require("express"));
const colors_1 = __importDefault(require("colors"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = require("./config/db");
const budgetRouter_1 = __importDefault(require("./routes/budgetRouter"));
const authRouter_1 = __importDefault(require("./routes/authRouter"));
async function connectDB() {
    try {
        await db_1.db.authenticate();
        db_1.db.sync();
        console.log(colors_1.default.blue.bold("Conexion Exitosa a la BD"));
    }
    catch (error) {
        console.log(colors_1.default.red.bold("Fallo la conexion a la BD"));
        //console.log(error);
    }
}
connectDB();
const app = (0, express_1.default)();
//Implementando Morgan
app.use((0, morgan_1.default)('dev'));
//Para leer los formularios
app.use(express_1.default.json());
app.use('/api/budgets', budgetRouter_1.default);
app.use('/api/auth', authRouter_1.default);
app.get('/', (req, res) => {
    res.send("Todo bien");
});
//Configuracion de la app
exports.default = app;
//# sourceMappingURL=server.js.map