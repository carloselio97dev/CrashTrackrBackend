import {Table, Column,Model, DataType, HasMany, Default, Unique, AllowNull } from 'sequelize-typescript';
import Budget from './Bugdet';

@Table({ 
        tableName: 'users' 
})


class User extends Model {
   /** Name */
    @AllowNull(false)
    @Column({
        type:DataType.STRING(50)
    })
    declare name:string
     /** Password */
    @AllowNull(false)
    @Column({
        type:DataType.STRING(60)
    })
    declare password:string
    /** Email */
    @AllowNull(false)
    @Unique(true)
    @Column({
        type:DataType.STRING(50)
    })
    declare email:string
     /* Token*/   
    @Column({
        type:DataType.STRING(6)
    })
    declare token:string
    /* Confirm */
    @Default(false)
    @Column({
        type:DataType.BOOLEAN
    })
    declare confirm:boolean


    @HasMany(()=>Budget,{
        onUpdate:'CASCADE',
        onDelete:'CASCADE',
    })
    declare budget:Budget[]
}

export default User;