import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiPercent,
  FiBell,
  FiCalendar,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiSave,
} from 'react-icons/fi';
import { dataService } from '../services/DataServiceFactory';
import { helperService } from '../services/HelperService';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const CurrencyIcon = helperService.getCurrencyIcon();
  const currencySymbol = helperService.getCurrencySymbol();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    borrowedAmount: '',
    interestRate: '',
    interestFrequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    reminderDay: '1',
    enableReminder: true
  });

  const calculatedInterest = useMemo(() => {
    try {
      if (!formData.borrowedAmount || !formData.interestRate || !formData.returnDate) return null;

      const borrowedAmount = parseFloat(formData.borrowedAmount);
      const interestRate = parseFloat(formData.interestRate);

      if (isNaN(borrowedAmount) || isNaN(interestRate)) return null;

      const startDate = new Date(formData.startDate);
      const returnDate = new Date(formData.returnDate);

      if (returnDate <= startDate) return null;

      const periods = helperService.calculateNumberOfPeriods(startDate, returnDate, formData.interestFrequency);
      const interestAmount = helperService.calculateInterestAmount(
        borrowedAmount,
        interestRate,
        formData.interestFrequency,
        periods
      );

      return {
        periods,
        interestAmount,
        totalAmount: borrowedAmount + interestAmount
      };
    } catch {
      return null;
    }
  }, [formData]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const borrowedAmount = parseFloat(formData.borrowedAmount);
    const interestRate = parseFloat(formData.interestRate);

    if (!formData.name || isNaN(borrowedAmount) || isNaN(interestRate)) {
      toast.error('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      await dataService.addUser({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        borrowedAmount,
        interestRate,
        interestFrequency: formData.interestFrequency,
        startDate: new Date(formData.startDate).toISOString(),
        returnDate: formData.returnDate ? new Date(formData.returnDate).toISOString() : undefined,
        reminderDay: parseInt(formData.reminderDay),
        enableReminder: formData.enableReminder
      });

      window.dispatchEvent(new Event('users-updated'));
      toast.success('User added!');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error adding user');
    } finally {
      setLoading(false);
    }
  };

  // Donut chart calculations
  const borrowedAmountNum = parseFloat(formData.borrowedAmount) || 0;
  const interestAmountNum = calculatedInterest?.interestAmount || 0;
  const totalAmountNum = borrowedAmountNum + interestAmountNum;
  const principalPercent = totalAmountNum > 0 ? (borrowedAmountNum / totalAmountNum) * 100 : 0;

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 dark:bg-gray-950 px-4 py-6 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* HERO HEADER */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FiUser className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t("addUserButton")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
              {t("overviewSubtitle")}
            </p>
          </div>
        </div>

        {/* MAIN GRID */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* LEFT COLUMN: FORM */}
          <div className="lg:col-span-2 space-y-6">

            {/* BASIC INFO SECTION */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-gray-800">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-gray-800 pb-3 mb-5">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <FiUser className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-slate-800 dark:text-white">{t("basicInfo")}</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <FiUser className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={`${t("fullName")} *`}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                  />
                </div>

                <div className="relative">
                  <FiPhone className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t("phone")}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                  />
                </div>

                <div className="relative md:col-span-2">
                  <FiMail className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("email")}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                  />
                </div>

                <div className="relative md:col-span-2">
                  <FiMapPin className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder={t("address")}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>
            </section>

            {/* LOAN DETAILS SECTION */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-gray-800">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-gray-800 pb-3 mb-5">
                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                  <FiTrendingUp className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-slate-800 dark:text-white">{t("loanDetails")}</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">{t("borrowedAmount")}</label>
                  <div className="relative">
                    <CurrencyIcon className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                      name="borrowedAmount"
                      type="number"
                      value={formData.borrowedAmount}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">{t("interestRate")}</label>
                  <div className="relative">
                    <FiPercent className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                      name="interestRate"
                      type="number"
                      value={formData.interestRate}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">Frequency</label>
                  <select
                    name="interestFrequency"
                    value={formData.interestFrequency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="daily">{t("daily")}</option>
                    <option value="weekly">{t("weekly")}</option>
                    <option value="monthly">{t("monthly")}</option>
                    <option value="yearly">{t("yearly")}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">Start Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">{t("returnDate")}</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                      type="date"
                      name="returnDate"
                      value={formData.returnDate}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* INTERACTIVE INTEREST SLIDER */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 ml-1">{t("quickAdjustInterest")}</label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-md">
                    {formData.interestRate || 0}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.interestRate || 0}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </section>

            {/* REMINDER SETTINGS */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-gray-800">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-gray-800 pb-3 mb-5">
                <div className="p-1.5 bg-violet-50 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                  <FiBell className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-slate-800 dark:text-white">{t("reminderSettings")}</h2>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border border-slate-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                    <FiBell className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">Enable Reminders</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">Get notified before the return date</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableReminder"
                    checked={formData.enableReminder}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-slate-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>
            </section>

            {/* ACTION BUTTONS (MOBILE) */}
            <div className="lg:hidden flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-200 font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold shadow-md shadow-indigo-500/20 hover:scale-[1.02] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" /> Add User
                  </>
                )}
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: LIVE PREVIEW (STICKY) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">

              {/* PREVIEW CARD */}
              <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/40 dark:to-gray-900 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <FiCheckCircle className="w-4 h-4 text-indigo-500" /> Live Loan Preview
                </h3>

                {calculatedInterest ? (
                  <>
                    {/* Donut Chart */}
                    <div className="flex justify-center mb-6 relative">
                      <svg viewBox="0 0 36 36" className="w-40 h-40 transform -rotate-90">
                        <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-gray-700" />
                        <circle
                          cx="18" cy="18" r="15.9155" fill="transparent"
                          stroke="#6366f1" strokeWidth="3"
                          strokeDasharray={`${principalPercent} ${100 - principalPercent}`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="18" cy="18" r="15.9155" fill="transparent"
                          stroke="#14b8a6" strokeWidth="3"
                          strokeDasharray={`${100 - principalPercent} ${principalPercent}`}
                          strokeDashoffset={`-${principalPercent}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Payable</span>
                        <span className="text-xl font-bold text-slate-800 dark:text-white">
                          {currencySymbol}{calculatedInterest.totalAmount.toFixed(0)}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-gray-400 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Principal
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {currencySymbol}{borrowedAmountNum.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-gray-400 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Interest
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {currencySymbol}{calculatedInterest.interestAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-gray-700 pt-3 flex justify-between items-center">
                        <span className="font-bold text-slate-800 dark:text-white">Total</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                          {currencySymbol}{calculatedInterest.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
                        <span>Billing Periods</span>
                        <span className="font-semibold">{calculatedInterest.periods} × {formData.interestFrequency}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiAlertCircle className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-medium px-4 leading-relaxed">
                      Fill in the loan amount, interest rate, and return date to see a live preview.
                    </p>
                  </div>
                )}
              </div>

              {/* DESKTOP ACTION BUTTONS */}
              <div className="hidden lg:flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold shadow-md shadow-indigo-500/20 hover:scale-[1.02] transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" /> Add User
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full py-3.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-200 font-medium hover:bg-slate-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddUser;