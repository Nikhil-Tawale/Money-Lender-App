import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";
import {
  FiArrowLeft,
  FiUser,
  FiPlus,
  FiBell,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { User } from "../types";
import { dataService } from "../services/DataServiceFactory";
import { helperService } from "../services/HelperService";

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    if (!window.confirm("Delete this user?")) return;
    await dataService.deleteUser(id!);
    toast.success("Deleted");
    navigate("/");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading user...
      </div>
    );

  if (!user) return null;

  const remaining = calculateRemainingAmount();

  const riskLevel =
    remaining > 50000 ? "HIGH" :
    remaining > 20000 ? "MEDIUM" : "LOW";

  const riskColor =
    remaining > 50000
      ? "from-red-600 to-pink-600"
      : remaining > 20000
      ? "from-orange-500 to-yellow-500"
      : "from-green-500 to-emerald-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-6 transition-colors duration-300">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow hover:scale-105 transition dark:text-white"
          >
            <FiArrowLeft />
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/edit-user/${id}`)}
              className="p-3 rounded-xl bg-blue-500 text-white shadow hover:scale-105 transition"
            >
              <FiEdit />
            </button>

            <button
              onClick={handleDeleteUser}
              className="p-3 rounded-xl bg-red-500 text-white shadow hover:scale-105 transition"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>

        {/* HERO CARD */}
        <div className={`relative overflow-hidden p-8 rounded-3xl text-white shadow-2xl bg-gradient-to-r ${riskColor}`}>

          <div className="absolute w-72 h-72 bg-white/10 blur-3xl rounded-full -top-20 -right-20"></div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="p-4 bg-white/20 rounded-2xl">
              <FiUser size={28} />
            </div>

            <div>
              <h2 className="text-3xl font-bold">{user.name}</h2>
              <p className="text-sm opacity-80">{user.phone}</p>

              <div className="mt-2 inline-block px-3 py-1 text-xs bg-white/20 rounded-full">
                Risk: {riskLevel}
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">

          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Borrowed</p>
            <p className="text-2xl font-bold dark:text-white">
              {currencySymbol}{user.borrowedAmount}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Interest</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {user.interestRate}%
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition border-l-4 border-purple-500">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Remaining</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {currencySymbol}{remaining}
            </p>
          </div>

        </div>

        {/* PAYMENTS */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl">

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold dark:text-white">Payments</h3>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition"
            >
              <FiPlus /> Add Payment
            </button>
          </div>

          {user.payments?.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-gray-500 py-6">
              No payments yet
            </p>
          ) : (
            <div className="space-y-3">

              {user['payments']?.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:shadow transition"
                >
                  <div>
                    <p className="font-semibold dark:text-white">
                      {currencySymbol}{p.amount}
                    </p>
                    {p.note && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{p.note}</p>
                    )}
                  </div>

                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(p.date).toLocaleDateString()}
                  </span>
                </div>
              ))}

            </div>
          )}
        </div>

        {/* REMINDER */}
        {user.enableReminder && (
          <div className="mt-6 p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 flex items-center gap-3">
            <FiBell className="text-yellow-600 dark:text-yellow-500" />
            <span className="text-sm dark:text-yellow-200">
              Reminder on day <b>{user.reminderDay}</b>
            </span>
          </div>
        )}

      </div>

      {/* MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          
          <form
            onSubmit={handleAddPayment}
            className="w-96 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl"
          >
            <div className="mb-6 flex items-center">
              <button type="button" onClick={() => setShowPaymentModal(false)} className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <FiArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Payment</h2>
            </div>

            <input
              type="number"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-3 dark:bg-gray-700 dark:text-white"
              placeholder="Amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />

            <textarea
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-3 dark:bg-gray-700 dark:text-white"
              placeholder="Note"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
            />

            <button className="w-full bg-indigo-600 dark:bg-indigo-500 text-white p-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition">
              {submitting ? "Adding..." : "Add Payment"}
            </button>

          </form>

        </div>
      )}

    </div>
  );
};

export default UserDetails;