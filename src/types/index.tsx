export interface User {
  _id?: string;
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  borrowedAmount: number;
  interestRate: number;
  interestFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: string;
  returnDate?: string;
  reminderDay: number;
  enableReminder: boolean;
  payments?: Payment[];
  totalInterest?: number;
  createdAt?: string;
}

export interface Payment {
  _id?: string;
  amount: number;
  date: string;
  note?: string;
}

export interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}