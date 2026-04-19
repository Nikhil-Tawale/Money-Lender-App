import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
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
  useTheme();
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
  }, [amount, numericAmount, interestRate, numericRate, periods, numericPeriods]);

  useEffect(() => {
    setValidationErrors(computedValidationErrors);
  }, [computedValidationErrors]);

  const { asStartDate, asReturnDate, dateValidationError } = useMemo(() => {
    let startDateObj: Date;
    let returnDateObj: Date | null = null;
    let error = "";

    try {
      startDateObj = new Date(startDate);
      if (isNaN(startDateObj.getTime())) throw new Error("Invalid start date");

      if (returnDate) {
        returnDateObj = new Date(returnDate);
        if (isNaN(returnDateObj.getTime()))
          throw new Error("Invalid return date");

        if (returnDateObj < startDateObj) {
          error = "Return date cannot be before start date";
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Invalid date";
      startDateObj = new Date();
    }

    return { asStartDate: startDateObj, asReturnDate: returnDateObj, dateValidationError: error };
  }, [startDate, returnDate]);

  useEffect(() => {
    setDateError(dateValidationError);
  }, [dateValidationError]);

  const computedPeriods = useMemo(() => {
    try {
      setCalculationError("");

      if (returnDate && asReturnDate) {
        return helperService.calculateNumberOfPeriods(
          asStartDate,
          asReturnDate,
          frequency,
        );
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

      return helperService.calculateInterestAmount(
        numericAmount,
        numericRate,
        frequency,
        computedPeriods,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error calculating interest";
      setCalculationError(message);
      return 0;
    }
  }, [numericAmount, numericRate, frequency, computedPeriods]);

  const totalAmount = useMemo(() => {
    if (numericAmount <= 0 || interestAmount < 0) return 0;
    return numericAmount + interestAmount;
  }, [numericAmount, interestAmount]);

  const hasErrors =
    Object.values(validationErrors).some((err) => err !== "") ||
    dateError !== "" ||
    calculationError !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all">

      {/* HEADER */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 border-b border-white/30 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700 transition"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="ml-3 text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Interest Calculator
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">

        {/* MAIN CARD */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-slate-700 shadow-2xl rounded-3xl p-5 sm:p-8 space-y-6">

          {/* ERROR */}
          {calculationError && (
            <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
              <FiAlertCircle className="text-red-600 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{calculationError}</p>
            </div>
          )}

          {/* INPUT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Amount */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Borrowed Amount
              </label>
              <div className="relative mt-2">
                <MdCurrencyRupee className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 rounded-xl bg-white/70 dark:bg-slate-700 border focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:shadow-md ${
                    validationErrors.amount ? "border-red-500" : "border-gray-200 dark:border-slate-600"
                  }`}
                  placeholder="Enter amount"
                />
              </div>
            </div>

            {/* Interest */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Interest Rate (%)
              </label>
              <div className="relative mt-2">
                <FiPercent className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/70 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:shadow-md"
                  placeholder="Rate"
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full mt-2 py-3 px-3 rounded-xl bg-white/70 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Period */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Periods
              </label>
              <div className="relative mt-2">
                <FiRepeat className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  value={periods}
                  onChange={(e) => setPeriods(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/70 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full mt-2 py-3 px-3 rounded-xl bg-white/70 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Return Date */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Return Date
              </label>
              <div className="relative mt-2">
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 rounded-xl bg-white/70 dark:bg-slate-700 border ${
                    dateError ? "border-red-500" : "border-gray-200 dark:border-slate-600"
                  } focus:ring-2 focus:ring-indigo-500 outline-none`}
                />
              </div>
            </div>
          </div>

          {/* RESULT */}
          <div className="rounded-3xl p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl hover:scale-[1.02] transition">
            <h2 className="text-lg font-semibold mb-3">Result</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Periods</span>
                <span>{computedPeriods}</span>
              </div>

              <div className="flex justify-between">
                <span>Interest</span>
                <span>₹{interestAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold text-lg border-t border-white/30 pt-2">
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {hasErrors && (
              <p className="text-xs text-yellow-200 mt-3">
                Fix errors to get accurate results
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default InterestCalculator;