import React from "react";
import { Link } from "react-router-dom";
import { FiUser, FiCalendar } from "react-icons/fi";
import { User } from "../types";
import { helperService } from "../services/HelperService";

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const remainingAmount = helperService.calculateUserRemainingAmount(user);
  const CurrencyIcon = helperService.getCurrencyIcon();
  const currencySymbol = helperService.getCurrencySymbol();

  const isPaid = remainingAmount <= 0;

  return (
    <Link
      to={`/user/${user._id || user.id}`}
      className="block group"
    >
      <div className="
        relative overflow-hidden
        backdrop-blur-xl bg-white/70 dark:bg-gray-900/60
        border border-white/40 dark:border-gray-700
        rounded-2xl p-5
        shadow-lg hover:shadow-2xl
        transition-all duration-300
        hover:-translate-y-1
      ">

        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

        {/* Top Section */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="
              p-3 rounded-full
              bg-gradient-to-r from-indigo-500 to-purple-500
              text-white shadow-md
            ">
              <FiUser className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {user.name}
              </h3>
              {user.phone && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.phone}
                </p>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {currencySymbol}
              {user.borrowedAmount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              + {currencySymbol}
              {helperService
                .calculateUserInterest(user)
                .toLocaleString()}{" "}
              interest
            </p>
          </div>
        </div>

        {/* Middle Section */}
        <div className="mt-4 grid grid-cols-2 gap-4 relative z-10">

          {/* Remaining */}
          <div className="
            rounded-xl p-3
            bg-gradient-to-br from-purple-50 to-purple-100
            dark:from-purple-900/30 dark:to-purple-800/20
            border border-purple-100 dark:border-purple-800
          ">
            <p className="text-xs text-purple-600 dark:text-purple-300">
              Remaining
            </p>
            <p className="font-semibold text-purple-800 dark:text-purple-200">
              {currencySymbol}
              {remainingAmount.toLocaleString()}
            </p>
          </div>

          {/* Interest */}
          <div className="
            rounded-xl p-3
            bg-gradient-to-br from-green-50 to-green-100
            dark:from-green-900/30 dark:to-green-800/20
            border border-green-100 dark:border-green-800
          ">
            <p className="text-xs text-green-600 dark:text-green-300">
              Interest
            </p>
            <p className="font-semibold text-green-800 dark:text-green-200">
              {user.interestRate}% (
              {helperService.getFrequencyDisplayText(
                user.interestFrequency || "monthly"
              )}
              )
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 relative z-10">
          {user.startDate && (
            <div className="flex items-center gap-1">
              <FiCalendar />
              <span>
                Start: {new Date(user.startDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {user.returnDate && (
            <div className="flex items-center gap-1">
              <FiCalendar />
              <span>
                Due: {new Date(user.returnDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="mt-4 flex justify-between items-center relative z-10">

          {isPaid ? (
            <span className="
              px-3 py-1 text-xs rounded-full
              bg-green-100 text-green-700
              dark:bg-green-900/40 dark:text-green-300
              font-medium
            ">
              ✔ Fully Paid
            </span>
          ) : (
            <span className="
              px-3 py-1 text-xs rounded-full
              bg-yellow-100 text-yellow-700
              dark:bg-yellow-900/40 dark:text-yellow-300
              font-medium
            ">
              ⏳ Pending
            </span>
          )}

          <div className="
            flex items-center text-xs
            text-gray-400 group-hover:text-indigo-500
            transition
          ">
            <CurrencyIcon className="mr-1" />
            View Details →
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UserCard;