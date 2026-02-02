import sequelize from '../db';
import User from './User';
import Attendance from './Attendance';

// Setup associations
Attendance.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Attendance, { foreignKey: 'userId', as: 'attendances' });

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export { sequelize, User, Attendance, syncDatabase };
