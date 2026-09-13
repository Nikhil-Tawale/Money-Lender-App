import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
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
} from 'react-icons/fi';
import { dataService } from '../services/DataServiceFactory';
import { helperService } from '../services/HelperService';

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  useTheme();
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
      await dataService.updateUser(id!, {
        ...formData,
        borrowedAmount,
        interestRate,
        reminderDay,
        startDate: new Date(formData.startDate).toISOString(),
        returnDate: formData.returnDate ? new Date(formData.returnDate).toISOString() : undefined,
      });

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-gray-950 dark:to-gray-900">
        <div className="animate-spin h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="edit-user-page fixed inset-0 z-40 flex items-start sm:items-center justify-center bg-black/45 p-2 sm:p-6 backdrop-blur-sm">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-3xl max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-3rem)] overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-3 sm:p-4 md:p-6 space-y-4 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">User management</p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Edit Borrower</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/user/${id}`)}
            aria-label="Close edit form"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition"
          >
            <FiX />
          </button>
        </div>

        {calculationError && (
          <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
            <FiAlertCircle />
            {calculationError}
          </div>
        )}

        {/* BASIC INFO */}
        <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl shadow-inner space-y-3">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">👤 Basic Info</h2>

          <div className="grid md:grid-cols-2 gap-3">
          {[
            { name: 'name', icon: FiUser, placeholder: 'Name' },
            { name: 'phone', icon: FiPhone, placeholder: 'Phone' },
            { name: 'email', icon: FiMail, placeholder: 'Email' }
          ].map(f => {
            const Icon = f.icon;
            return (
              <div key={f.name} className="relative">
                <Icon className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                <input
                  name={f.name}
                  value={(formData as any)[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full pl-10 p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-400 transition"
                />
                {(validationErrors as any)[f.name] && (
                  <p className="text-red-500 dark:text-red-400 text-xs">{(validationErrors as any)[f.name]}</p>
                )}
              </div>
            );
          })}
          </div>

          <div className="relative">
            <FiMapPin className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full pl-10 p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-400 transition"
              placeholder="Address"
            />
          </div>
        </div>

        {/* LOAN */}
        <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl shadow-inner space-y-3">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">💰 Loan Details</h2>

          <div className="grid md:grid-cols-2 gap-3">

            <div className="relative">
              <CurrencyIcon className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
              <input
                name="borrowedAmount"
                value={formData.borrowedAmount}
                onChange={handleChange}
                className="w-full pl-10 p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-400 transition"
                placeholder="Amount"
              />
            </div>

            <div className="relative">
              <FiPercent className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
              <input
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                className="w-full pl-10 p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-400 transition"
                placeholder="Interest"
              />
            </div>

            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-400 transition" />
            <input type="date" name="returnDate" value={formData.returnDate} onChange={handleChange} className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-400 transition" />
          </div>
        </div>

        {/* INTEREST */}
        {calculatedInterest && (
          <div className="p-5 bg-green-50 dark:bg-green-900/30 rounded-2xl border border-green-200 dark:border-green-800">
            <h3 className="font-semibold mb-2 dark:text-green-100">📊 Preview</h3>
            <p className="dark:text-green-200">Interest: {currencySymbol}{calculatedInterest.interestAmount.toFixed(2)}</p>
            <p className="font-bold dark:text-green-100">Total: {currencySymbol}{calculatedInterest.totalAmount.toFixed(2)}</p>
          </div>
        )}

        {/* REMINDER */}
        <div className="flex justify-between items-center bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl">
          <span className="flex items-center gap-2 dark:text-gray-200">
            <FiBell /> Reminder
          </span>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="enableReminder"
              checked={formData.enableReminder}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500 transition"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-gray-300 rounded-full transition peer-checked:translate-x-5"></div>
          </label>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(`/user/${id}`)} className="flex-1 p-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Cancel
          </button>

          <button type="submit" disabled={loading} className="flex-1 p-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:opacity-50">
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditUser;