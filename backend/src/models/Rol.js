import { DataTypes } from 'sequelize';


export default (sequelize) => {
const Rol = sequelize.define('Rol', {
id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
nombre: { type: DataTypes.STRING(30), allowNull: false, unique: true },
}, { tableName: 'roles', timestamps: false });
return Rol;
};