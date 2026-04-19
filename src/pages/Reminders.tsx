import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import {
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiMail,
  FiMessageSquare,
  FiPhone
} from "react-icons/fi";
import { User } from "../types";
import { dataService } from "../services/DataServiceFactory";
import { helperService } from "../services/HelperService";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Reminders: React.FC = () => {
  useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayReminders, setTodayReminders] = useState<User[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<User[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<User[]>([]);
  const [dueSoonReminders, setDueSoonReminders] = useState<User[]>([]);

  //const CurrencyIcon = helperService.getCurrencyIcon();
  const currencySymbol = helperService.getCurrencySymbol();
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

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
            (returnDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
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
    const body = `The loan for ${user.name} is overdue. Return date was ${
      user.returnDate ? new Date(user.returnDate).toLocaleDateString() : "N/A"
    }. Total amount due: ${currencySymbol}${calculateTotalWithInterest(
      user
    ).toLocaleString()}. Please collect the money.`;
    sendEmail(adminUser.email, subject, body);
  };

  const notifyAdminDueSoon = (user: User) => {
    if (!adminUser?.email) return;
    const subject = `Loan Due Soon Alert for ${user.name}`;
    const body = `The loan for ${user.name} is due in 3 days. Return date: ${
      user.returnDate ? new Date(user.returnDate).toLocaleDateString() : "N/A"
    }. Total amount due: ${currencySymbol}${calculateTotalWithInterest(
      user
    ).toLocaleString()}. Please collect the money.`;
    sendEmail(adminUser.email, subject, body);
  };

  const notifyBorrowerDue = (user: User) => {
    if (!user.email && !user.phone) return;
    const dueDate = user.returnDate
      ? new Date(user.returnDate).toLocaleDateString()
      : "N/A";
    const message = `Dear ${user.name}, your loan is due on ${dueDate}. Total amount due: ${currencySymbol}${calculateTotalWithInterest(
      user
    ).toLocaleString()}. Please make the payment.`;
    if (user.email) {
      sendEmail(user.email, "Loan Due Reminder", message);
    }
    if (user.phone) {
      sendWhatsApp(user.phone, message);
      sendSMS(user.phone, message);
    }
  };

  const sendAllOverdueNotifications = async () => {
    for (const user of overdueReminders) {
      if (user.phone) {
        await sendWhatsApp(
          user.phone,
          `Dear ${user.name}, your loan is overdue. Total amount due: ${currencySymbol}${calculateTotalWithInterest(
            user
          ).toLocaleString()}. Please make the payment immediately.`
        );
        await sendSMS(
          user.phone,
          `Dear ${user.name}, your loan is overdue. Total amount due: ${currencySymbol}${calculateTotalWithInterest(
            user
          ).toLocaleString()}. Please make the payment immediately.`
        );
      }
    }
    toast.success("Notifications sent to all overdue borrowers!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-blue-100 to-purple-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-blue-100 to-purple-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-3 rounded-full bg-white dark:bg-gray-800 shadow hover:scale-110 transition dark:text-white"
          >
            <FiArrowLeft />
          </button>
          <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-800/60 p-5 rounded-2xl shadow-2xl border border-white/40 dark:border-gray-700/40 flex-1 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Reminders Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track dues, overdue & reminders
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
              <FiBell size={24} />
            </div>
          </div>
        </div>

        {/* KPI summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Today", value: todayReminders.length, color: "from-yellow-500 to-orange-500", icon: FiBell },
            { label: "Due Soon", value: dueSoonReminders.length, color: "from-orange-500 to-red-500", icon: FiAlertCircle },
            { label: "Overdue", value: overdueReminders.length, color: "from-red-500 to-pink-500", icon: FiAlertCircle },
            { label: "Upcoming", value: upcomingReminders.length, color: "from-blue-500 to-cyan-500", icon: FiCalendar },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50 dark:border-gray-700/50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{item.value}</p>
                </div>
                <div className={`p-2 rounded-xl bg-gradient-to-r ${item.color} text-white`}>
                  <item.icon size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Due Soon Section */}
        <ReminderSection
          title="Due in 3 Days"
          icon={<FiCalendar className="text-orange-600" />}
          users={dueSoonReminders}
          type="due"
          currencySymbol={currencySymbol}
          calculateTotal={calculateTotalWithInterest}
          onNotifyAdmin={notifyAdminDueSoon}
          onNotifyBorrower={notifyBorrowerDue}
          adminUser={adminUser}
          sendWhatsApp={sendWhatsApp}
          sendSMS={sendSMS}
          navigate={navigate}
        />

        {/* Today's Reminders */}
        <ReminderSection
          title="Today's Reminders"
          icon={<FiBell className="text-yellow-600" />}
          users={todayReminders}
          type="today"
          currencySymbol={currencySymbol}
          calculateTotal={calculateTotalWithInterest}
          onNotifyAdmin={() => {}} // no admin notify for today
          onNotifyBorrower={notifyBorrowerDue}
          adminUser={adminUser}
          sendWhatsApp={sendWhatsApp}
          sendSMS={sendSMS}
          navigate={navigate}
        />

        {/* Overdue Section with "Send All" button */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 border-b border-white/30 dark:border-gray-700 pb-2">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="text-red-600" size={22} />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Overdue Loans</h2>
              {overdueReminders.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {overdueReminders.length}
                </span>
              )}
            </div>
            {overdueReminders.length > 0 && (
              <button
                onClick={sendAllOverdueNotifications}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition shadow-md"
              >
                <FiMessageSquare size={16} /> Send All Notifications
              </button>
            )}
          </div>
          {overdueReminders.length === 0 ? (
            <EmptyState message="No overdue loans" />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {overdueReminders.map((user) => (
                <ReminderCard
                  key={user._id || user.id}
                  user={user}
                  type="overdue"
                  currencySymbol={currencySymbol}
                  calculateTotal={calculateTotalWithInterest}
                  onNotifyAdmin={notifyAdminOverdue}
                  onNotifyBorrower={notifyBorrowerDue}
                  adminUser={adminUser}
                  sendWhatsApp={sendWhatsApp}
                  sendSMS={sendSMS}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Section */}
        <ReminderSection
          title="Upcoming Return Dates (Next 7 Days)"
          icon={<FiCalendar className="text-blue-600" />}
          users={upcomingReminders}
          type="upcoming"
          currencySymbol={currencySymbol}
          calculateTotal={calculateTotalWithInterest}
          onNotifyAdmin={() => {}}
          onNotifyBorrower={notifyBorrowerDue}
          adminUser={adminUser}
          sendWhatsApp={sendWhatsApp}
          sendSMS={sendSMS}
          navigate={navigate}
        />
      </div>
    </div>
  );
};

// Helper component for sections with same layout
const ReminderSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  users: User[];
  type: string;
  currencySymbol: string;
  calculateTotal: (user: User) => number;
  onNotifyAdmin: (user: User) => void;
  onNotifyBorrower: (user: User) => void;
  adminUser: any;
  sendWhatsApp: (phone: string, msg: string) => void;
  sendSMS: (phone: string, msg: string) => void;
  navigate: any;
}> = ({
  title,
  icon,
  users,
  type,
  currencySymbol,
  calculateTotal,
  onNotifyAdmin,
  onNotifyBorrower,
  adminUser,
  sendWhatsApp,
  sendSMS,
  navigate,
}) => (
  <div className="mb-10">
    <div className="flex items-center gap-2 mb-4 border-b border-white/30 pb-2">
      {icon}
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      {users.length > 0 && (
        <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
          {users.length}
        </span>
      )}
    </div>
    {users.length === 0 ? (
      <EmptyState message={`No ${title.toLowerCase()} reminders`} />
    ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((user) => (
          <ReminderCard
            key={user._id || user.id}
            user={user}
            type={type}
            currencySymbol={currencySymbol}
            calculateTotal={calculateTotal}
            onNotifyAdmin={onNotifyAdmin}
            onNotifyBorrower={onNotifyBorrower}
            adminUser={adminUser}
            sendWhatsApp={sendWhatsApp}
            sendSMS={sendSMS}
            navigate={navigate}
          />
        ))}
      </div>
    )}
  </div>
);

// Individual reminder card with glassmorphism and action buttons
const ReminderCard: React.FC<{
  user: User;
  type: string;
  currencySymbol: string;
  calculateTotal: (user: User) => number;
  onNotifyAdmin: (user: User) => void;
  onNotifyBorrower: (user: User) => void;
  adminUser: any;
  sendWhatsApp: (phone: string, msg: string) => void;
  sendSMS: (phone: string, msg: string) => void;
  navigate: any;
}> = ({
  user,
  type,
  currencySymbol,
  calculateTotal,
  onNotifyAdmin,
  onNotifyBorrower,
  adminUser,
  sendWhatsApp,
  sendSMS,
  navigate,
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case "overdue":
        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700" };
      case "due":
        return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-700" };
      case "today":
        return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700" };
      default:
        return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" };
    }
  };
  const styles = getTypeStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-white/50 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{user.name}</h3>
            {user.phone && <p className="text-xs text-gray-500">{user.phone}</p>}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${styles.badge}`}>
          {type === "due" ? "Due Soon" : type === "today" ? "Today" : type === "overdue" ? "Overdue" : "Upcoming"}
        </span>
      </div>

      <div className="border-t border-gray-200/50 pt-3 mt-2 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Borrowed:</span>
          <span className="font-semibold text-gray-800">
            {currencySymbol}{user.borrowedAmount.toLocaleString()}
          </span>
        </div>
        {user.returnDate && (
          <div className="flex justify-between">
            <span className="text-gray-500">Return date:</span>
            <span className={`font-medium ${styles.text}`}>
              {new Date(user.returnDate).toLocaleDateString()}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Total due:</span>
          <span className="font-bold text-red-600">
            {currencySymbol}{calculateTotal(user).toLocaleString()}
          </span>
        </div>
      </div>

      {type === "due" && (
        <div className="mt-3 p-2 bg-orange-100 rounded-lg text-center">
          <p className="text-xs text-orange-800">⚠️ Due soon! Collect the money.</p>
        </div>
      )}
      {type === "overdue" && (
        <div className="mt-3 p-2 bg-red-100 rounded-lg text-center">
          <p className="text-xs text-red-800">❌ Overdue! Immediate action required.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => navigate(`/user/${user._id || user.id}`)}
          className="text-xs text-indigo-600 underline hover:text-indigo-800"
        >
          View Details
        </button>

        {type !== "today" && onNotifyAdmin && (
          <button
            onClick={() => onNotifyAdmin(user)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <FiMail size={12} /> Admin
          </button>
        )}

        {adminUser?.phone && type !== "today" && (
          <>
            <button
              onClick={() =>
                sendWhatsApp(
                  adminUser.phone,
                  `Loan for ${user.name} is ${type === "overdue" ? "overdue" : "due soon"}. Total due: ${currencySymbol}${calculateTotal(
                    user
                  ).toLocaleString()}`
                )
              }
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <FiMessageSquare size={12} /> WA
            </button>
            <button
              onClick={() =>
                sendSMS(
                  adminUser.phone,
                  `Loan for ${user.name} is ${type === "overdue" ? "overdue" : "due soon"}. Total due: ${currencySymbol}${calculateTotal(
                    user
                  ).toLocaleString()}`
                )
              }
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              <FiPhone size={12} /> SMS
            </button>
          </>
        )}

        <button
          onClick={() => onNotifyBorrower(user)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <FiMail size={12} /> Notify
        </button>
      </div>
    </motion.div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/40">
    <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
    <p className="text-gray-600">{message}</p>
  </div>
);

export default Reminders;