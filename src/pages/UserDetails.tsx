import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  FiArrowLeft,
  FiUser,
  FiPlus,
  FiBell,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiPercent,
  FiAlertTriangle,
} from "react-icons/fi";
import { User } from "../types";
import { dataService } from "../services/DataServiceFactory";
import { helperService } from "../services/HelperService";

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useTheme();
  const { t } = useLanguage();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUserDetails();
  }, [id]);

  const loadUserDetails = async () => {
    if (!id) return;
    try {
      const borrower = await dataService.getUser(id);
      if (!borrower) {
        toast.error("User not found");
        navigate("/");
        return;
      }

      borrower["payments"] =
        borrower["payments"]?.sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        ) || [];

      setUser(borrower);
    } catch {
      toast.error("Failed to load user");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const calculateRemainingAmount = () => {
    if (!user) return 0;
    return helperService.calculateUserRemainingAmount(user);
  };

  const currencySymbol = helperService.getCurrencySymbol();

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);

    if (!amount || amount <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    if (amount > calculateRemainingAmount()) {
      toast.error("Exceeds remaining amount");
      return;
    }

    setSubmitting(true);
    try {
      await dataService.addPayment(id!, {
        amount,
        note: paymentNote,
        date: new Date().toISOString(),
      });

      toast.success("Payment added");
      setShowPaymentModal(false);
      setPaymentAmount("");
      setPaymentNote("");
      loadUserDetails();
    } catch {
      toast.error("Failed to add payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await dataService.deleteUser(id!);
      window.dispatchEvent(new Event("users-updated"));
      toast.success("User deleted");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
      setDeleting(false);
    }
  };

  const closePaymentModal = () => {
    if (submitting) return;
    setShowPaymentModal(false);
  };

  if (loading)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-gray-950 text-slate-500 dark:text-gray-400 font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          Loading user details...
        </div>
      </div>
    );

  if (!user) return null;

  const remaining = calculateRemainingAmount();
  const totalPayable = user.borrowedAmount + (user.borrowedAmount * user.interestRate) / 100;
  const paidAmount = totalPayable - remaining;
  const progressPercentage = Math.min(100, Math.max(0, (paidAmount / totalPayable) * 100));

  const riskLevel =
    remaining > 50000 ? "HIGH" :
    remaining > 20000 ? "MEDIUM" : "LOW";

  const riskColor =
    remaining > 50000
      ? "from-rose-500 to-red-600"
      : remaining > 20000
      ? "from-amber-500 to-orange-500"
      : "from-emerald-500 to-teal-600";

  // SVG Progress Ring Calculation
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 dark:bg-gray-950 px-4 py-6 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER ACTIONS */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            aria-label="Back to dashboard"
            className="group flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 active:scale-[0.98] sm:hover:scale-105 hover:shadow-md transition-all"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/edit-user/${id}`)}
              aria-label="Edit user"
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 active:scale-[0.98] sm:hover:scale-105 transition-all"
            >
              <FiEdit className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              aria-label="Delete user"
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 active:scale-[0.98] sm:hover:scale-105 transition-all"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HERO CARD */}
        <div className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl text-white shadow-xl bg-gradient-to-br ${riskColor}`}>
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-inner">
                <FiUser className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{user.name}</h2>
                <p className="text-white/80 font-medium mt-1">{user.phone}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 text-xs font-semibold tracking-wide uppercase">
                  <span className={`w-2 h-2 rounded-full ${riskLevel === 'LOW' ? 'bg-emerald-300' : riskLevel === 'MEDIUM' ? 'bg-amber-300' : 'bg-rose-300'} animate-pulse`}></span>
                  {t("risk")}: {riskLevel === "LOW" ? t("riskLow") : riskLevel === "MEDIUM" ? t("riskMedium") : t("riskHigh")}
                </div>
              </div>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative flex items-center justify-center self-center sm:self-auto">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r={radius} stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="48" cy="48" r={radius} stroke="white" strokeWidth="8" fill="transparent"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold">{Math.round(progressPercentage)}%</span>
                <span className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">{t("paid")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 mb-3">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <FiTrendingUp className="w-4 h-4" />
              </div>
                <span className="text-sm font-medium">{t("borrowed")}</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {currencySymbol}{user.borrowedAmount.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 mb-3">
              <div className="p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <FiPercent className="w-4 h-4" />
              </div>
                <span className="text-sm font-medium">{t("interest")}</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {user.interestRate}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"></div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-3 relative z-10">
              <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <FiClock className="w-4 h-4" />
              </div>
                <span className="text-sm font-medium">{t("remaining")}</span>
            </div>
            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-300 relative z-10">
              {currencySymbol}{remaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* PAYMENTS TIMELINE */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-slate-100 dark:border-gray-800 p-6 sm:p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t("paymentHistory")}</h3>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 active:scale-[0.98] sm:hover:scale-105 transition-all"
            >
              <FiPlus className="w-4 h-4" /> {t("addPayment")}
            </button>
          </div>

          {user.payments?.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiClock className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-gray-400 font-medium">{t("noPayments")}</p>
              <p className="text-sm text-slate-400 dark:text-gray-500 mt-1">{t("noPaymentsDesc")}</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 dark:border-gray-800 ml-3 space-y-8 pb-2">
              {user['payments']?.map((p, i) => (
                <div key={i} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[11px] top-1 bg-white dark:bg-gray-900 p-1 rounded-full">
                    <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  
                  {/* Payment Card */}
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-slate-100 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all">
                    <div>
                      <p className="font-bold text-lg text-slate-800 dark:text-white">
                        {currencySymbol}{p.amount.toLocaleString()}
                      </p>
                      {p.note && (
                        <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">{p.note}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-400 dark:text-gray-500 bg-white dark:bg-gray-900 px-2.5 py-1 rounded-md border border-slate-100 dark:border-gray-700">
                        {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pending Payment Indicator */}
              {remaining > 0 && (
                <div className="relative pl-8">
                  <div className="absolute -left-[11px] top-1 bg-white dark:bg-gray-900 p-1 rounded-full">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-gray-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-gray-600"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-900 rounded-2xl p-4 border border-dashed border-slate-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-slate-400 dark:text-gray-500">Next payment pending</p>
                    <span className="text-xs text-slate-400 dark:text-gray-500">—</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* REMINDER BANNER */}
        {user.enableReminder && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 shadow-sm backdrop-blur-sm">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
              <FiBell className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-bounce" />
            </div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {t("reminderSetForDay").replace("{day}", String(user.reminderDay))}
            </p>
          </div>
        )}

      </div>

      {/* ADD PAYMENT MODAL */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-payment-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePaymentModal();
          }}
        >
          <form
            onSubmit={handleAddPayment}
            className="w-full max-w-lg bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-gray-800 transform transition-all scale-100"
          >
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    closePaymentModal();
                  }}
                  aria-label="Close payment form"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 transition"
                >
                  <FiArrowLeft className="h-5 w-5" />
                </button>
                <h2 id="add-payment-title" className="text-xl font-bold text-slate-800 dark:text-white">{t("addPayment")}</h2>
              </div>
            </div>

            <label className="block mb-5">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-gray-300">{t("paymentAmount")}</span>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400 font-medium">{currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </label>

            <label className="block mb-8">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-gray-300">{t("paymentNote")}</span>
              <textarea
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500"
                placeholder={t("addPaymentNote")}
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </label>

            <button disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? t("processing") : t("confirmPayment")}
            </button>

          </form>
        </div>
      )}

      {/* DELETE USER MODAL */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-user-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div className="w-full max-w-sm rounded-3xl border border-rose-100 bg-white p-6 text-center shadow-2xl dark:border-rose-900 dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
              <FiAlertTriangle className="h-7 w-7" />
            </div>
            <h2 id="delete-user-title" className="text-xl font-bold text-slate-900 dark:text-white">{t("deleteBorrower")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-gray-400">
              {t("deleteUserDescription")} <span className="font-semibold text-slate-700 dark:text-gray-200">{user.name}</span>
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteUser}
                className="rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? t("deleting") : t("deleteUser")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDetails;