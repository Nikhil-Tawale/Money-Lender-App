import React from 'react';
import { FiCalendar, FiMessageSquare } from 'react-icons/fi';
import { Payment } from '../types';
import { helperService } from '../services/HelperService';

interface LoanCardProps {
  payment: Payment;
}

const LoanCard: React.FC<LoanCardProps> = ({ payment }) => {
  const CurrencyIcon = helperService.getCurrencyIcon();
  const currencySymbol = helperService.getCurrencySymbol();

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-green-100 rounded-full">
            <CurrencyIcon className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">
              {currencySymbol}{payment.amount.toLocaleString()}
            </p>
            {payment.note && (
              <div className="flex items-center mt-1 text-gray-500">
                <FiMessageSquare className="h-3 w-3 mr-1" />
                <p className="text-sm">{payment.note}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <FiCalendar className="h-3 w-3 mr-1" />
          <span>{new Date(payment.date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default LoanCard;