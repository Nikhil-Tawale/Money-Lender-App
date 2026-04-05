import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUser, FiPhone, FiMail, FiMapPin , FiPercent, FiCalendar, FiBell, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { dataService } from '../services/DataServiceFactory';
import { helperService } from '../services/HelperService';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    borrowedAmount: '',
    interestRate: '',
    reminderDay: '',
  });
  const CurrencyIcon = helperService.getCurrencyIcon();
  const currencySymbol = helperService.getCurrencySymbol();
  const [dateError, setDateError] = useState('');
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

  // Calculate interest based on return date and frequency
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

      if (isNaN(returnDate.getTime())) {
        setCalculationError('Invalid return date');
        return null;
      }

      if (returnDate <= startDate) {
        setCalculationError('Return date must be in the future');
        return null;
      }

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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error calculating interest';
      setCalculationError(message);
      console.error('Calculation error:', message);
      return null;
    }
  }, [formData.borrowedAmount, formData.interestRate, formData.returnDate, formData.interestFrequency]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'returnDate') {
      setDateError('');
      setFormData({ ...formData, [name]: value });
    } else if (name === 'startDate') {
      setDateError('');
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const getSuggestedDate = () => {
    try {
      const startDate = new Date(formData.startDate);
      const suggested = helperService.getSuggestedReturnDate(startDate, formData.interestFrequency);
      return suggested.toISOString().split('T')[0];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error getting suggested date';
      toast.error(message);
      return new Date().toISOString().split('T')[0];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Comprehensive validation
    let errors = { ...validationErrors };
    let hasErrors = false;

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Please enter a valid name';
      hasErrors = true;
    } else {
      errors.name = '';
    }

    // Borrowed Amount validation
    const borrowedAmount = parseFloat(formData.borrowedAmount);
    if (isNaN(borrowedAmount) || borrowedAmount <= 0) {
      errors.borrowedAmount = 'Please enter a valid borrowed amount (greater than 0)';
      hasErrors = true;
    } else {
      errors.borrowedAmount = '';
    }

    // Interest Rate validation
    const interestRate = parseFloat(formData.interestRate);
    if (isNaN(interestRate) || interestRate < 0) {
      errors.interestRate = 'Please enter a valid interest rate (non-negative)';
      hasErrors = true;
    } else {
      errors.interestRate = '';
    }

    // Reminder Day validation
    if (formData.enableReminder) {
      const reminderDay = parseInt(formData.reminderDay);
      if (isNaN(reminderDay) || reminderDay < 1 || reminderDay > 31) {
        errors.reminderDay = 'Please enter a valid reminder day (1-31)';
        hasErrors = true;
      } else {
        errors.reminderDay = '';
      }
    }

    setValidationErrors(errors);

    if (hasErrors) {
      toast.error('Please fix the validation errors');
      return;
    }

    // Validate date for weekly/monthly frequency
    if (formData.returnDate && (formData.interestFrequency === 'weekly' || formData.interestFrequency === 'monthly')) {
      if (dateError) {
        toast.error(dateError);
        return;
      }

      try {
        const startDate = new Date(formData.startDate);
        const selectedDate = new Date(formData.returnDate);
        
        if (isNaN(selectedDate.getTime())) {
          toast.error('Invalid return date format');
          return;
        }

        if (selectedDate <= startDate) {
          toast.error('Return date must be after start date');
          return;
        }

        // if (!helperService.isValidReturnDate(startDate, selectedDate, formData.interestFrequency)) {
        //   const errorMsg = formData.interestFrequency === 'weekly' 
        //     ? 'For weekly interest, return date must be exactly 1, 2, 3, 4+ weeks from start date (same day of the week)'
        //     : 'For monthly interest, return date must be on the same date in future months';
        //   toast.error(errorMsg);
        //   return;
        // }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error validating return date');
        return;
      }
    }

    setLoading(true);
    try {
      await dataService.addUser({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        borrowedAmount: borrowedAmount,
        interestRate: interestRate,
        interestFrequency: formData.interestFrequency,
        startDate: new Date(formData.startDate).toISOString(),
        returnDate: formData.returnDate ? new Date(formData.returnDate).toISOString() : undefined,
        reminderDay: parseInt(formData.reminderDay),
        enableReminder: formData.enableReminder
      });
      
      toast.success('User added successfully!');
      navigate('/');
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(error.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center">
          <button onClick={() => navigate('/')} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Add New Borrower</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {/* Global Error Alert */}
            {calculationError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-red-700">{calculationError}</div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field pl-10 ${validationErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter full name"
                  required
                />
              </div>
              {validationErrors.name && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="input-field pl-10 resize-none"
                  placeholder="Enter address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Borrowed Amount ({currencySymbol}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CurrencyIcon className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  name="borrowedAmount"
                  value={formData.borrowedAmount}
                  onChange={handleChange}
                  className={`input-field pl-10 ${validationErrors.borrowedAmount ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter borrowed amount"
                  required
                />
              </div>
              {validationErrors.borrowedAmount && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.borrowedAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (%) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiPercent className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleChange}
                  className={`input-field pl-10 ${validationErrors.interestRate ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter interest rate"
                  step="0.01"
                  required
                />
              </div>
              {validationErrors.interestRate && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.interestRate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Frequency <span className="text-red-500">*</span>
              </label>
              <select
                name="interestFrequency"
                value={formData.interestFrequency}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              
              {formData.interestFrequency === 'weekly' && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md flex gap-2">
                  <FiInfo className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    <strong>Weekly Interest:</strong> Return date must be exactly 1, 2, 3, 4+ weeks from today (same day of the week).
                  </p>
                </div>
              )}

              {formData.interestFrequency === 'monthly' && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md flex gap-2">
                  <FiInfo className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    <strong>Monthly Interest:</strong> Return date must be on the same date in future months (adjusted automatically for February).
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleChange}
                  className={`input-field pl-10 ${dateError ? 'border-red-500 bg-red-50' : ''}`}
                />
              </div>
              
              {dateError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md flex gap-2">
                  <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{dateError}</p>
                </div>
              )}

              {!dateError && formData.returnDate && (
                <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  ✓ Valid return date for {helperService.getFrequencyDisplayText(formData.interestFrequency)} interest
                </p>
              )}

              <button
                type="button"
                onClick={() => setFormData({ ...formData, returnDate: getSuggestedDate() })}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Use suggested date ({new Date(getSuggestedDate()).toLocaleDateString()})
              </button>
            </div>

            {calculatedInterest && formData.returnDate && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Interest Calculation Preview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Borrowed Amount:</span>
                    <span className="font-medium">{currencySymbol}{parseFloat(formData.borrowedAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {formData.interestFrequency === 'weekly' ? 'Weeks' : formData.interestFrequency === 'monthly' ? 'Months' : formData.interestFrequency === 'daily' ? 'Days' : 'Years'}:
                    </span>
                    <span className="font-medium">{calculatedInterest.periods}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Rate (per {helperService.getFrequencyDisplayText(formData.interestFrequency).toLowerCase()}):</span>
                    <span className="font-medium">{parseFloat(formData.interestRate)}%</span>
                  </div>
                  <div className="border-t border-green-200 my-2 pt-2 flex justify-between font-semibold text-green-700">
                    <span>Total Interest ({calculatedInterest.periods}x):</span>
                    <span>{currencySymbol}{calculatedInterest.interestAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-blue-700">
                    <span>Total Amount to Return:</span>
                    <span>{currencySymbol}{calculatedInterest.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center">
                  <FiBell className="mr-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Enable Monthly Reminder</span>
                </label>
                <input
                  type="checkbox"
                  name="enableReminder"
                  checked={formData.enableReminder}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {formData.enableReminder && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Day of Month (1-31) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="reminderDay"
                    value={formData.reminderDay}
                    onChange={handleChange}
                    min="1"
                    max="31"
                    className={`input-field ${validationErrors.reminderDay ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter day for reminder"
                  />
                  {validationErrors.reminderDay && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.reminderDay}</p>
                  )}
                  {!validationErrors.reminderDay && (
                    <p className="mt-1 text-xs text-gray-500">
                      You'll receive a reminder on this day every month
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={() => navigate('/')} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;