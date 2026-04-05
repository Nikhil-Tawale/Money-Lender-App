import { User, Payment } from "../types";
import axios from "axios";
import { IDataService } from "./IDataService";
import { helperService } from "./HelperService";
import { MessageService } from "./MessageService";

const USERS_DATA_KEY = "money_lender_borrowers";
const USERS_STORAGE_KEY = "money_lender_users";
const CURRENT_USER_KEY = "current_user";

export class LocalStorageService implements IDataService {
  messageService: MessageService;
  constructor(){
    this.messageService = new MessageService();
  }
  private getCurrentUserId(): string | null {
    const currentUser = localStorage.getItem("current_user");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      return user.id;
    }
    return null;
  }

  private getBorrowers(): User[] {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return [];

    const allData = JSON.parse(localStorage.getItem(USERS_DATA_KEY) || "{}");
    return allData[currentUserId] || [];
  }

  private saveBorrowers(borrowers: User[]): void {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return;

    const allData = JSON.parse(localStorage.getItem(USERS_DATA_KEY) || "{}");
    allData[currentUserId] = borrowers;
    localStorage.setItem(USERS_DATA_KEY, JSON.stringify(allData));
  }

  async getUsers(): Promise<User[]> {
    return this.getBorrowers();
  }

  async getUser(id: string): Promise<User | null> {
    const borrowers = this.getBorrowers();
    return borrowers.find((b) => b._id === id || b.id === id) || null;
  }

  async addUser(user: Omit<User, "_id" | "id">): Promise<User> {
    const borrowers = this.getBorrowers();
    const newUser = {
      ...user,
      _id: Date.now().toString(),
      id: Date.now().toString(),
      payments: [],
      createdAt: new Date().toISOString(),
    };

    borrowers.push(newUser);
    this.saveBorrowers(borrowers);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const borrowers = this.getBorrowers();
    const index = borrowers.findIndex((b) => b._id === id || b.id === id);
    if (index !== -1) {
      borrowers[index] = { ...borrowers[index], ...updates };
      this.saveBorrowers(borrowers);
      return borrowers[index];
    }
    return null;
  }

  async deleteUser(id: string): Promise<void> {
    const borrowers = this.getBorrowers();
    const filtered = borrowers.filter((b) => b._id !== id && b.id !== id);
    this.saveBorrowers(filtered);
  }

  async addPayment(
    userId: string,
    payment: Omit<Payment, "_id">,
  ): Promise<Payment> {
    const borrowers = this.getBorrowers();
    const index = borrowers.findIndex(
      (b) => b._id === userId || b.id === userId,
    );

    if (index === -1) {
      throw new Error("User not found");
    }

    const newPayment = {
      ...payment,
      _id: Date.now().toString(),
      date: payment.date || new Date().toISOString(),
    };

    borrowers[index].payments = borrowers[index].payments || [];
    borrowers[index].payments.push(newPayment);
    this.saveBorrowers(borrowers);

    return newPayment;
  }

  async getPayments(userId: string): Promise<Payment[]> {
    const user = await this.getUser(userId);
    return user?.payments || [];
  }

  async getStats() {
    try {
      const users = await this.getUsers();
      const totalBorrowed = users.reduce(
        (sum, user) => sum + (user.borrowedAmount || 0),
        0,
      );

      // ✅ Safe calculation with error handling
      const totalInterest = users.reduce((sum, user) => {
        try {
          return sum + helperService.calculateUserInterest(user);
        } catch (error) {
          console.warn(
            `Error calculating interest for user ${user._id}:`,
            error,
          );
          return sum;
        }
      }, 0);

      const totalReceived = users.reduce(
        (sum, user) =>
          sum + (user.payments?.reduce((pSum, p) => pSum + p.amount, 0) || 0),
        0,
      );

      return {
        totalBorrowed,
        totalUsers: users.length,
        totalInterest,
        totalReceived,
      };
    } catch (error) {
      console.error("Error calculating stats:", error);
      return {
        totalBorrowed: 0,
        totalUsers: 0,
        totalInterest: 0,
        totalReceived: 0,
      };
    }
  }

  async getCurrentUser(): Promise<any> {
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    return currentUser ? JSON.parse(currentUser) : null;
  }

  async setCurrentUser(userData: any): Promise<void> {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
  }

  async clearCurrentUser(): Promise<void> {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem("token");
  }

  async initializeSampleData(): Promise<void> {
    const borrowers = this.getBorrowers();
    if (borrowers.length === 0) {
      const sampleData: User[] = [
        {
          _id: "1",
          id: "1",
          name: "John Doe",
          phone: "+1234567890",
          email: "john@example.com",
          address: "123 Main St",
          borrowedAmount: 5000,
          interestRate: 10,
          interestFrequency: "monthly",
          returnDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          reminderDay: 15,
          enableReminder: true,
          payments: [
            {
              _id: "p1",
              amount: 1000,
              date: new Date(
                Date.now() - 15 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              note: "First payment",
            },
          ],
        },
        {
          _id: "2",
          id: "2",
          name: "Jane Smith",
          phone: "+1987654321",
          email: "jane@example.com",
          address: "456 Oak Ave",
          borrowedAmount: 10000,
          interestRate: 12,
          interestFrequency: "monthly",
          returnDate: new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          reminderDay: 1,
          enableReminder: true,
          payments: [],
        },
      ];
      this.saveBorrowers(sampleData);
    }
  }

  async login(email: string, password: string): Promise<any> {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password,
    );
    if (!foundUser) {
      return {
        success: false,
        error: "Invalid email or password",
        userData: null,
      };
    }
    const userData = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      token: "mock-token-" + Date.now(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
    return { success: true, error: "", userData };
  }

  async register(name: string, email: string, password: string): Promise<any> {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      return { success: false, error: "User already exists", userData: null };
    }
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    // Auto login after registration
    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      token: "mock-token-" + Date.now(),
    };
    return { success: true, error: "", userData };
  }

  // Notification methods
  async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.post("/notifications/send-email", {
        to,
        subject,
        body,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to send email:", error);
      return { success: false, message: "Failed to send email" };
    }
  }

  async sendWhatsApp(phone: string, message: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = this.messageService.sendWhatsApp(phone, message);
      return response;
    } catch (error) {
      console.error("Failed to send WhatsApp:", error);
      return { success: false, message: "Failed to send WhatsApp message" };
    }
  }

  async sendSMS(phone: string, message: string,): Promise<{ success: boolean; message?: string }> {
    try {
      const response = this.messageService.sendSMS(phone, message);
      return response;
    } catch (error) {
      console.error("Failed to send SMS:", error);
      return { success: false, message: "Failed to send SMS" };
    }
  }
}
