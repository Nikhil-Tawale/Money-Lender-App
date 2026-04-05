import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { User } from '../types';
import { helperService } from '../services/HelperService';

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const remainingAmount = helperService.calculateUserRemainingAmount(user);
  const CurrencyIcon = helperService.getCurrencyIcon();
  const currencySymbol = helperService.getCurrencySymbol();
  
  return (
    <Link to={`/user/${user._id || user.id}`} className="block hover:bg-gray-50 transition-colors">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <FiUser className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{currencySymbol}{user.borrowedAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-500">+ {currencySymbol}{helperService.calculateUserInterest(user).toLocaleString()} interest ({helperService.getFrequencyDisplayText(user.interestFrequency || 'monthly')})</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <CurrencyIcon className="mr-1" />
            <span>Remaining: {currencySymbol}{remainingAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-4">
            {user.startDate && (
              <div className="flex items-center text-gray-500">
                <FiCalendar className="mr-1" />
                <span>Start: {new Date(user.startDate).toLocaleDateString()}</span>
              </div>
            )}
            {user.returnDate && (
              <div className="flex items-center text-gray-500">
                <FiCalendar className="mr-1" />
                <span>Due: {new Date(user.returnDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        
        {remainingAmount <= 0 && (
          <div className="mt-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Fully Paid
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default UserCard;