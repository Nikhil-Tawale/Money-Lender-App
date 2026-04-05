import { IconType } from "react-icons";
import { MdCurrencyRupee, MdOutlineAttachMoney } from "react-icons/md";
import {
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiCheckCircle,
} from "react-icons/fi";

type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";
type StatKey =
  | "totalBorrowed"
  | "totalReceived"
  | "totalUsers"
  | "totalInterest";
type InterestFrequency = "daily" | "weekly" | "monthly" | "yearly";

// ✅ Custom Error Classes for better error handling
class HelperServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HelperServiceError";
  }
}

class ValidationError extends HelperServiceError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class CalculationError extends HelperServiceError {
  constructor(message: string) {
    super(message);
    this.name = "CalculationError";
  }
}

class HelperService {
  private currencyIconMap: Record<CurrencyCode, IconType> = {
    INR: MdCurrencyRupee,
    USD: FiDollarSign,
    EUR: MdOutlineAttachMoney,
    GBP: MdOutlineAttachMoney,
  };

  private currencySymbolMap: Record<CurrencyCode, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  private statIconMap: Record<StatKey, IconType> = {
    totalBorrowed: FiTrendingUp,
    totalReceived: FiCheckCircle,
    totalUsers: FiUsers,
    totalInterest: FiTrendingUp,
  };

  // ------------------- Validation Helpers -------------------
  private validateNumber(
    value: number,
    fieldName: string,
    allowZero: boolean = false,
  ): void {
    if (!Number.isFinite(value)) {
      throw new ValidationError(
        `${fieldName} must be a valid number, got: ${value}`,
      );
    }
    if (value < 0) {
      throw new ValidationError(
        `${fieldName} cannot be negative, got: ${value}`,
      );
    }
    if (!allowZero && value === 0) {
      throw new ValidationError(`${fieldName} cannot be zero`);
    }
  }

  private validateDate(date: any, fieldName: string): void {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw new ValidationError(
        `${fieldName} must be a valid date, got: ${date}`,
      );
    }
  }

  private validateDates(startDate: Date, endDate: Date): void {
    this.validateDate(startDate, "Start date");
    this.validateDate(endDate, "End date");

    if (endDate < startDate) {
      throw new ValidationError("End date cannot be before start date");
    }
  }

  // ------------------- Currency -------------------
  getCurrencyIcon(currencyCode?: string): IconType {
    const key = (
      currencyCode ||
      import.meta.env.VITE_CURRENCY ||
      "INR"
    ).toUpperCase() as CurrencyCode;
    return this.currencyIconMap[key] || MdOutlineAttachMoney;
  }

  getCurrencySymbol(currencyCode?: string): string {
    const key = (
      currencyCode ||
      import.meta.env.VITE_CURRENCY ||
      "INR"
    ).toUpperCase() as CurrencyCode;
    return this.currencySymbolMap[key] || "₹";
  }

  getStatIcon(stat: StatKey): IconType {
    return this.statIconMap[stat];
  }

  // ------------------- Core Interest Logic -------------------
  calculateInterestByDuration(
    borrowedAmount: number,
    interestRate: number,
    startDate: Date,
    endDate: Date,
    frequency: InterestFrequency = "monthly",
  ): number {
    try {
      this.validateNumber(borrowedAmount, "Borrowed amount", true);
      this.validateNumber(interestRate, "Interest rate", true);
      this.validateDates(startDate, endDate);

      const days = this.getDaysDifference(startDate, endDate);

      let periods = 1;

      switch (frequency) {
        case "daily":
          periods = days;
          break;

        case "weekly":
          periods = days / 7;
          break;

        case "monthly": {
          const daysInStartMonth = this.getDaysInMonth(startDate);
          periods = days / daysInStartMonth;
          break;
        }

        case "yearly":
          periods = days / 365;
          break;

        default:
          throw new ValidationError(`Unknown frequency: ${frequency}`);
      }

      const interest = (borrowedAmount * interestRate * periods) / 100;

      if (!Number.isFinite(interest)) {
        throw new CalculationError(
          "Interest calculation resulted in invalid number",
        );
      }

      return Math.round(interest);
    } catch (error) {
      if (error instanceof HelperServiceError) {
        throw error;
      }
      throw new CalculationError(
        `Failed to calculate interest by duration: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  calculateTotalWithInterestByDuration(
    borrowedAmount: number,
    interestRate: number,
    startDate: any,
    endDate: Date,
    frequency: InterestFrequency = "monthly",
  ): number {
    try {
      this.validateNumber(borrowedAmount, "Borrowed amount", true);
      const interest = this.calculateInterestByDuration(
        borrowedAmount,
        interestRate,
        startDate,
        endDate,
        frequency,
      );
      return borrowedAmount + interest;
    } catch (error) {
      if (error instanceof HelperServiceError) {
        throw error;
      }
      throw new CalculationError(
        `Failed to calculate total with interest: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  calculateRemainingAmountByDuration(
    borrowedAmount: number,
    interestRate: number,
    startDate: Date,
    endDate: Date,
    payments: Array<{ amount: number; date: Date }>,
    frequency: InterestFrequency = "monthly",
  ): number {
    try {
      this.validateNumber(borrowedAmount, "Borrowed amount", true);
      this.validateNumber(interestRate, "Interest rate", true);
      this.validateDates(startDate, endDate);

      if (!Array.isArray(payments)) {
        throw new ValidationError("Payments must be an array");
      }

      // ✅ 1. Total Interest (FULL duration)
      const totalInterest = this.calculateInterestByDuration(
        borrowedAmount,
        interestRate,
        startDate,
        endDate,
        frequency,
      );

      // ✅ 2. Total Paid (just sum)
      const totalPaid = payments.reduce((sum, p) => {
        this.validateNumber(p.amount, "Payment amount", true);
        this.validateDate(p.date, "Payment date");
        return sum + p.amount;
      }, 0);

      // ✅ 3. Final Amount
      const remaining = borrowedAmount + totalInterest - totalPaid;

      return Math.max(0, Math.round(remaining));
    } catch (error) {
      if (error instanceof HelperServiceError) {
        throw error;
      }
      throw new CalculationError(
        `Failed to calculate remaining amount: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  // ------------------- Helpers -------------------
  private getDaysDifference(startDate: Date, endDate: Date): number {
    try {
      this.validateDates(startDate, endDate);
      const msPerDay = 24 * 60 * 60 * 1000;
      return Math.max(
        1,
        Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay),
      );
    } catch (error) {
      if (error instanceof HelperServiceError) {
        throw error;
      }
      throw new CalculationError(
        `Failed to calculate days difference: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private getDaysInMonth(date: Date): number {
    try {
      this.validateDate(date, "Date");
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    } catch (error) {
      if (error instanceof HelperServiceError) {
        throw error;
      }
      throw new CalculationError(
        `Failed to get days in month: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // ------------------- User Helpers -------------------
  calculateUserInterestByDuration(
    user: { borrowedAmount: number; interestRate: number; startDate: Date },
    endDate: Date,
    frequency: InterestFrequency = "monthly",
  ): number {
    try {
      if (!user || typeof user !== "object") {
        throw new ValidationError("User object must be provided");
      }
      if (!Number.isFinite(user.borrowedAmount)) {
        throw new ValidationError("User borrowedAmount must be a valid number");
      }
      if (!Number.isFinite(user.interestRate)) {
        throw new ValidationError("User interestRate must be a valid number");
      }
      this.validateDate(user.startDate, "User start date");

      return this.calculateInterestByDuration(
        user.borrowedAmount,
        user.interestRate,
        user.startDate,
        endDate,
        frequency,
      );
    } catch (error) {
      if (error instanceof HelperServiceError) {
        throw error;
      }
      throw new CalculationError(
        `Failed to calculate user interest: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  calculateUserTotalWithInterestByDuration(
    user: { borrowedAmount: number; interestRate: number; startDate: Date },
    endDate: Date,
    frequency: InterestFrequency = "monthly",
  ): number {
    try {
      if (!user || typeof user !== "object") {
        throw new ValidationError("User object must be provided");
      }

      return this.calculateTotalWithInterestByDuration(
        user.borrowedAmount,
        user.interestRate,
        user.startDate,
        endDate,
        frequency,
      );
    } catch (error) {
      if (error instanceof HelperServiceError) {
        throw error;
      }
      throw new CalculationError(
        `Failed to calculate user total with interest: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  calculateUserRemainingAmountByDuration(
    user: {
      borrowedAmount: number;
      interestRate: number;
      startDate: Date;
      payments?: Array<{ amount: number; date: Date }>;
    },
    endDate: Date,
    frequency: InterestFrequency = "monthly",
  ): number {
    try {
      if (!user || typeof user !== "object") {
        throw new ValidationError("User object must be provided");
      }

      return this.calculateRemainingAmountByDuration(
        user.borrowedAmount,
        user.interestRate,
        user.startDate,
        endDate,
        user.payments || [],
        frequency,
      );
    } catch (error) {
      if (error instanceof HelperServiceError) {
        throw error;
      }
      throw new CalculationError(
        `Failed to calculate user remaining amount: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // ------------------- Interest Calculator Helpers -------------------
  calculateNumberOfPeriods(
    startDate: Date,
    endDate: Date,
    frequency: InterestFrequency,
  ): any {
    try {
      this.validateDates(startDate, endDate);
      const days = this.getDaysDifference(startDate, endDate);

      switch (frequency) {
        case "daily":
          return days;
        case "weekly":
          return days / 7;
        case "monthly":
          return days / 30;
        case "yearly":
          return days / 365;
        default:
          throw new ValidationError(`Unknown frequency: ${frequency}`);
      }
    } catch (error) {
      if (error instanceof HelperServiceError) {
        throw error;
      }
      throw new CalculationError(
        `Failed to calculate number of periods: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  isValidReturnDate(
    startDate: Date,
    returnDate: Date,
    frequency: InterestFrequency,
  ): boolean {
    try {
      this.validateDates(startDate, returnDate);

      const days = this.getDaysDifference(startDate, returnDate);

      switch (frequency) {
        case "weekly": {
          // Return date should be aligned to weekly boundary
          const weeks = days / 7;
          return weeks === Math.floor(weeks);
        }
        case "monthly": {
          // Return date should be on the same day of the month
          return returnDate.getDate() === startDate.getDate();
        }
        case "daily":
        case "yearly":
        default:
          return true;
      }
    } catch (error) {
      console.warn(
        `Error validating return date: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return false;
    }
  }

  calculateInterestAmount(
    amount: number,
    interestRate: number,
    frequency: InterestFrequency,
    periods: number,
  ): number {
    try {
      this.validateNumber(amount, "Amount", true);
      this.validateNumber(interestRate, "Interest rate", true);
      this.validateNumber(periods, "Periods", true);

      if (
        typeof frequency !== "string" ||
        !["daily", "weekly", "monthly", "yearly"].includes(frequency)
      ) {
        throw new ValidationError(`Invalid frequency: ${frequency}`);
      }

      if (periods === 0 || amount === 0 || interestRate === 0) {
        return 0;
      }

      const interest = (amount * interestRate * periods) / 100;

      if (!Number.isFinite(interest)) {
        throw new CalculationError(
          "Interest calculation resulted in invalid number",
        );
      }

      return Math.round(interest);
    } catch (error) {
      if (error instanceof HelperServiceError) {
        throw error;
      }
      throw new CalculationError(
        `Failed to calculate interest amount: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // ✅ NEW: Simplified methods for UserDetails (using today's date as endDate)
  calculateUserTotalWithInterest(user: { borrowedAmount: number; interestRate: number; startDate?: string; returnDate?: string; interestFrequency?: InterestFrequency } | null,): number {
    try {
      if (!user || typeof user !== "object") {
        throw new ValidationError("User object must be provided");
      }
      if (!Number.isFinite(user.borrowedAmount)) {
        throw new ValidationError("User borrowedAmount must be a valid number");
      }
      if (!Number.isFinite(user.interestRate)) {
        throw new ValidationError("User interestRate must be a valid number");
      }

      const startDate = user.startDate
        ? new Date(user.startDate)
        : (user.returnDate ? new Date(user.returnDate) : new Date());
      this.validateDate(startDate, "Start date");

      const endDate = user.returnDate ? new Date(user.returnDate) : new Date();
      this.validateDate(endDate, "End date");

      if (endDate < startDate) {
        throw new ValidationError("End date cannot be before start date");
      }

      const frequency = (user.interestFrequency ||
        "monthly") as InterestFrequency;

      return this.calculateTotalWithInterestByDuration(
        user.borrowedAmount,
        user.interestRate,
        startDate,
        endDate,
        frequency,
      );
    } catch (error) {
      if (error instanceof HelperServiceError) {
        throw error;
      }
      throw new CalculationError(
        `Failed to calculate user total with interest: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  calculateUserRemainingAmount(
    user: {
      borrowedAmount: number;
      interestRate: number;
      startDate?: string;
      returnDate?: string;
      interestFrequency?: InterestFrequency;
      payments?: Array<{ amount: number; date: string }>;
    } | null,
  ): number {
    try {
      if (!user || typeof user !== "object") {
        throw new ValidationError("User object must be provided");
      }
      if (!Number.isFinite(user.borrowedAmount)) {
        throw new ValidationError("User borrowedAmount must be a valid number");
      }
      if (!Number.isFinite(user.interestRate)) {
        throw new ValidationError("User interestRate must be a valid number");
      }

      const startDate = user.startDate
        ? new Date(user.startDate)
        : user.returnDate
          ? new Date(user.returnDate)
          : new Date();
      this.validateDate(startDate, "Start date");

      const endDate = user.returnDate ? new Date(user.returnDate) : new Date();
      this.validateDate(endDate, "End date");

      if (endDate < startDate) {
        throw new ValidationError("End date cannot be before start date");
      }

      const frequency = (user.interestFrequency ||
        "monthly") as InterestFrequency;

      // Convert payments from string dates to Date objects
      const paymentsWithDateObjects = (user.payments || []).map((payment) => ({
        amount: payment.amount,
        date: new Date(payment.date),
      }));

      return this.calculateRemainingAmountByDuration(
        user.borrowedAmount,
        user.interestRate,
        startDate,
        endDate,
        paymentsWithDateObjects,
        frequency,
      );
    } catch (error) {
      if (error instanceof HelperServiceError) {
        throw error;
      }
      throw new CalculationError(
        `Failed to calculate user remaining amount: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // ------------------- Utility -------------------
  getFrequencyDisplayText(frequency: InterestFrequency): string {
    try {
      switch (frequency) {
        case "daily":
          return "Daily";
        case "weekly":
          return "Weekly";
        case "monthly":
          return "Monthly";
        case "yearly":
          return "Yearly";
        default:
          console.warn(
            `Unknown frequency: ${frequency}, defaulting to Monthly`,
          );
          return "Monthly";
      }
    } catch (error) {
      console.error(
        `Error getting frequency display text: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return "Monthly";
    }
  }

  // ✅ NEW: Get number of periods per year based on frequency
  getPeriodsPerYear(frequency: InterestFrequency): number {
    try {
      switch (frequency) {
        case "daily":
          return 365;
        case "weekly":
          return 52;
        case "monthly":
          return 12;
        case "yearly":
          return 1;
        default:
          throw new ValidationError(`Unknown frequency: ${frequency}`);
      }
    } catch (error) {
      if (error instanceof HelperServiceError) {
        throw error;
      }
      console.error(
        `Error getting periods per year: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return 12; // Default to monthly
    }
  }

  // ✅ NEW: Get suggested return date based on frequency
  getSuggestedReturnDate(fromDate: Date, frequency: InterestFrequency): Date {
    try {
      this.validateDate(fromDate, "From date");

      const suggested = new Date(fromDate);

      switch (frequency) {
        case "daily":
          suggested.setDate(suggested.getDate() + 1);
          break;
        case "weekly":
          suggested.setDate(suggested.getDate() + 7);
          break;
        case "monthly":
          suggested.setMonth(suggested.getMonth() + 1);
          break;
        case "yearly":
          suggested.setFullYear(suggested.getFullYear() + 1);
          break;
        default:
          throw new ValidationError(`Unknown frequency: ${frequency}`);
      }

      return suggested;
    } catch (error) {
      if (error instanceof HelperServiceError) {
        throw error;
      }
      throw new CalculationError(
        `Failed to get suggested return date: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // ✅ NEW: Calculate user interest (simplified version for stats)
  calculateUserInterest(
    user: {
      borrowedAmount: number;
      interestRate: number;
      startDate?: string;
      returnDate?: string;
      interestFrequency?: InterestFrequency;
    } | null,
  ): number {
    try {
      if (!user || typeof user !== "object") {
        throw new ValidationError("User object must be provided");
      }
      if (!Number.isFinite(user.borrowedAmount)) {
        throw new ValidationError("User borrowedAmount must be a valid number");
      }
      if (!Number.isFinite(user.interestRate)) {
        throw new ValidationError("User interestRate must be a valid number");
      }

      const startDate = user.startDate
        ? new Date(user.startDate)
        : user.returnDate
          ? new Date(user.returnDate)
          : new Date();
      this.validateDate(startDate, "Start date");

      const endDate = user.returnDate ? new Date(user.returnDate) : new Date();
      this.validateDate(endDate, "End date");

      if (endDate < startDate) {
        throw new ValidationError("End date cannot be before start date");
      }

      const frequency = (user.interestFrequency ||
        "monthly") as InterestFrequency;

      return this.calculateInterestByDuration(
        user.borrowedAmount,
        user.interestRate,
        startDate,
        endDate,
        frequency,
      );
    } catch (error) {
      if (error instanceof HelperServiceError) {
        // Log but return 0 for stats calculation to not break the dashboard
        console.warn(`Error calculating user interest: ${error.message}`);
        return 0;
      }
      console.warn(
        `Error calculating user interest: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return 0;
    }
  }

  formatDuration(startDate: Date, endDate: Date): string {
    try {
      this.validateDates(startDate, endDate);
      const days = this.getDaysDifference(startDate, endDate);

      if (days < 30) return `${days} days`;

      const months = Math.floor(days / 30);
      const remDays = days % 30;

      if (months < 12) {
        return remDays
          ? `${months} months ${remDays} days`
          : `${months} months`;
      }

      const years = Math.floor(months / 12);
      const remMonths = months % 12;

      return remMonths
        ? `${years} years ${remMonths} months`
        : `${years} years`;
    } catch (error) {
      if (error instanceof HelperServiceError) {
        return "Invalid date range";
      }
      console.error(
        `Error formatting duration: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return "N/A";
    }
  }
}

export const helperService = new HelperService();
export { HelperServiceError, ValidationError, CalculationError };