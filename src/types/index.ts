export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  userId: string;
  checkInTime: Date;
  checkOutTime: Date | null;
  date: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface QRPayload {
  action: 'attendance';
  secret: string;
  timestamp: number;
}

export interface AttendanceWithUser extends Omit<Attendance, 'user'> {
  user: {
    username: string;
    email: string;
  };
}
