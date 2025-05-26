import { Model } from 'sequelize-typescript';
import Budget from './Bugdet';
declare class Expense extends Model {
    /** Name */
    name: string;
    /** Description */
    amount: number;
    budgetId: number;
    budget: Budget;
}
export default Expense;
