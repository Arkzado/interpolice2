import { sequelize } from '../config/db.js';
import RolModel from './Rol.js';
import UsuarioModel from './Usuario.js';
import CiudadanoModel from './Ciudadano.js';


export const Rol = RolModel(sequelize);
export const Usuario = UsuarioModel(sequelize);
export const Ciudadano = CiudadanoModel(sequelize);


Rol.hasMany(Usuario, { foreignKey: 'rolId' });
Usuario.belongsTo(Rol, { foreignKey: 'rolId' });


export async function syncModels() {
await sequelize.sync({ alter: true });
}