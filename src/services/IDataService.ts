import { User, Payment } from '../types';

export interface IDataService {
  // User Management
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  addUser(user: Omit<User, '_id' | 'id'>): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | null>;
  deleteUser(id: string): Promise<void>;
  
  // Payment Management
  addPayment(userId: string, payment: Omit<Payment, '_id'>): Promise<Payment>;
  getPayments(userId: string): Promise<Payment[]>;

  // Authentication
  login(email: string, password: string): Promise<{ success: boolean; userData?: any; error?: string }>;
  register(name: string, email: string, password: string): Promise<{ success: boolean; error?: string }>;
  
  // Statistics
  getStats(): Promise<{
    totalBorrowed: number;
    totalUsers: number;
    totalInterest: number;
    totalReceived: number;
  }>;
  
  // Session management (for localstorage / API client abstractions)
  getCurrentUser(): Promise<any>;
  setCurrentUser(userData: any): Promise<void>;
  clearCurrentUser(): Promise<void>;

  // Initialize sample data (optional)
  initializeSampleData(): Promise<void>;

  //Notfication
  sendEmail(to: string, subject: string, message: string): Promise<any>;
  sendWhatsApp(phoneNumber: string, message: string): Promise<any>;
  sendSMS(phoneNumber: string, message: string): Promise<any>;
}