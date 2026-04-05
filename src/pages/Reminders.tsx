import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiBell, FiCalendar, FiUser, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiMail, FiMessageSquare, FiPhone } from "react-icons/fi";
import { User } from "../types";
import { dataService } from "../services/DataServiceFactory";
import { helperService } from "../services/HelperService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
const Reminders: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayReminders, setTodayReminders] = useState<User[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<User[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<User[]>([]);
  const [dueSoonReminders, setDueSoonReminders] = useState<User[]>([]);

  const CurrencyIcon = helperService.getCurrencyIcon();
  const currencySymbol = helperService.getCurrencySymbol();
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();
  
  useEffect(() => { loadUsers() }, []);

  useEffect(() => {
    if (users.length > 0) {
      filterReminders();
    }
  }, [users]);

  const loadUsers = async () => {
    try {
      const usersData = await dataService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterReminders = () => {
    const today = new Date().getDate();
    const currentDate = new Date();
    const todayList: User[] = [];
    const upcomingList: User[] = [];
    const overdueList: User[] = [];
    const dueSoonList: User[] = [];

    users.forEach((user) => {
      if (user.enableReminder) {
        const reminderDay = user.reminderDay;
        const returnDate = user.returnDate ? new Date(user.returnDate) : null;
        if (reminderDay === today) {
          todayList.push(user);
        }
        if (returnDate) {
          const daysDiff = Math.ceil(
            (returnDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24),
          );
          if (daysDiff >= 0 && daysDiff <= 7) {
            upcomingList.push(user);
          }
          if (daysDiff < 0) {
            overdueList.push(user);
          }
          if (daysDiff >= 0 && daysDiff <= 3) {
            dueSoonList.push(user);
          }
        }
      }
    });
    setTodayReminders(todayList);
    setUpcomingReminders(upcomingList);
    setOverdueReminders(overdueList);
    setDueSoonReminders(dueSoonList);
  };

  const calculateTotalWithInterest = (user: User) => {
    return helperService.calculateUserTotalWithInterest(user);
  };

  const sendEmail = async (to: string, subject: string, body: string) => {
    try {
      const result = await dataService.sendEmail(to, subject, body);
      if (result.success) {
        toast.success("Email sent successfully!");
      } else {
        toast.error(result.message || "Failed to send email");
      }
    } catch (error) {
      toast.error("Failed to send email");
    }
  };

  const sendWhatsApp = async (phone: string, message: string) => {
    try {
      const result = await dataService.sendWhatsApp(phone, message);
      if (result.success) {
        toast.success("WhatsApp message sent successfully!");
      } else {
        toast.error(result.message || "Failed to send WhatsApp message");
      }
    } catch (error) {
      toast.error("Failed to send WhatsApp message");
    }
  };

  const sendSMS = async (phone: string, message: string) => {
    try {
      const result = await dataService.sendSMS(phone, message);
      if (result.success) {
        toast.success("SMS sent successfully!");
      } else {
        toast.error(result.message || "Failed to send SMS");
      }
    } catch (error) {
      toast.error("Failed to send SMS");
    }
  };

  const notifyAdminOverdue = (user: User) => {
    if (!adminUser?.email) return;
    const subject = `Overdue Loan Alert for ${user.name}`;
    const body = `The loan for ${user.name} is overdue. Return date was ${user.returnDate ? new Date(user.returnDate).toLocaleDateString() : 'N/A'}. Total amount due: ${currencySymbol}${calculateTotalWithInterest(user).toLocaleString()}. Please collect the money.`;
    sendEmail(adminUser.email, subject, body);
  };

  const notifyAdminDueSoon = (user: User) => {
    if (!adminUser?.email) return;
    const subject = `Loan Due Soon Alert for ${user.name}`;
    const body = `The loan for ${user.name} is due in 3 days. Return date: ${user.returnDate ? new Date(user.returnDate).toLocaleDateString() : 'N/A'}. Total amount due: ${currencySymbol}${calculateTotalWithInterest(user).toLocaleString()}. Please collect the money.`;
    sendEmail(adminUser.email, subject, body);
  };

  const notifyBorrowerDue = (user: User) => {
    if (!user.email && !user.phone) return;
    const dueDate = user.returnDate ? new Date(user.returnDate).toLocaleDateString() : 'N/A';
    const message = `Dear ${user.name}, your loan is due on ${dueDate}. Total amount due: ${currencySymbol}${calculateTotalWithInterest(user).toLocaleString()}. Please make the payment.`;
    if (user.email) {
      sendEmail(user.email, 'Loan Due Reminder', message);
    }
    if (user.phone) {
      sendWhatsApp(user.phone, message);
      sendSMS(user.phone, message);
    }
  };

  const sendAllOverdueNotifications = async () => {
    for (const user of overdueReminders) {
      if (user.phone) {
        await sendWhatsApp(user.phone, `Dear ${user.name}, your loan is overdue. Total amount due: ${currencySymbol}${calculateTotalWithInterest(user).toLocaleString()}. Please make the payment immediately.`);
        await sendSMS(user.phone, `Dear ${user.name}, your loan is overdue. Total amount due: ${currencySymbol}${calculateTotalWithInterest(user).toLocaleString()}. Please make the payment immediately.`);
      }
    }
    toast.success("Notifications sent to all overdue borrowers!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading reminders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center">
          <button onClick={() => navigate("/")} className="mr-3">
            <FiArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">Reminders</h1>
        </div>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FiCalendar className="h-6 w-6 text-orange-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Due in 3 Days
            </h2>
            {dueSoonReminders.length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                {dueSoonReminders.length}
              </span>
            )}
          </div>

          {dueSoonReminders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">No loans due in the next 3 days</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dueSoonReminders.map((user) => (
                <div
                  key={user._id || user.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <FiUser className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        {user.phone && (
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        )}
                      </div>
                    </div>
                    <FiCalendar className="h-5 w-5 text-orange-600" />
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Borrowed Amount:</span>
                      <span className="font-semibold text-gray-900">
                        {currencySymbol}
                        {user.borrowedAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Return Date:</span>
                      <span className="font-semibold text-orange-600">
                        {user.returnDate
                          ? new Date(user.returnDate).toLocaleDateString()
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Due:</span>
                      <span className="font-semibold text-red-600">
                        {currencySymbol}
                        {calculateTotalWithInterest(user).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-800 text-center">
                      Due soon! Collect the money.
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => notifyAdminDueSoon(user)}
                      className="flex items-center px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      <FiMail className="h-3 w-3 mr-1" />
                      Email Admin
                    </button>
                    {adminUser?.phone && (
                      <>
                        <button
                          onClick={() => sendWhatsApp(adminUser.phone, `Loan for ${user.name} due in 3 days. Total due: ${currencySymbol}${calculateTotalWithInterest(user).toLocaleString()}`)}
                          className="flex items-center px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                          <FiMessageSquare className="h-3 w-3 mr-1" />
                          WA Admin
                        </button>
                        <button
                          onClick={() => sendSMS(adminUser.phone, `Loan for ${user.name} due in 3 days. Total due: ${currencySymbol}${calculateTotalWithInterest(user).toLocaleString()}`)}
                          className="flex items-center px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                        >
                          <FiPhone className="h-3 w-3 mr-1" />
                          SMS Admin
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => notifyBorrowerDue(user)}
                      className="flex items-center px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                    >
                      <FiMail className="h-3 w-3 mr-1" />
                      Notify Borrower
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FiBell className="h-6 w-6 text-yellow-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Today's Reminders
            </h2>
            {todayReminders.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {todayReminders.length}
              </span>
            )}
          </div>

          {todayReminders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">No reminders for today</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayReminders.map((user) => (
                <Link
                  key={user._id || user.id}
                  to={`/user/${user._id || user.id}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-full">
                        <FiUser className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        {user.phone && (
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        )}
                      </div>
                    </div>
                    <FiAlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Borrowed Amount:</span>
                      <span className="font-semibold text-gray-900">
                        {currencySymbol}
                        {user.borrowedAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Interest Rate:</span>
                      <span className="font-semibold text-gray-900">
                        {user.interestRate}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Due:</span>
                      <span className="font-semibold text-red-600">
                        {currencySymbol}
                        {calculateTotalWithInterest(user).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <FiCalendar className="h-4 w-4 mr-1" />
                    <span>Reminder: Day {user.reminderDay} of each month</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FiAlertCircle className="h-6 w-6 text-red-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Overdue Loans
              </h2>
              {overdueReminders.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {overdueReminders.length}
                </span>
              )}
            </div>
            {overdueReminders.length > 0 && (
              <button
                onClick={sendAllOverdueNotifications}
                className="flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                <FiMessageSquare className="h-4 w-4 mr-2" />
                Send All Notifications
              </button>
            )}
          </div>

          {overdueReminders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">No overdue loans</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overdueReminders.map((user) => (
                <div
                  key={user._id || user.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-full">
                        <FiUser className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        {user.phone && (
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        )}
                      </div>
                    </div>
                    <FiAlertCircle className="h-5 w-5 text-red-600" />
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Borrowed Amount:</span>
                      <span className="font-semibold text-gray-900">
                        {currencySymbol}
                        {user.borrowedAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Return Date:</span>
                      <span className="font-semibold text-red-600">
                        {user.returnDate
                          ? new Date(user.returnDate).toLocaleDateString()
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Due:</span>
                      <span className="font-semibold text-red-600">
                        {currencySymbol}
                        {calculateTotalWithInterest(user).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-800 text-center">
                      Overdue! Collect the money immediately.
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => notifyAdminOverdue(user)}
                      className="flex items-center px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      <FiMail className="h-3 w-3 mr-1" />
                      Email Admin
                    </button>
                    {adminUser?.phone && (
                      <>
                        <button
                          onClick={() => sendWhatsApp(adminUser.phone, `Overdue loan for ${user.name}. Total due: ${currencySymbol}${calculateTotalWithInterest(user).toLocaleString()}`)}
                          className="flex items-center px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                          <FiMessageSquare className="h-3 w-3 mr-1" />
                          WA Admin
                        </button>
                        <button
                          onClick={() => sendSMS(adminUser.phone, `Overdue loan for ${user.name}. Total due: ${currencySymbol}${calculateTotalWithInterest(user).toLocaleString()}`)}
                          className="flex items-center px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                        >
                          <FiPhone className="h-3 w-3 mr-1" />
                          SMS Admin
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => notifyBorrowerDue(user)}
                      className="flex items-center px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                    >
                      <FiMail className="h-3 w-3 mr-1" />
                      Notify Borrower
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FiCalendar className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Upcoming Return Dates (Next 7 Days)
            </h2>
            {upcomingReminders.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {upcomingReminders.length}
              </span>
            )}
          </div>

          {upcomingReminders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">
                No upcoming return dates in the next 7 days
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingReminders.map((user) => (
                <Link
                  key={user._id || user.id}
                  to={`/user/${user._id || user.id}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <FiUser className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        {user.phone && (
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        )}
                      </div>
                    </div>
                    <CurrencyIcon className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Borrowed Amount:</span>
                      <span className="font-semibold text-gray-900">
                        {currencySymbol}
                        {user.borrowedAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Return Date:</span>
                      <span className="font-semibold text-orange-600">
                        {user.returnDate
                          ? new Date(user.returnDate).toLocaleDateString()
                          : "Not set"}
                      </span>
                    </div>
                  </div>

                  {user.returnDate && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-800 text-center">
                        Due soon! Please remind {user.name} about the payment
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reminders;
