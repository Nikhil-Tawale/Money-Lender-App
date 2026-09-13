import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiPercent,
  FiBell,
  FiAlertCircle,
  FiX,
  FiCalendar,
  FiCheckCircle,
  FiTrendingUp,
} from 'react-icons/fi';
import { dataService } from '../services/DataServiceFactory';
import { helperService } from '../services/HelperService';

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [calculationError, setCalculationError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    borrowedAmount: '',
    interestRate: '',
    reminderDay: '',
  });

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

  useEffect(() => {
    loadUserData();
  }, [id]);

  const loadUserData = async () => {
    if (!id) return;
    try {
      const user = await dataService.getUser(id);
      if (!user) {
        toast.error('User not found');
        navigate('/');
        return;
      }

      setFormData({
        name: user.name,
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || '',
        borrowedAmount: user.borrowedAmount.toString(),
        interestRate: user.interestRate.toString(),
        interestFrequency: user.interestFrequency,
        startDate: user.startDate ? new Date(user.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        returnDate: user.returnDate ? new Date(user.returnDate).toISOString().split('T')[0] : '',
        reminderDay: user.reminderDay.toString(),
        enableReminder: user.enableReminder
      });
    } catch {
      toast.error('Failed to load user data');
      navigate('/');
    } finally {
      setInitialLoading(false);
    }
  };

  // ✅ LOGIC UNCHANGED
  const calculatedInterest = useMemo(() => {
    try {
      setCalculationError('');

      if (!formData.borrowedAmount || !formData.interestRate || !formData.returnDate) {
        return null;
      }

      const borrowedAmount = parseFloat(formData.borrowedAmount);
      const interestRate = parseFloat(formData.interestRate);

      if (isNaN(borrowedAmount) || isNaN(interestRate) || borrowedAmount <= 0 || interestRate < 0) {
        return null;
      }

      const startDate = new Date(formData.startDate);
      const returnDate = new Date(formData.returnDate);

      if (returnDate <= startDate) {
        setCalculationError('Return date must be in the future');
        return null;
      }

      const periods = helperService.calculateNumberOfPeriods(
        startDate,
        returnDate,
        formData.interestFrequency
      );

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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error calculating interest';
      setCalculationError(message);
      return null;
    }
  }, [formData]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let errors = { ...validationErrors };
    let hasErrors = false;

    if (!formData.name.trim()) {
      errors.name = 'Please enter a valid name';
      hasErrors = true;
    } else errors.name = '';

    const borrowedAmount = parseFloat(formData.borrowedAmount);
    if (isNaN(borrowedAmount) || borrowedAmount <= 0) {
      errors.borrowedAmount = 'Invalid amount';
      hasErrors = true;
    } else errors.borrowedAmount = '';

    const interestRate = parseFloat(formData.interestRate);
    if (isNaN(interestRate) || interestRate < 0) {
      errors.interestRate = 'Invalid interest rate';
      hasErrors = true;
    } else errors.interestRate = '';

    const reminderDay = parseInt(formData.reminderDay);
    if (formData.enableReminder && (isNaN(reminderDay) || reminderDay < 1 || reminderDay > 31)) {
      errors.reminderDay = 'Invalid reminder day';
      hasErrors = true;
    } else errors.reminderDay = '';

    setValidationErrors(errors);

    if (hasErrors) return;

    setLoading(true);
    try {
      const updatedUser = await dataService.updateUser(id!, {
        ...formData,
        borrowedAmount,
        interestRate,
        reminderDay,
        startDate: new Date(formData.startDate).toISOString(),
        returnDate: formData.returnDate ? new Date(formData.returnDate).toISOString() : undefined,
      });

      if (!updatedUser) {
        throw new Error('User could not be updated');
      }

      toast.success('User updated successfully!');
      navigate(`/user/${id}`);
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-gray-400 font-medium">Loading borrower data...</p>
        </div>
      </div>
    );
  }

  // Calculate percentages for donut chart
  const borrowedAmount = parseFloat(formData.borrowedAmount) || 0;
  const interestAmount = calculatedInterest?.interestAmount || 0;
  const totalAmount = borrowedAmount + interestAmount;
  const principalPercent = totalAmount > 0 ? (borrowedAmount / totalAmount) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-6 overflow-y-auto">
      
      {/* Main Form Container */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-5xl my-4 sm:my-0 bg-white dark:bg-gray-900 shadow-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-gray-800 flex flex-col max-h-[90vh]"
      >
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400 font-semibold">User Management</p>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{t("edit")}</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/user/${id}`)}
            aria-label="Close edit form"
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-gray-800 dark:hover:text-white transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {calculationError && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl text-rose-700 dark:text-rose-300 text-sm">
              <FiAlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="font-medium">{calculationError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: FORM INPUTS */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* BASIC INFO */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-gray-800 pb-2">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <h2 className="font-semibold text-slate-800 dark:text-white">{t("basicInfo")}</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: 'name', icon: FiUser, placeholder: 'Full Name', type: 'text' },
                    { name: 'phone', icon: FiPhone, placeholder: 'Phone Number', type: 'tel' },
                    { name: 'email', icon: FiMail, placeholder: 'Email Address', type: 'email' }
                  ].map(f => {
                    const Icon = f.icon;
                    return (
                      <div key={f.name} className={f.name === 'email' ? 'md:col-span-2' : ''}>
                        <div className="relative">
                          <Icon className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                          <input
                            name={f.name}
                            type={f.type}
                            value={(formData as any)[f.name]}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                          />
                        </div>
                        {(validationErrors as any)[f.name] && (
                          <p className="text-rose-500 text-xs mt-1 ml-1">{((validationErrors as any)[f.name])}</p>
                        )}
                      </div>
                    );
                  })}

                  <div className="md:col-span-2">
                    <div className="relative">
                      <FiMapPin className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                      <textarea
                        name="address"
                        rows={2}
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500 resize-none"
                        placeholder="Address"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* LOAN DETAILS */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-gray-800 pb-2">
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
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                        placeholder="0.00"
                      />
                    </div>
                    {validationErrors.borrowedAmount && <p className="text-rose-500 text-xs mt-1 ml-1">{validationErrors.borrowedAmount}</p>}
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
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    {validationErrors.interestRate && <p className="text-rose-500 text-xs mt-1 ml-1">{validationErrors.interestRate}</p>}
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
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block ml-1">{t("returnDate")}</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                      <input 
                        type="date" 
                        name="returnDate" 
                        value={formData.returnDate} 
                        onChange={handleChange} 
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500" 
                      />
                    </div>
                  </div>
                </div>

                {/* Interactive Interest Slider */}
                <div className="pt-2">
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
                    onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
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

              {/* REMINDER SETTINGS */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-gray-800 pb-2">
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

                {formData.enableReminder && (
                  <div className="pl-4 border-l-2 border-violet-200 dark:border-violet-800 ml-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1.5 block">{t("reminderDay")}</label>
                    <input
                      name="reminderDay"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.reminderDay}
                      onChange={handleChange}
                      className="w-full max-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    {validationErrors.reminderDay && <p className="text-rose-500 text-xs mt-1">{validationErrors.reminderDay}</p>}
                  </div>
                )}
              </section>

            </div>

            {/* RIGHT COLUMN: LIVE PREVIEW (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/40 dark:to-gray-900 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <FiCheckCircle className="w-4 h-4 text-indigo-500" /> Live Preview
                </h3>

                {calculatedInterest ? (
                  <>
                    {/* Donut Chart */}
                    <div className="flex justify-center mb-6 relative">
                      <svg viewBox="0 0 36 36" className="w-36 h-36 transform -rotate-90">
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
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total</span>
                        <span className="text-lg font-bold text-slate-800 dark:text-white">
                          {currencySymbol}{calculatedInterest.totalAmount.toFixed(0)}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-gray-400 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Principal
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-white">{currencySymbol}{borrowedAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-gray-400 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Interest
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-white">{currencySymbol}{calculatedInterest.interestAmount.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-gray-700 pt-3 flex justify-between items-center">
                        <span className="font-bold text-slate-800 dark:text-white">Total Payable</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                          {currencySymbol}{calculatedInterest.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiAlertCircle className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-medium px-4">
                      Fill in the amount, interest rate, and return date to see the live preview.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-5 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 flex gap-4">
          <button 
            type="button" 
            onClick={() => navigate(`/user/${id}`)} 
            className="flex-1 py-3 px-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>

          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              t("updateUser")
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditUser;