import axios from "axios";
import { User, Payment } from "../types";
import { IDataService } from "./IDataService";
import { MessageService } from "./MessageService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Configure axios
axios.defaults.baseURL = API_URL;

// Add token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("current_user");
      console.error("API: Authentication failed, token removed");
    }
    return Promise.reject(error);
  }
);

export class ApiService implements IDataService {
  /**
   * API Endpoints Expected:
   *
   * PUT /api/users/:id
   * Body: Partial<User> (any subset of user fields)
   * Headers: Authorization: Bearer <token>
   * Response: User (updated user object)
   *
   * Example request body:
   * {
   *   "name": "John Doe",
   *   "borrowedAmount": 5000,
   *   "interestRate": 10,
   *   "enableReminder": true,
   *   "reminderDay": 15
   * }
   */

  messageService: MessageService;

  constructor(){
    this.messageService = new MessageService();
  }

  private handleError(error: any): never {
    const message =
      error.response?.data?.message || error.message || "API request failed";
    console.error("API Error:", message);
    throw new Error(message);
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await axios.get("/users");
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUser(id: string): Promise<User | null> {
    try {
      const response = await axios.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async addUser(user: Omit<User, "_id" | "id">): Promise<User> {
    try {
      const response = await axios.post("/users", user);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      console.log('API: Updating user', id, 'with data:', updates);

      // Validate required fields if they're being updated
      if (updates.name !== undefined && !updates.name.trim()) {
        throw new Error('User name cannot be empty');
      }
      if (updates.borrowedAmount !== undefined && updates.borrowedAmount < 0) {
        throw new Error('Borrowed amount cannot be negative');
      }
      if (updates.interestRate !== undefined && updates.interestRate < 0) {
        throw new Error('Interest rate cannot be negative');
      }

      const response = await axios.put(`/users/${id}`, updates);

      console.log('API: User updated successfully', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Failed to update user', id, error);
      this.handleError(error);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await axios.delete(`/users/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async addPayment(
    userId: string,
    payment: Omit<Payment, "_id">,
  ): Promise<Payment> {
    try {
      const response = await axios.post(`/users/${userId}/payment`, payment);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPayments(userId: string): Promise<Payment[]> {
    try {
      const response = await axios.get(`/users/${userId}/payments`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getStats() {
    try {
      const response = await axios.get("/stats");
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<any> {
    const stored = localStorage.getItem("current_user");
    return stored ? JSON.parse(stored) : null;
  }

  async setCurrentUser(userData: any): Promise<void> {
    localStorage.setItem("current_user", JSON.stringify(userData));
  }

  async clearCurrentUser(): Promise<void> {
    localStorage.removeItem("current_user");
    localStorage.removeItem("token");
  }

  async initializeSampleData(): Promise<void> {
    // API mode doesn't need sample data initialization
    console.log("API mode: Sample data should be initialized on backend");
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ success: boolean; userData?: any; error?: string }> {
    try {
      const response = await axios.post("/auth/login", { email, password });
      const data = response.data;
      if (!data.success) {
        return { success: false, error: data.message || "Login failed" };
      }
      // Store user data and token
      localStorage.setItem("token", data.token);
      localStorage.setItem("current_user", JSON.stringify({ ...data.user, token: data.token }));
      return { success: true, userData: { ...data.user, token: data.token } };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: error.message || "Login failed" };
    }
  }

  async register(name: string, email: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message };
      }
      const userWithToken = { ...data.user, token: data.token };
      localStorage.setItem("current_user", JSON.stringify(userWithToken));
      return { success: true, userData: userWithToken };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Health check method to verify API connectivity
  async healthCheck(): Promise<boolean> {
    try {
      await axios.get("/health");
      return true;
    } catch (error) {
      console.error("API health check failed:", error);
      return false;
    }
  }

  // Notification methods
  async sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.post("/notifications/send-email", { to, subject, body });
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
