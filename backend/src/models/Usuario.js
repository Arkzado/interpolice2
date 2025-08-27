import { DataTypes } from 'sequelize';


export default (sequelize) => {
const Usuario = sequelize.define('Usuario', {
id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
nombre: { type: DataTypes.STRING(100), allowNull: false },
email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
passwordHash: { type: DataTypes.STRING(120), allowNull: false },
rolId: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'usuarios' });
return Usuario;
};