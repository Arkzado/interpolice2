import { DataTypes } from 'sequelize';


export default (sequelize) => {
const Ciudadano = sequelize.define('Ciudadano', {
id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
codigo: { type: DataTypes.STRING(30), allowNull: false, unique: true },
nombre: { type: DataTypes.STRING(100), allowNull: false },
apellido: { type: DataTypes.STRING(100) },
fecha_nacimiento: { type: DataTypes.DATEONLY, allowNull: false },
planeta_origen: { type: DataTypes.STRING(100), allowNull: false },
planeta_residencia: { type: DataTypes.STRING(100), allowNull: false },
estado: { type: DataTypes.ENUM('vivo','muerto','congelado'), allowNull: false, defaultValue: 'vivo' },
foto: { type: DataTypes.STRING(255) },
qr: { type: DataTypes.STRING(255) },
}, { tableName: 'ciudadanos' });
return Ciudadano;
};