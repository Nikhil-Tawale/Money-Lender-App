import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  FiPercent,
  FiCalendar,
  FiRepeat,
  FiAlertCircle,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiArrowLeft
} from "react-icons/fi";
import { helperService } from "../services/HelperService";

const InterestCalculator: React.FC = () => {
  useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [frequency, setFrequency] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");
  const [periods, setPeriods] = useState("1");
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split("T")[0]
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

  const currencySymbol = helperService.getCurrencySymbol();
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

    return {
      asStartDate: startDateObj,
      asReturnDate: returnDateObj,
      dateValidationError: error,
    };
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
          frequency
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
        computedPeriods
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

  // Donut chart calculations
  const principalPercent =
    totalAmount > 0 ? (numericAmount / totalAmount) * 100 : 0;
  const interestPercent =
    totalAmount > 0 ? (interestAmount / totalAmount) * 100 : 0;
  const radius = 15.9155;

  return (
    <>
      <style>{`
        .calc-scroll::-webkit-scrollbar { width: 4px; }
        .calc-scroll::-webkit-scrollbar-track { background: transparent; }
        .calc-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1; border-radius: 4px;
        }
        .dark .calc-scroll::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>

      {/* VIEWPORT-LOCKED WRAPPER */}
      <div className="h-[100dvh] w-full bg-slate-50 dark:bg-gray-950 px-4 py-4 sm:px-6 lg:px-8 transition-colors duration-300 font-sans flex flex-col overflow-hidden">
        <div className="max-w-6xl mx-auto w-full flex flex-col h-full">
          <button
            onClick={() => navigate("/")}
            aria-label="Back to dashboard"
            className="group flex items-center gap-2 px-4 h-10 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-slate-200/70 dark:border-gray-800 text-slate-600 dark:text-gray-300 hover:shadow-md hover:border-slate-300 active:scale-95 transition-all mb-4 w-fit shrink-0"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-semibold hidden sm:inline">
              Dashboard
            </span>
          </button>
          {/* HEADER */}
          <header className="flex items-center gap-3 mb-4 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <FiTrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t("calculator")}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
                {t("calculateSubtitle")}
              </p>
            </div>
          </header>

          {/* MAIN GRID — fills remaining height */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
            {/* LEFT COLUMN — scrollable internally */}
            <div className="lg:col-span-3 overflow-y-auto calc-scroll pr-1 min-h-0 space-y-4">
              {/* ERROR ALERT */}
              {(calculationError || dateError) && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl text-rose-700 dark:text-rose-300 text-xs">
                  <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="font-medium">{calculationError || dateError}</p>
                </div>
              )}

              {/* LOAN INPUTS */}
              <section className="bg-white dark:bg-gray-900 rounded-[20px] p-4 shadow-sm border border-slate-100 dark:border-gray-800">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-gray-800 pb-2.5 mb-4">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <span className="text-sm font-bold leading-none w-4 h-4 flex items-center justify-center">
                      {currencySymbol}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                    {t("loanDetails")}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Amount */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">
                      {t("borrowedAmount")}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold leading-none">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border bg-slate-50 text-slate-900 text-sm outline-none transition focus:bg-white focus:ring-4 dark:bg-gray-800 dark:text-white ${
                          validationErrors.amount
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-gray-700"
                        }`}
                      />
                    </div>
                    {validationErrors.amount && (
                      <p className="text-rose-500 text-[10px] mt-1 ml-1">
                        {validationErrors.amount}
                      </p>
                    )}
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">
                      {t("interestRate")}
                    </label>
                    <div className="relative">
                      <FiPercent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="number"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        placeholder="0"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border bg-slate-50 text-slate-900 text-sm outline-none transition focus:bg-white focus:ring-4 dark:bg-gray-800 dark:text-white ${
                          validationErrors.interestRate
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-gray-700"
                        }`}
                      />
                    </div>
                    {validationErrors.interestRate && (
                      <p className="text-rose-500 text-[10px] mt-1 ml-1">
                        {validationErrors.interestRate}
                      </p>
                    )}
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">
                      {t("frequency")}
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="daily">{t("daily")}</option>
                      <option value="weekly">{t("weekly")}</option>
                      <option value="monthly">{t("monthly")}</option>
                      <option value="yearly">{t("yearly")}</option>
                    </select>
                  </div>

                  {/* Periods */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">
                      Periods
                    </label>
                    <div className="relative">
                      <FiRepeat className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="number"
                        value={periods}
                        onChange={(e) => setPeriods(e.target.value)}
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border bg-slate-50 text-slate-900 text-sm outline-none transition focus:bg-white focus:ring-4 dark:bg-gray-800 dark:text-white ${
                          validationErrors.periods
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-gray-700"
                        }`}
                      />
                    </div>
                    {validationErrors.periods && (
                      <p className="text-rose-500 text-[10px] mt-1 ml-1">
                        {validationErrors.periods}
                      </p>
                    )}
                  </div>
                </div>

                {/* SLIDER */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 ml-1">
                      {t("quickAdjustInterest")}
                    </label>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                      {interestRate || 0}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={interestRate || 0}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-1 px-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </section>

              {/* TIMELINE */}
              <section className="bg-white dark:bg-gray-900 rounded-[20px] p-4 shadow-sm border border-slate-100 dark:border-gray-800">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-gray-800 pb-2.5 mb-4">
                  <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                    <FiCalendar className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                    {t("duration")}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">
                      {t("startDate")}
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">
                      {t("returnDateOptional")}
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border bg-slate-50 text-slate-900 text-sm outline-none transition focus:bg-white focus:ring-4 dark:bg-gray-800 dark:text-white ${
                          dateError
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-gray-700"
                        }`}
                      />
                    </div>
                    {dateError && (
                      <p className="text-rose-500 text-[10px] mt-1 ml-1">
                        {dateError}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN — fixed, no scroll */}
            <div className="lg:col-span-2 flex flex-col gap-3 min-h-0 overflow-y-auto calc-scroll">
              {/* RESULT CARD */}
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-[20px] p-5 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full blur-3xl -ml-8 -mb-8"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                      Calculation Result
                    </h2>
                    {!hasErrors && totalAmount > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        <FiCheckCircle className="w-3 h-3" /> Valid
                      </div>
                    )}
                  </div>

                  {/* Donut */}
                  {totalAmount > 0 ? (
                    <div className="flex justify-center mb-4 relative">
                      <svg
                        viewBox="0 0 36 36"
                        className="w-32 h-32 transform -rotate-90"
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r={radius}
                          fill="transparent"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="3.5"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r={radius}
                          fill="transparent"
                          stroke="#A5B4FC"
                          strokeWidth="3.5"
                          strokeDasharray={`${principalPercent} ${100 - principalPercent}`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r={radius}
                          fill="transparent"
                          stroke="#FBBF24"
                          strokeWidth="3.5"
                          strokeDasharray={`${interestPercent} ${100 - interestPercent}`}
                          strokeDashoffset={`-${principalPercent}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[9px] uppercase tracking-wider text-indigo-200 font-semibold">
                          Total
                        </span>
                        <span className="text-lg font-bold text-white">
                          {currencySymbol}
                          {totalAmount.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center mb-4 relative">
                      <svg
                        viewBox="0 0 36 36"
                        className="w-32 h-32 transform -rotate-90"
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r={radius}
                          fill="transparent"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="3.5"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-indigo-200 font-medium px-6 text-center">
                          Enter values to see result
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-indigo-100 font-medium">
                        <span className="w-2 h-2 rounded-full bg-indigo-300"></span>
                        Principal
                      </span>
                      <span className="font-semibold text-white tabular-nums">
                        {currencySymbol}
                        {numericAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-indigo-100 font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        Interest
                      </span>
                      <span className="font-semibold text-white tabular-nums">
                        {currencySymbol}
                        {interestAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-white/20 pt-2 flex justify-between items-center">
                      <span className="font-bold text-white text-xs">
                        Total Payable
                      </span>
                      <span className="font-bold text-amber-300 text-base tabular-nums">
                        {currencySymbol}
                        {totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK SUMMARY */}
              <div className="bg-white dark:bg-gray-900 rounded-[20px] p-4 shadow-sm border border-slate-100 dark:border-gray-800 shrink-0">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-3">
                  Quick Summary
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-gray-400">
                      <FiClock className="w-3.5 h-3.5" /> Duration
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white tabular-nums">
                      {computedPeriods} {frequency} periods
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-gray-400">
                      <FiPercent className="w-3.5 h-3.5" /> Rate
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white tabular-nums">
                      {numericRate}% per {frequency.replace("ly", "")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-gray-400">
                      <span className="w-3.5 text-xs font-bold leading-none text-slate-500 text-center">
                        {currencySymbol}
                      </span>
                      Interest
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white tabular-nums">
                      {currencySymbol}
                      {interestAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {hasErrors && (
                  <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-2">
                    <FiAlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                      Fix the highlighted errors to get accurate results.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InterestCalculator;