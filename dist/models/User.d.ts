import { Model } from 'sequelize-typescript';
import Budget from './Bugdet';
declare class User extends Model {
    /** Name */
    name: string;
    /** Password */
    password: string;
    /** Email */
    email: string;
    token: string;
    confirm: boolean;
    budget: Budget[];
}
export default User;
