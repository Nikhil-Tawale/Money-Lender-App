import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import {
  FiArrowLeft,
  FiBell
} from 'react-icons/fi';
import { dataService } from '../services/DataServiceFactory';
import { helperService } from '../services/HelperService';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  useTheme();
  const [loading, setLoading] = useState(false);
  const [_calculationError, _setCalculationError] = useState('');

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

      toast.success('User added!');
      navigate('/');
    } catch {
      toast.error('Error adding user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-blue-100 to-purple-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">

      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow hover:scale-110 transition dark:text-white"
        >
          <FiArrowLeft />
        </button>

        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
          ➕ Add Borrower
        </h1>
      </div>

      {/* Form */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-2xl bg-white/60 dark:bg-gray-800/60 p-6 md:p-10 rounded-3xl shadow-2xl border border-white/40 dark:border-gray-700/40 space-y-8"
        >

          {/* Basic Info */}
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl p-5 shadow-inner">
            <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">👤 Basic Info</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {['name', 'phone', 'email', 'address'].map((field) => (
                <input
                  key={field}
                  name={field}
                  value={(formData as any)[field]}
                  onChange={handleChange}
                  placeholder={field === 'name' ? 'Full Name *' : field}
                  className="input-field p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 transition dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              ))}
            </div>
          </div>

          {/* Loan Details */}
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl p-5 shadow-inner">
            <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">💰 Loan Details</h2>

            <div className="grid md:grid-cols-2 gap-4">

              <input
                name="borrowedAmount"
                value={formData.borrowedAmount}
                onChange={handleChange}
                placeholder={`Amount (${currencySymbol})`}
                className="input-field p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />

              <input
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                placeholder="Interest %"
                className="input-field p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />

              <select
                name="interestFrequency"
                value={formData.interestFrequency}
                onChange={handleChange}
                className="input-field p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input-field p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />

              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                className="input-field p-3 rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>

          {/* Interest Preview */}
          {calculatedInterest && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 border dark:border-gray-700 shadow-md animate-fadeIn">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">📊 Interest Preview</h3>

              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Interest</span>
                <span className="font-semibold">
                  {currencySymbol}{calculatedInterest.interestAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between font-bold text-lg mt-2 border-t pt-2">
                <span>Total</span>
                <span>
                  {currencySymbol}{calculatedInterest.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Reminder Toggle */}
          <div className="flex items-center justify-between bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl shadow-inner">
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
              <FiBell /> Enable Reminder
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

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-3 rounded-xl border hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition shadow-lg"
            >
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddUser;