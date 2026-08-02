import React, { useState } from 'react';
import { FiCalendar, FiMessageSquare, FiChevronDown } from 'react-icons/fi';
import { Payment } from '../types';
import { helperService } from '../services/HelperService';

interface LoanCardProps {
  payment: Payment;
}

const LoanCard: React.FC<LoanCardProps> = ({ payment }) => {
  const [expanded, setExpanded] = useState(false);

  const CurrencyIcon = helperService.getCurrencyIcon();
  const currencySymbol = helperService.getCurrencySymbol();

  const isCredit = true; // future dynamic

  return (
    <div className="relative flex gap-4 group">

      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full ${isCredit ? "bg-green-500" : "bg-red-500"}`} />
        <div className="flex-1 w-px bg-gray-200 dark:bg-gray-700 mt-1" />
      </div>

      {/* Card */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="
          flex-1 cursor-pointer
          backdrop-blur-xl bg-white/70 dark:bg-gray-900/60
          border border-white/40 dark:border-gray-700
          rounded-2xl p-5 mb-4
          shadow-md hover:shadow-xl
          transition-all duration-300
          hover:-translate-y-1 active:scale-[0.98]
        "
      >

        {/* Top */}
        <div className="flex justify-between items-start">

          <div className="flex items-start gap-4">

            <div className={`
              p-3 rounded-full text-white
              ${isCredit
                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                : "bg-gradient-to-br from-red-500 to-pink-600"}
            `}>
              <CurrencyIcon className="h-5 w-5" />
            </div>

            <div>

              <h2 className={`
                text-xl font-bold
                ${isCredit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
              `}>
                {isCredit ? "+" : "-"} {currencySymbol}
                {payment.amount.toLocaleString()}
              </h2>

              {payment.note && (
                <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400 text-sm">
                  <FiMessageSquare className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-[200px]">
                    {payment.note}
                  </span>
                </div>
              )}

              <span className={`
                mt-2 inline-block text-xs px-2 py-1 rounded-full
                ${isCredit
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}
              `}>
                {isCredit ? "Received" : "Paid"}
              </span>
            </div>
          </div>

          {/* Date + Expand Icon */}
          <div className="flex flex-col items-end text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <FiCalendar className="h-3 w-3" />
              {new Date(payment.date).toLocaleDateString()}
            </div>

            <FiChevronDown
              className={`mt-2 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Expand Section */}
        <div
          className={`
            overflow-hidden transition-all duration-300
            ${expanded ? "max-h-40 mt-4" : "max-h-0"}
          `}
        >
          <div className="border-t pt-3 text-sm text-gray-600 dark:text-gray-300 space-y-2">

            <div className="flex justify-between">
              <span>Transaction ID</span>
              <span className="font-mono">
                #{payment._id?.slice(-6) || "000000"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Status</span>
              <span className="text-green-500 font-medium">
                Completed
              </span>
            </div>

            {payment.note && (
              <div>
                <span className="text-xs text-gray-400">Note:</span>
                <p className="text-sm mt-1">{payment.note}</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default LoanCard;