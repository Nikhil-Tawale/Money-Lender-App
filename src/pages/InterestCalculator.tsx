import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPercent,
  FiCalendar,
  FiRepeat,
  FiAlertCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { MdCurrencyRupee } from "react-icons/md";
import { helperService } from "../services/HelperService";

const InterestCalculator: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [frequency, setFrequency] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");
  const [periods, setPeriods] = useState("1");
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [returnDate, setReturnDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [calculationError, setCalculationError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    amount: "",
    interestRate: "",
    periods: "",
    startDate: "",
    returnDate: "",
  });
  const navigate = useNavigate();
  const numericAmount = parseFloat(amount) || 0;
  const numericRate = parseFloat(interestRate) || 0;
  const numericPeriods = parseInt(periods, 10) || 0;

  // Validate inputs - remove useEffect and compute on the fly
  const computedValidationErrors = useMemo(() => {
    const errors = { ...validationErrors };

    if (amount && numericAmount < 0) {
      errors.amount = "Amount cannot be negative";
    } else if (amount && numericAmount === 0) {
      errors.amount = "Please enter an amount";
    } else {
      errors.amount = "";
    }

    if (interestRate && numericRate < 0) {
      errors.interestRate = "Interest rate cannot be negative";
    } else if (interestRate && numericRate === 0) {
      errors.interestRate = "Please enter an interest rate";
    } else {
      errors.interestRate = "";
    }

    if (periods && numericPeriods <= 0) {
      errors.periods = "Periods must be greater than 0";
    } else {
      errors.periods = "";
    }

    return errors;
  }, [
    amount,
    numericAmount,
    interestRate,
    numericRate,
    periods,
    numericPeriods,
  ]);

  // Update validation errors when computed values change
  useEffect(() => {
    setValidationErrors(computedValidationErrors);
  }, [computedValidationErrors]);

  // Compute dates safely
  const { asStartDate, asReturnDate, dateValidationError } = useMemo(() => {
    let startDateObj: Date;
    let returnDateObj: Date | null = null;
    let error = "";

    try {
      startDateObj = new Date(startDate);
      if (isNaN(startDateObj.getTime())) {
        throw new Error("Invalid start date");
      }

      if (returnDate) {
        returnDateObj = new Date(returnDate);
        if (isNaN(returnDateObj.getTime())) {
          throw new Error("Invalid return date");
        }

        if (returnDateObj < startDateObj) {
          error = "Return date cannot be before start date";
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Invalid date";
      startDateObj = new Date();
    }

    return {
      asStartDate: startDateObj,
      asReturnDate: returnDateObj,
      dateValidationError: error,
    };
  }, [startDate, returnDate]);

  // Update date error
  useEffect(() => {
    setDateError(dateValidationError);
  }, [dateValidationError]);

  const computedPeriods = useMemo(() => {
    try {
      setCalculationError("");

      if (returnDate && asReturnDate) {
        const periodsCount = helperService.calculateNumberOfPeriods(
          asStartDate,
          asReturnDate,
          frequency,
        );
        return periodsCount;
      }

      return numericPeriods;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error calculating periods";
      setCalculationError(message);
      return 0;
    }
  }, [returnDate, asReturnDate, frequency, asStartDate, numericPeriods]);

  const interestAmount = useMemo(() => {
    try {
      if (numericAmount <= 0 || numericRate <= 0 || computedPeriods <= 0) {
        return 0;
      }

      const interest = helperService.calculateInterestAmount(
        numericAmount,
        numericRate,
        frequency,
        computedPeriods,
      );

      return interest;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error calculating interest";
      setCalculationError(message);
      return 0;
    }
  }, [numericAmount, numericRate, frequency, computedPeriods]);

  const totalAmount = useMemo(() => {
    if (numericAmount <= 0 || interestAmount < 0) {
      return 0;
    }
    return numericAmount + interestAmount;
  }, [numericAmount, interestAmount]);

  const hasErrors =
    Object.values(validationErrors).some((err) => err !== "") ||
    dateError !== "" ||
    calculationError !== "";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex justify-between mb-6">
          <div className="flex items-center">
            <button onClick={() => navigate("/")} className="mr-3">
              <FiArrowLeft />
            </button>
            <h1 className="text-2xl font-bold">Interest Calculator</h1>
          </div>
        </div>

        <div className="space-y-4">
          {/* Global Error Alert */}
          {calculationError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <FiAlertCircle
                className="text-red-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div className="text-sm text-red-700">{calculationError}</div>
            </div>
          )}

          {/* Amount + Interest */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Borrowed Amount
              </label>
              <div className="relative mt-1">
                <MdCurrencyRupee
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`input-field pl-10 ${validationErrors.amount ? "border-red-500 focus:ring-red-500" : ""}`}
                  placeholder="0.00"
                />
              </div>
              {validationErrors.amount && (
                <p className="text-xs text-red-600 mt-1">
                  {validationErrors.amount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Interest Rate (%)
              </label>
              <div className="relative mt-1">
                <FiPercent className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className={`input-field pl-10 ${validationErrors.interestRate ? "border-red-500 focus:ring-red-500" : ""}`}
                  placeholder="0.00"
                />
              </div>
              {validationErrors.interestRate && (
                <p className="text-xs text-red-600 mt-1">
                  {validationErrors.interestRate}
                </p>
              )}
            </div>
          </div>

          {/* Frequency + Periods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="input-field mt-1 w-full"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Periods
              </label>
              <div className="relative mt-1">
                <FiRepeat className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  value={periods}
                  onChange={(e) => setPeriods(e.target.value)}
                  className={`input-field pl-10 ${validationErrors.periods ? "border-red-500 focus:ring-red-500" : ""}`}
                  placeholder="1"
                />
              </div>
              {validationErrors.periods && (
                <p className="text-xs text-red-600 mt-1">
                  {validationErrors.periods}
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`input-field mt-1 w-full ${validationErrors.startDate ? "border-red-500 focus:ring-red-500" : ""}`}
              />
              {validationErrors.startDate && (
                <p className="text-xs text-red-600 mt-1">
                  {validationErrors.startDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Return Date
              </label>
              <div className="relative mt-1">
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className={`input-field pl-10 w-full ${validationErrors.returnDate || dateError ? "border-red-500 focus:ring-red-500" : ""}`}
                />
              </div>
              {(validationErrors.returnDate || dateError) && (
                <p className="text-xs text-red-600 mt-1">
                  {validationErrors.returnDate || dateError}
                </p>
              )}
            </div>
          </div>

          {/* Result */}
          <div
            className={`mt-6 p-4 rounded-lg ${hasErrors ? "bg-gray-100 opacity-60" : "bg-blue-50 border border-blue-200"}`}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Calculated Result
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Periods:</span>
                <span className="font-medium">
                  {computedPeriods.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Interest:</span>
                <span className="font-medium">
                  ₹{interestAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between font-bold text-lg border-t pt-2 text-gray-900">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {hasErrors && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-700">
                  Please correct the errors above to see accurate calculations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestCalculator;
