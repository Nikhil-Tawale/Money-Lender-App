import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiUser,
  FiPercent,
  FiPlus,
  FiClock,
  FiCalendar,
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
      borrower['payments'] = borrower['payments']?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
      setUser(borrower);
    } catch (err) {
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

  const CurrencyIcon = helperService.getCurrencyIcon();
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
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await dataService.deleteUser(id!);
      toast.success("User deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  // ✅ Edit Navigation (FIXED)
  const handleEditUser = () => {
    navigate(`/edit-user/${id}`);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between mb-6">
          <div className="flex items-center">
            <button onClick={() => navigate("/")} className="mr-3">
              <FiArrowLeft />
            </button>
            <h1 className="text-2xl font-bold">User Details</h1>
          </div>

          {/* Edit + Delete */}
          <div className="flex gap-3">
            <button
              onClick={handleEditUser}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              <FiEdit /> Edit
            </button>

            <button
              onClick={handleDeleteUser}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-white p-6 rounded-xl shadow mb-6 flex items-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <FiUser className="text-blue-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-gray-500">{user.phone}</p>
          </div>
        </div>

        {/* 🔥 UPDATED MIDDLE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Loan Start Date */}
          {user.startDate && (
            <div className="rounded-2xl p-5 bg-orange-50 border border-orange-100">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-orange-600">Loan Start Date</p>
                  <p className="text-2xl font-bold">
                    {new Date(user.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <FiCalendar />
                </div>
              </div>
            </div>
          )}

          {/* Borrowed */}
          <div className="rounded-2xl p-5 bg-blue-50 border border-blue-100">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-blue-600">Borrowed</p>
                <p className="text-2xl font-bold">
                  {currencySymbol}
                  {user.borrowedAmount}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CurrencyIcon />
              </div>
            </div>
          </div>

          {/* Interest */}
          <div className="rounded-2xl p-5 bg-green-50 border border-green-100">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-green-600">Interest</p>
                <p className="text-2xl font-bold">{user.interestRate}%</p>
                <p className="text-xs text-gray-500">
                  {helperService.getFrequencyDisplayText(
                    user.interestFrequency || "monthly",
                  )}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiPercent />
              </div>
            </div>
          </div>

          {/* Remaining */}
          <div className="rounded-2xl p-5 bg-purple-50 border border-purple-100">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-purple-600">Remaining</p>
                <p className="text-2xl font-bold">
                  {currencySymbol}
                  {calculateRemainingAmount()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FiClock />
              </div>
            </div>
          </div>

          {/* Return Date */}
          {user.returnDate && (
            <div className="rounded-2xl p-5 bg-orange-50 border border-orange-100">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-orange-600">Return Date</p>
                  <p className="text-2xl font-bold">
                    {new Date(user.returnDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(() => {
                      const today = new Date();
                      const d = new Date(user.returnDate);
                      const diff = Math.ceil(
                        (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                      );
                      return diff >= 0
                        ? `${diff} days left`
                        : `${Math.abs(diff)} overdue`;
                    })()}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <FiCalendar />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payments */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Payment History</h3>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn-primary"
            >
              <FiPlus /> Add
            </button>
          </div>

          {user.payments?.map((p, i) => (
            <div key={i} className="flex justify-between border-b py-2">
              <span>
                {currencySymbol}
                {p.amount}
              </span>
              <span>{new Date(p.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
        {user.enableReminder && (
          <div className="rounded-2xl p-5 bg-yellow-50 border border-yellow-100 shadow-md mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FiBell className="h-5 w-5 text-yellow-700" />
                </div>

                <div className="ml-4">
                  <p className="text-sm font-semibold text-yellow-700">
                    Monthly Reminder Enabled
                  </p>
                  <p className="text-sm text-gray-600">
                    Day {user.reminderDay} of every month
                  </p>
                </div>
              </div>

              {/* Optional Badge */}
              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <form
            onSubmit={handleAddPayment}
            className="bg-white p-6 rounded-lg w-80"
          >
            <div className="mb-6 flex items-center">
              <button type="button" onClick={() => setShowPaymentModal(false)} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FiArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Cancel Payment</h1>
            </div>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Amount"
              className="input-field mb-3"
            />
            <button className="btn-primary w-full">
              {submitting ? "Adding..." : "Add Payment"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
