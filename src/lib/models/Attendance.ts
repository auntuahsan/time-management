import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';
import type User from './User';

interface AttendanceAttributes {
  id: string;
  userId: string;
  checkInTime: Date;
  checkOutTime: Date | null;
  date: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AttendanceCreationAttributes extends Optional<AttendanceAttributes, 'id' | 'checkOutTime'> {}

class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> implements AttendanceAttributes {
  public id!: string;
  public userId!: string;
  public checkInTime!: Date;
  public checkOutTime!: Date | null;
  public date!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public user?: User;
}

Attendance.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    checkOutTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'attendance',
    timestamps: true,
    indexes: [
      {
        // Non-unique index for faster queries
        fields: ['userId', 'date'],
        name: 'idx_user_date',
      },
    ],
  }
);

export default Attendance;
