import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import {
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiMail,
  FiMessageSquare,
  FiArrowRight,
  FiZap,
  FiInbox,
} from "react-icons/fi";
import { User } from "../types";
import { dataService } from "../services/DataServiceFactory";
import { helperService } from "../services/HelperService";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

type FilterType = "all" | "today" | "dueSoon" | "overdue" | "upcoming";

const Reminders: React.FC = () => {
  useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayReminders, setTodayReminders] = useState<User[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<User[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<User[]>([]);
  const [dueSoonReminders, setDueSoonReminders] = useState<User[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

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

  // Filter Tabs Config
  const filterTabs: { id: FilterType; label: string; count: number; color: string }[] = useMemo(() => [
    { id: "all", label: "All", count: todayReminders.length + dueSoonReminders.length + overdueReminders.length + upcomingReminders.length, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400" },
    { id: "overdue", label: "Overdue", count: overdueReminders.length, color: "text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400" },
    { id: "today", label: "Today", count: todayReminders.length, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
    { id: "dueSoon", label: "Due Soon", count: dueSoonReminders.length, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400" },
    { id: "upcoming", label: "Upcoming", count: upcomingReminders.length, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
  ], [todayReminders, dueSoonReminders, overdueReminders, upcomingReminders]);

  // Determine which sections to show based on filter
  const showOverdue = activeFilter === "all" || activeFilter === "overdue";
  const showToday = activeFilter === "all" || activeFilter === "today";
  const showDueSoon = activeFilter === "all" || activeFilter === "dueSoon";
  const showUpcoming = activeFilter === "all" || activeFilter === "upcoming";

  const hasAnyReminders = todayReminders.length + dueSoonReminders.length + overdueReminders.length + upcomingReminders.length > 0;

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-gray-400 font-medium">Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 dark:bg-gray-950 px-4 py-6 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* HERO HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <FiBell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Reminders
              </h1>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
                Stay ahead of upcoming payments and overdue loans.
              </p>
            </div>
          </div>

          {overdueReminders.length > 0 && (
            <button
              onClick={sendAllOverdueNotifications}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-rose-500/20 hover:scale-[1.02] transition-all"
            >
              <FiZap className="w-4 h-4" /> Send All Overdue
            </button>
          )}
        </div>

        {/* KPI SUMMARY CARDS (Clickable filters) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { id: "today" as FilterType, label: "Today", value: todayReminders.length, color: "from-amber-400 to-orange-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-100 dark:border-amber-900/50", icon: FiBell },
            { id: "dueSoon" as FilterType, label: "Due Soon", value: dueSoonReminders.length, color: "from-orange-500 to-red-500", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-100 dark:border-orange-900/50", icon: FiAlertCircle },
            { id: "overdue" as FilterType, label: "Overdue", value: overdueReminders.length, color: "from-rose-500 to-pink-600", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-100 dark:border-rose-900/50", icon: FiAlertCircle },
            { id: "upcoming" as FilterType, label: "Upcoming", value: upcomingReminders.length, color: "from-blue-500 to-cyan-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-900/50", icon: FiCalendar },
          ].map((item, idx) => (
            <motion.button
              key={idx}
              onClick={() => setActiveFilter(activeFilter === item.id ? "all" : item.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -3 }}
              className={`text-left rounded-2xl p-4 border transition-all ${
                activeFilter === item.id
                  ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-950"
                  : ""
              } ${item.bg} ${item.border}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                    {item.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mt-1">
                    {item.value}
                  </p>
                </div>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md`}>
                  <item.icon size={16} />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                  : "bg-white dark:bg-gray-900 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeFilter === tab.id 
                  ? "bg-white/20 dark:bg-slate-900/20" 
                  : tab.color
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        {!hasAnyReminders ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-gray-800 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">All caught up!</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">You have no pending reminders at the moment.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {showOverdue && overdueReminders.length > 0 && (
                <SectionWrapper
                  key="overdue"
                  title="Overdue Loans"
                  subtitle="Immediate action required"
                  count={overdueReminders.length}
                  icon={<FiAlertCircle className="w-5 h-5" />}
                  accentColor="rose"
                >
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
                </SectionWrapper>
              )}

              {showToday && todayReminders.length > 0 && (
                <SectionWrapper
                  key="today"
                  title="Today's Reminders"
                  subtitle="Scheduled for today"
                  count={todayReminders.length}
                  icon={<FiBell className="w-5 h-5" />}
                  accentColor="amber"
                >
                  {todayReminders.map((user) => (
                    <ReminderCard
                      key={user._id || user.id}
                      user={user}
                      type="today"
                      currencySymbol={currencySymbol}
                      calculateTotal={calculateTotalWithInterest}
                      onNotifyAdmin={() => {}}
                      onNotifyBorrower={notifyBorrowerDue}
                      adminUser={adminUser}
                      sendWhatsApp={sendWhatsApp}
                      sendSMS={sendSMS}
                      navigate={navigate}
                    />
                  ))}
                </SectionWrapper>
              )}

              {showDueSoon && dueSoonReminders.length > 0 && (
                <SectionWrapper
                  key="dueSoon"
                  title="Due in 3 Days"
                  subtitle="Prepare for collection"
                  count={dueSoonReminders.length}
                  icon={<FiCalendar className="w-5 h-5" />}
                  accentColor="orange"
                >
                  {dueSoonReminders.map((user) => (
                    <ReminderCard
                      key={user._id || user.id}
                      user={user}
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
                  ))}
                </SectionWrapper>
              )}

              {showUpcoming && upcomingReminders.length > 0 && (
                <SectionWrapper
                  key="upcoming"
                  title="Upcoming Return Dates"
                  subtitle="Next 7 days"
                  count={upcomingReminders.length}
                  icon={<FiCalendar className="w-5 h-5" />}
                  accentColor="blue"
                >
                  {upcomingReminders.map((user) => (
                    <ReminderCard
                      key={user._id || user.id}
                      user={user}
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
                  ))}
                </SectionWrapper>
              )}
            </AnimatePresence>

            {/* Empty state for active filter */}
            {activeFilter !== "all" &&
              ((activeFilter === "overdue" && overdueReminders.length === 0) ||
                (activeFilter === "today" && todayReminders.length === 0) ||
                (activeFilter === "dueSoon" && dueSoonReminders.length === 0) ||
                (activeFilter === "upcoming" && upcomingReminders.length === 0)) && (
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-gray-800">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiInbox className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">
                    No reminders in this category.
                  </p>
                </div>
              )}
          </div>
        )}

      </div>
    </div>
  );
};

// Section Wrapper Component
const SectionWrapper: React.FC<{
  title: string;
  subtitle: string;
  count: number;
  icon: React.ReactNode;
  accentColor: "rose" | "amber" | "orange" | "blue";
  children: React.ReactNode;
}> = ({ title, subtitle, count, icon, accentColor, children }) => {
  const colorMap = {
    rose: { bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-600 dark:text-rose-400", badge: "bg-rose-500" },
    amber: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-500" },
    orange: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400", badge: "bg-orange-500" },
    blue: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", badge: "bg-blue-500" },
  };
  const colors = colorMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${colors.bg} ${colors.text}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h2>
            <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${colors.badge}`}>
              {count}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </motion.div>
  );
};

// Individual reminder card
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
  navigate,
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case "overdue":
        return { border: "border-l-rose-500", badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300", label: "Overdue" };
      case "due":
        return { border: "border-l-orange-500", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300", label: "Due Soon" };
      case "today":
        return { border: "border-l-amber-500", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", label: "Today" };
      default:
        return { border: "border-l-blue-500", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300", label: "Upcoming" };
    }
  };
  const styles = getTypeStyles();

  const initials = user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 border-l-4 ${styles.border} overflow-hidden`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {initials}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">{user.name}</h3>
              {user.phone && (
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{user.phone}</p>
              )}
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md ${styles.badge}`}>
            {styles.label}
          </span>
        </div>

        {/* Data rows */}
        <div className="space-y-2 text-sm border-t border-slate-100 dark:border-gray-800 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 dark:text-gray-400">Borrowed</span>
            <span className="font-semibold text-slate-800 dark:text-white">
              {currencySymbol}{user.borrowedAmount.toLocaleString()}
            </span>
          </div>
          {user.returnDate && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-gray-400">Return Date</span>
              <span className="font-medium text-slate-700 dark:text-gray-300">
                {new Date(user.returnDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-100 dark:border-gray-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">Total Due</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {currencySymbol}{calculateTotal(user).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-gray-800">
          <button
            onClick={() => navigate(`/user/${user._id || user.id}`)}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
          >
            View <FiArrowRight className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-1.5">
            {type !== "today" && (
              <IconButton
                onClick={() => onNotifyAdmin(user)}
                icon={<FiMail className="w-3.5 h-3.5" />}
                tooltip="Notify Admin"
                color="bg-blue-500 hover:bg-blue-600"
              />
            )}
            {adminUser?.phone && type !== "today" && (
              <IconButton
                onClick={() =>
                  sendWhatsApp(
                    adminUser.phone,
                    `Loan for ${user.name} is ${type === "overdue" ? "overdue" : "due soon"}. Total due: ${currencySymbol}${calculateTotal(user).toLocaleString()}`
                  )
                }
                icon={<FiMessageSquare className="w-3.5 h-3.5" />}
                tooltip="WhatsApp Admin"
                color="bg-emerald-500 hover:bg-emerald-600"
              />
            )}
            <IconButton
              onClick={() => onNotifyBorrower(user)}
              icon={<FiBell className="w-3.5 h-3.5" />}
              tooltip="Notify Borrower"
              color="bg-orange-500 hover:bg-orange-600"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Small Icon Button with Tooltip
const IconButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  color: string;
}> = ({ onClick, icon, tooltip, color }) => (
  <button
    onClick={onClick}
    title={tooltip}
    aria-label={tooltip}
    className={`flex items-center justify-center w-8 h-8 rounded-lg text-white shadow-sm transition-all hover:scale-110 ${color}`}
  >
    {icon}
  </button>
);

export default Reminders;