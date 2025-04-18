import { Table, Column, Model, DataType, ForeignKey, BelongsTo,AllowNull} from 'sequelize-typescript';
import Budget from './Bugdet';

@Table({
    tableName:'expenses'
})

class Expense extends Model {
    /** Name */
    @AllowNull(false)
    @Column({
        type:DataType.STRING(100)
    })
    declare name:string
    /** Description */
    @AllowNull(false)
    @Column({
        type:DataType.DECIMAL
    })
    declare amount:number


    @ForeignKey(()=>Budget)
    declare budgetId:number

    @BelongsTo(()=>Budget)
    declare budget:Budget

}

export default Expense;