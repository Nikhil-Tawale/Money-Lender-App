import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  FiLogOut,
  FiBell,
  FiRepeat,
  FiUsers,
  FiHome,
  FiMenu,
  FiSearch,
  FiMoon,
  FiSun,
  FiX,
  FiTrendingUp,
  FiUserPlus,
  FiPieChart,
} from "react-icons/fi";

import UserCard from "../components/UserCard";
import { User } from "../types";
import { dataService } from "../services/DataServiceFactory";
import { helperService } from "../services/HelperService";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    totalUsers: 0,
    totalInterest: 0,
    totalReceived: 0,
  });

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { logout, user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();

  useEffect(() => {
    loadData();
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([
        dataService.getUsers(),
        dataService.getStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } finally {
      setLoading(false);
    }
  };

  const currencySymbol = helperService.getCurrencySymbol();
  const CurrencyIcon = helperService.getCurrencyIcon();

  const chartData = [
    { name: "Borrowed", value: stats.totalBorrowed, color: "#F59E0B" },
    { name: "Received", value: stats.totalReceived, color: "#10B981" },
    { name: "Interest", value: stats.totalInterest, color: "#8B5CF6" },
  ];

  const navItem = (to: string, icon: any, label: string) => {
    const active = location.pathname === to;

    return (
      <Link
        to={to}
        onClick={() => setMobileSidebar(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          active
            ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
            : "hover:bg-white/10 text-white/80 hover:text-white"
        }`}
      >
        <span className="text-xl">{icon}</span>
        {sidebarOpen && (
          <span className="font-medium tracking-wide">{label}</span>
        )}
      </Link>
    );
  };

  const Sidebar = () => (
    <div className="h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-10 px-2">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CurrencyIcon className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                LendFlow
              </h1>
            </motion.div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FiMenu className="text-white" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 mt-6">
          {navItem("/", <FiHome />, "Dashboard")}
          {navItem("/add-user", <FiUserPlus />, "Add User")}
          {navItem("/interest-calculator", <FiRepeat />, "Calculator")}
        </nav>
      </div>

      {/* Logout button removed from sidebar as requested */}
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {label}
          </p>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {currencySymbol}
            {payload[0].value?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 flex justify-between items-center shadow-lg z-50 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setMobileSidebar(true)}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800"
        >
          <FiMenu className="text-gray-700 dark:text-gray-200" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <CurrencyIcon className="text-white text-sm" />
          </div>
          <h1 className="font-bold text-lg bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            LendFlow
          </h1>
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800"
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
      </div>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {mobileSidebar && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          >
            <div className="w-80 h-screen bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-800 text-white p-6 shadow-2xl flex flex-col overflow-y-auto dark:from-gray-900 dark:via-gray-950 dark:to-black">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                    <CurrencyIcon className="text-white" />
                  </div>
                  <span className="font-bold text-xl">LendFlow</span>
                </div>
                <button
                  onClick={() => setMobileSidebar(false)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <FiX />
                </button>
              </div>
              <Sidebar />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR DESKTOP */}
      <motion.aside
        animate={{ width: sidebarOpen ? 280 : 88 }}
        transition={{ type: "spring", damping: 20 }}
        className="hidden md:flex bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-800 text-white shadow-2xl relative z-10"
      >
        <div className="w-full p-5">
          <Sidebar />
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col pt-20 md:pt-0 overflow-x-hidden min-h-screen">
        {/* HEADER */}
        <header className="sticky top-0 z-20 flex justify-between items-center p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
          <div className="flex items-center bg-white dark:bg-gray-800/50 px-5 py-2.5 rounded-2xl w-full max-w-md shadow-inner border border-gray-200/50 dark:border-gray-700/50 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
            <FiSearch className="mr-3 text-gray-400 text-lg" />
            <input
              className="bg-transparent outline-none w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
              placeholder="Search borrowers..."
            />
          </div>

          <div className="flex items-center gap-3 ml-4">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:scale-105 transition-transform"
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>

            <Link to="/reminders">
              <div className="relative">
                <button className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:scale-105 transition-transform">
                  <FiBell />
                </button>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
            </Link>

            {/* Profile Dropdown - Click to open, not logout */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 pl-3 border-l border-gray-300 dark:border-gray-700 hover:opacity-80 transition-opacity"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {user?.name}
                </span>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.email || "user@example.com"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <FiLogOut className="text-lg" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA - unchanged from your original */}
        <main className="p-4 md:p-8 space-y-8">
          {/* KPI CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                label: "Total Borrowed",
                value: stats.totalBorrowed,
                icon: <CurrencyIcon />,
                gradient: "from-orange-500 to-red-500",
              },
              {
                label: "Total Received",
                value: stats.totalReceived,
                icon: <FiTrendingUp />,
                gradient: "from-green-500 to-emerald-500",
              },
              {
                label: "Active Users",
                value: stats.totalUsers,
                icon: <FiUsers />,
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                label: "Total Interest",
                value: stats.totalInterest,
                icon: <FiPieChart />,
                gradient: "from-purple-500 to-pink-500",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { type: "spring" } }}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200/50 dark:border-gray-800/50"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                ></div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">
                        {item.label === "Active Users"
                          ? item.value
                          : `${currencySymbol}${item.value.toLocaleString()}`}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}
                    >
                      <div className="text-white text-xl">{item.icon}</div>
                    </div>
                  </div>
                  <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.gradient} rounded-full w-3/4`}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CHART SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Financial Analytics
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Overview of borrowings, receipts, and interest
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Borrowed
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Received
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Interest
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full h-96 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="borrowedGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#D97706"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                    <linearGradient
                      id="receivedGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#059669"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                    <linearGradient
                      id="interestGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#6D28D9"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={darkMode ? "#374151" : "#E5E7EB"}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: darkMode ? "#9CA3AF" : "#6B7280",
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: darkMode ? "#9CA3AF" : "#6B7280",
                      fontSize: 12,
                    }}
                    tickFormatter={(value) =>
                      `${currencySymbol}${value.toLocaleString()}`
                    }
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      fill: darkMode ? "#374151" : "#F3F4F6",
                      opacity: 0.3,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "Borrowed"
                            ? "url(#borrowedGrad)"
                            : entry.name === "Received"
                              ? "url(#receivedGrad)"
                              : "url(#interestGrad)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* USERS LIST */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-200/50 dark:border-gray-800/50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Active Borrowers
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage and track all registered borrowers
                  </p>
                </div>
                <Link
                  to="/add-user"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all hover:scale-105"
                >
                  + Add New
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="p-8 flex justify-center items-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading borrowers...
                  </p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <FiUsers className="text-3xl text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No borrowers found
                </p>
                <Link
                  to="/add-user"
                  className="inline-block mt-4 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Add your first borrower →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200/50 dark:divide-gray-800/50">
                {users.map((u, idx) => (
                  <motion.div
                    key={u._id || u.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <UserCard user={u} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;