import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  FiLogOut,
  FiBell,
  FiRepeat,
  FiUsers,
  FiHome,
  FiSearch,
  FiX,
  FiTrendingUp,
  FiUserPlus,
  FiPieChart,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUpRight,
  FiArrowDownRight,
  FiSettings,
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

const Dashboard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
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
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartReady, setChartReady] = useState(false);

  const { logout, user } = useAuth();
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const refreshUsers = () => loadData();
    window.addEventListener("users-updated", refreshUsers);
    return () => window.removeEventListener("users-updated", refreshUsers);
  }, []);

  useEffect(() => {
    mainContentRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  useEffect(() => {
    if (children || !chartContainerRef.current) return;

    const chartContainer = chartContainerRef.current;
    const updateChartReady = () => {
      setChartReady(chartContainer.clientWidth > 0 && chartContainer.clientHeight > 0);
    };
    const observer = new ResizeObserver(updateChartReady);
    observer.observe(chartContainer);
    updateChartReady();

    return () => observer.disconnect();
  }, [children]);

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
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredUsers = normalizedSearchQuery
    ? users.filter((borrower) =>
        [borrower.name, borrower.phone, borrower.email].some((value) =>
          value?.toLowerCase().includes(normalizedSearchQuery),
        ),
      )
    : users;

  const chartData = [
    { name: "Borrowed", value: stats.totalBorrowed, color: "#F59E0B" },
    { name: "Received", value: stats.totalReceived, color: "#10B981" },
    { name: "Interest", value: stats.totalInterest, color: "#8B5CF6" },
  ];
  const collectionRate = stats.totalBorrowed > 0
    ? Math.round((stats.totalReceived / stats.totalBorrowed) * 100)
    : 0;

  const navItem = (to: string, icon: any, label: string) => {
    const active = location.pathname === to;

    return (
      <Link
        to={to}
        onClick={() => setMobileSidebar(false)}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          active
            ? "bg-white/15 text-white"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
      >
        {active && (
          <motion.div
            layoutId="activeNav"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"
          />
        )}
        <span className="text-lg shrink-0">{icon}</span>
        {sidebarOpen && (
          <span className="font-medium text-sm tracking-wide">{label}</span>
        )}
      </Link>
    );
  };

  const Sidebar = () => (
    <div className="h-full flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div className="flex items-center justify-between mb-8 px-1">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-white/30 to-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <CurrencyIcon className="text-white text-sm" />
                </div>
                <h1 className="text-lg font-bold tracking-tight text-white">
                  LendFlow
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            className="min-w-11 min-h-11 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            {sidebarOpen ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {navItem("/", <FiHome />, t("dashboard"))}
          {navItem("/add-user", <FiUserPlus />, t("addUser"))}
          {navItem("/interest-calculator", <FiRepeat />, t("calculator"))}
          {navItem("/reminders", <FiBell />, t("reminders"))}
          {navItem("/settings", <FiSettings />, t("settings"))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 rounded-xl bg-white/5 border border-white/10"
        >
          <p className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">
            {t("signedInAs")}
          </p>
          <p className="text-xs text-white/90 font-medium mt-1 truncate">
            {user?.email || "user@lendflow.app"}
          </p>
        </motion.div>
      )}
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/10">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
            {label}
          </p>
          <p className="text-base font-bold text-white">
            {currencySymbol}
            {payload[0].value?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-slate-50 dark:bg-gray-950 transition-colors duration-300 font-sans md:flex-row">
      {/* Subtle Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* MOBILE TOP BAR */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95 md:hidden">
        <button
          onClick={() => setMobileSidebar(true)}
          aria-label="Open navigation"
          className="flex min-h-11 min-w-11 items-center gap-2 rounded-xl px-2 hover:bg-slate-100 dark:hover:bg-gray-800"
        >
          <div className="w-7 h-7 shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <CurrencyIcon className="text-white text-sm" />
          </div>
          <span className="font-bold text-base text-slate-800 dark:text-white truncate">
            LendFlow
          </span>
        </button>

        <div className="flex items-center gap-1">
          <Link
            to="/reminders"
            aria-label="Open reminders"
            className="relative min-h-11 min-w-11 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-200"
          >
            <FiBell />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500" />
          </Link>
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {mobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden"
            onClick={(event) => {
              if (event.target === event.currentTarget) setMobileSidebar(false);
            }}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-[min(18rem,82vw)] h-[100dvh] bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 text-white p-5 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                    <CurrencyIcon className="text-white" />
                  </div>
                  <span className="font-bold text-xl">LendFlow</span>
                </div>
                <button
                  onClick={() => setMobileSidebar(false)}
                  className="min-w-11 min-h-11 flex items-center justify-center rounded-lg hover:bg-white/10"
                >
                  <FiX />
                </button>
              </div>
              <Sidebar />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR DESKTOP */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 84 }}
        transition={{ type: "spring", damping: 22, stiffness: 200 }}
        className="hidden md:flex h-[100dvh] overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 text-white shadow-xl relative z-10"
      >
        <div className="w-full p-4">
          <Sidebar />
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden md:w-auto">
        {/* HEADER */}
        <header className="hidden md:flex shrink-0 z-20 items-center justify-between gap-4 px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-gray-800">
          {/* Global Search */}
          <div className="flex items-center bg-slate-100 dark:bg-gray-800 px-3.5 py-2 rounded-xl w-full max-w-sm border border-transparent focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-gray-900 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
            <FiSearch className="mr-2.5 text-slate-400 text-sm" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="bg-transparent outline-none w-full text-sm text-slate-700 dark:text-gray-200 placeholder-slate-400"
              placeholder="Search borrowers, phone, email..."
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 pl-3 pr-1 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-gray-200">
                  {user?.name}
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
                            {user?.email || "user@example.com"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <Link
                        to="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-gray-200 text-sm hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <FiSettings className="text-base" />
                        <span>{t("settings")}</span>
                      </Link>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-600 text-sm hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                      >
                        <FiLogOut className="text-base" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main
          ref={mainContentRef}
          className={`mt-14 md:mt-0 flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 ${
            children ? "" : "space-y-6"
          }`}
        >
          {children || (
            <>
              {/* PAGE TITLE */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Overview
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                    {t("trackOverview")}
                  </p>
                </div>
              </div>

              {/* KPI CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: t("totalBorrowed"),
                    value: stats.totalBorrowed,
                    icon: <CurrencyIcon />,
                    accent: "amber",
                    delta: "+12.5%",
                    trend: "up",
                  },
                  {
                    label: t("totalReceived"),
                    value: stats.totalReceived,
                    icon: <FiTrendingUp />,
                    accent: "emerald",
                    delta: "+8.2%",
                    trend: "up",
                  },
                  {
                    label: t("activeUsers"),
                    value: stats.totalUsers,
                    icon: <FiUsers />,
                    accent: "indigo",
                    delta: "+3",
                    trend: "up",
                    isCount: true,
                  },
                  {
                    label: t("totalInterest"),
                    value: stats.totalInterest,
                    icon: <FiPieChart />,
                    accent: "purple",
                    delta: "-2.1%",
                    trend: "down",
                  },
                ].map((item, i) => {
                  const accentMap: Record<string, { bg: string; text: string; ring: string }> = {
                    amber: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/10" },
                    emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/10" },
                    indigo: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-600 dark:text-indigo-400", ring: "ring-indigo-500/10" },
                    purple: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400", ring: "ring-purple-500/10" },
                  };
                  const a = accentMap[item.accent];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="group bg-white dark:bg-gray-900 rounded-2xl p-5 border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-xl ${a.bg} ${a.text} ring-4 ${a.ring}`}>
                          <span className="text-base">{item.icon}</span>
                        </div>
                        <div
                          className={`flex items-center gap-0.5 text-[11px] font-semibold ${
                            item.trend === "up"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-500 dark:text-rose-400"
                          }`}
                        >
                          {item.trend === "up" ? (
                            <FiArrowUpRight className="w-3 h-3" />
                          ) : (
                            <FiArrowDownRight className="w-3 h-3" />
                          )}
                          {item.delta}
                        </div>
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                        {item.label}
                      </p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                        {item.isCount
                          ? item.value
                          : `${currencySymbol}${item.value.toLocaleString()}`}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* CHART SECTION */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-100 dark:border-gray-800 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                      {t("financialAnalytics")}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                      {t("financialAnalyticsSubtitle")}
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs">
                    {[
                      { label: t("borrowed"), color: "bg-amber-500" },
                      { label: t("received"), color: "bg-emerald-500" },
                      { label: t("interest"), color: "bg-violet-500" },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                        <span className="text-slate-600 dark:text-gray-400 font-medium">
                          {l.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-stretch">
                  {/* Chart */}
                  <div ref={chartContainerRef} className="relative h-64 min-h-[16rem] w-full min-w-0">
                    {chartReady && <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={220}>
                      <BarChart data={chartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="borrowedGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
                            <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.4} />
                          </linearGradient>
                          <linearGradient id="receivedGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                            <stop offset="100%" stopColor="#10B981" stopOpacity={0.4} />
                          </linearGradient>
                          <linearGradient id="interestGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="4 4"
                          stroke={darkMode ? "#1F2937" : "#F1F5F9"}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: darkMode ? "#9CA3AF" : "#64748B", fontSize: 12, fontWeight: 500 }}
                          dy={8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: darkMode ? "#6B7280" : "#94A3B8", fontSize: 11 }}
                          tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={70} animationDuration={900}>
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
                    </ResponsiveContainer>}
                  </div>

                  {/* Right Summary Panel */}
                  <div className="flex lg:flex-col gap-3 lg:border-l lg:border-slate-100 dark:lg:border-gray-800 lg:pl-6">
                    <div className="flex-1 rounded-2xl bg-amber-50/60 dark:bg-amber-900/10 p-3 lg:p-4">
                      <p className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
                        {t("borrowed")}
                      </p>
                      <p className="text-base font-bold text-slate-800 dark:text-white mt-1">
                        {currencySymbol}
                        {stats.totalBorrowed.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-1 rounded-2xl bg-emerald-50/60 dark:bg-emerald-900/10 p-3 lg:p-4">
                      <p className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                        {t("received")}
                      </p>
                      <p className="text-base font-bold text-slate-800 dark:text-white mt-1">
                        {currencySymbol}
                        {stats.totalReceived.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-1 rounded-2xl bg-violet-50/60 dark:bg-violet-900/10 p-3 lg:p-4">
                      <p className="text-[10px] uppercase tracking-wider text-violet-700 dark:text-violet-400 font-bold">
                        {t("interest")}
                      </p>
                      <p className="text-base font-bold text-slate-800 dark:text-white mt-1">
                        {currencySymbol}
                        {stats.totalInterest.toLocaleString()}
                      </p>
                    </div>
                    <div className="hidden lg:flex flex-1 flex-col justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white">
                      <p className="text-[10px] uppercase tracking-wider text-indigo-100 font-bold">
                        {t("collectionRate")}
                      </p>
                      <p className="text-2xl font-bold mt-1">{collectionRate}%</p>
                      <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(collectionRate, 100)}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-white rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* BORROWERS LIST */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm overflow-hidden"
              >
                <div className="p-5 border-b border-slate-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                      {t("activeBorrowers")}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                      {filteredUsers.length} borrower{filteredUsers.length !== 1 ? "s" : ""} tracked
                    </p>
                  </div>
                  <Link
                    to="/add-user"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 hover:scale-[1.02] transition-all"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    {t("addNew")}
                  </Link>
                </div>

                {loading ? (
                  <div className="p-12 flex justify-center items-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                      <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">
                        {t("loadingBorrowers")}
                      </p>
                    </div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <FiUsers className="text-2xl text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">
                      {searchQuery ? "No borrowers match your search" : "No borrowers yet"}
                    </p>
                    {!searchQuery && (
                      <Link
                        to="/add-user"
                        className="inline-flex items-center gap-1 mt-3 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline"
                      >
                        Add your first borrower →
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-gray-800">
                    {filteredUsers.map((u, idx) => (
                      <motion.div
                        key={u._id || u.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                      >
                        <UserCard user={u} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Bottom Spacer */}
              <div className="h-4" />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;