import express from 'express';
import colors from 'colors';
import morgan from 'morgan';
import {db} from './config/db';
import budgetRouter from './routes/budgetRouter';
import authRouter from './routes/authRouter';
export async function  connectDB(){
    try {
        await db.authenticate()
        db.sync()
        console.log(colors.blue.bold("Conexion Exitosa a la BD"))
    } catch (error) {
        console.log(colors.red.bold("Fallo la conexion a la BD"));
        //console.log(error);

    }
}

connectDB();

const app= express();
//Implementando Morgan
app.use(morgan('dev'));
//Para leer los formularios
app.use(express.json());
app.use('/api/budgets', budgetRouter);
app.use('/api/auth',authRouter)



app.get('/',(req,res)=>{
    res.send("Todo bien");
})
//Configuracion de la app
export default app;