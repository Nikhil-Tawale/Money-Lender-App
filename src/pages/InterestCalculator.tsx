import React, { useMemo, useState, useEffect } from "react";
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
  FiDollarSign,
} from "react-icons/fi";
import { MdCurrencyRupee } from "react-icons/md";
import { helperService } from "../services/HelperService";

const InterestCalculator: React.FC = () => {
  useTheme();
  const { t } = useLanguage();
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

  // Donut chart calculations
  const principalPercent = totalAmount > 0 ? (numericAmount / totalAmount) * 100 : 0;
  const interestPercent = totalAmount > 0 ? (interestAmount / totalAmount) * 100 : 0;
  const radius = 15.9155;

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 dark:bg-gray-950 px-4 py-6 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* HERO HEADER */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FiTrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t("calculator")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
              {t("calculateSubtitle")}
            </p>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

          {/* LEFT COLUMN: FORM */}
          <div className="lg:col-span-3 space-y-6">

            {/* ERROR ALERT */}
            {(calculationError || dateError) && (
              <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl text-rose-700 dark:text-rose-300 text-sm">
                <FiAlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="font-medium">{calculationError || dateError}</p>
              </div>
            )}

            {/* LOAN INPUTS */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-gray-800">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-gray-800 pb-3 mb-5">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <MdCurrencyRupee className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-slate-800 dark:text-white">{t("loanDetails")}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Amount */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">
                    {t("borrowedAmount")}
                  </label>
                  <div className="relative">
                    <MdCurrencyRupee className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border bg-slate-50 text-slate-900 outline-none transition focus:bg-white focus:ring-4 dark:bg-gray-800 dark:text-white ${
                        validationErrors.amount
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-gray-700"
                      }`}
                    />
                  </div>
                  {validationErrors.amount && (
                    <p className="text-rose-500 text-xs mt-1 ml-1">{validationErrors.amount}</p>
                  )}
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">
                    {t("interestRate")}
                  </label>
                  <div className="relative">
                    <FiPercent className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      placeholder="0"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border bg-slate-50 text-slate-900 outline-none transition focus:bg-white focus:ring-4 dark:bg-gray-800 dark:text-white ${
                        validationErrors.interestRate
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-gray-700"
                      }`}
                    />
                  </div>
                  {validationErrors.interestRate && (
                    <p className="text-rose-500 text-xs mt-1 ml-1">{validationErrors.interestRate}</p>
                  )}
                </div>

                {/* Frequency */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">
                    {t("frequency")}
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="daily">{t("daily")}</option>
                    <option value="weekly">{t("weekly")}</option>
                    <option value="monthly">{t("monthly")}</option>
                    <option value="yearly">{t("yearly")}</option>
                  </select>
                </div>

                {/* Periods */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">
                    Periods
                  </label>
                  <div className="relative">
                    <FiRepeat className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                      type="number"
                      value={periods}
                      onChange={(e) => setPeriods(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border bg-slate-50 text-slate-900 outline-none transition focus:bg-white focus:ring-4 dark:bg-gray-800 dark:text-white ${
                        validationErrors.periods
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-gray-700"
                      }`}
                    />
                  </div>
                  {validationErrors.periods && (
                    <p className="text-rose-500 text-xs mt-1 ml-1">{validationErrors.periods}</p>
                  )}
                </div>
              </div>

              {/* INTERACTIVE INTEREST SLIDER */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 ml-1">
                    {t("quickAdjustInterest")}
                  </label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-md">
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
                  className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </section>

            {/* TIMELINE SECTION */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-gray-800">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-gray-800 pb-3 mb-5">
                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                  <FiCalendar className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-slate-800 dark:text-white">{t("duration")}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">
                    {t("startDate")}
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">
                    {t("returnDateOptional")}
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border bg-slate-50 text-slate-900 outline-none transition focus:bg-white focus:ring-4 dark:bg-gray-800 dark:text-white ${
                        dateError
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-gray-700"
                      }`}
                    />
                  </div>
                  {dateError && (
                    <p className="text-rose-500 text-xs mt-1 ml-1">{dateError}</p>
                  )}
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: LIVE RESULT PANEL (STICKY) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6 space-y-4">

              {/* RESULT CARD */}
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-100">
                      Calculation Result
                    </h2>
                    {!hasErrors && totalAmount > 0 && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full">
                        <FiCheckCircle className="w-3 h-3" /> Valid
                      </div>
                    )}
                  </div>

                  {/* Donut Chart */}
                  {totalAmount > 0 ? (
                    <div className="flex justify-center mb-6 relative">
                      <svg viewBox="0 0 36 36" className="w-40 h-40 transform -rotate-90">
                        {/* Background Track */}
                        <circle
                          cx="18" cy="18" r={radius}
                          fill="transparent"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="3.5"
                        />
                        {/* Principal Segment */}
                        <circle
                          cx="18" cy="18" r={radius}
                          fill="transparent"
                          stroke="#A5B4FC"
                          strokeWidth="3.5"
                          strokeDasharray={`${principalPercent} ${100 - principalPercent}`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                        />
                        {/* Interest Segment */}
                        <circle
                          cx="18" cy="18" r={radius}
                          fill="transparent"
                          stroke="#FBBF24"
                          strokeWidth="3.5"
                          strokeDasharray={`${interestPercent} ${100 - interestPercent}`}
                          strokeDashoffset={`-${principalPercent}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[10px] uppercase tracking-wider text-indigo-200 font-semibold">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-white">
                          ₹{totalAmount.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center mb-6 relative">
                      <svg viewBox="0 0 36 36" className="w-40 h-40 transform -rotate-90">
                        <circle
                          cx="18" cy="18" r={radius}
                          fill="transparent"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="3.5"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs text-indigo-200 font-medium px-6 text-center">
                          Enter values to see result
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-indigo-100 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-300"></span>
                        Principal
                      </span>
                      <span className="font-semibold text-white">
                        ₹{numericAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-indigo-100 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        Interest
                      </span>
                      <span className="font-semibold text-white">
                        ₹{interestAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-white/20 pt-3 flex justify-between items-center">
                      <span className="font-bold text-white">Total Payable</span>
                      <span className="font-bold text-amber-300 text-xl">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK SUMMARY CARD */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-gray-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-4">
                  Quick Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-gray-400">
                      <FiClock className="w-4 h-4" /> Duration
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {computedPeriods} {frequency} periods
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-gray-400">
                      <FiPercent className="w-4 h-4" /> Rate
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {numericRate}% per {frequency.replace('ly', '')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-gray-400">
                      <FiDollarSign className="w-4 h-4" /> Interest
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      ₹{interestAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {hasErrors && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-2">
                    <FiAlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                      Fix the highlighted errors to get accurate results.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InterestCalculator;