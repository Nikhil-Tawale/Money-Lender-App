import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
  FiChevronRight,
  FiInfo,
  FiCalendar,
  FiActivity,
  FiShield,
  FiZap,
} from "react-icons/fi";
import { User } from "../types";
import { dataService } from "../services/DataServiceFactory";
import { helperService } from "../services/HelperService";

/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface PaymentInput {
  amount: number;
  note: string;
  date: string;
}

/* -------------------------------------------------------------------------- */
/*                             Design Tokens                                  */
/* -------------------------------------------------------------------------- */

const RISK_THRESHOLDS = {
  HIGH: 50000,
  MEDIUM: 20000,
} as const;

const RISK_THEME: Record<
  RiskLevel,
  {
    gradient: string;
    glow: string;
    dot: string;
    label: string;
    ring: string;
    badge: string;
  }
> = {
  HIGH: {
    gradient: "from-rose-500 via-red-500 to-pink-600",
    glow: "shadow-rose-500/40",
    dot: "bg-rose-300",
    label: "text-rose-50",
    ring: "ring-rose-300/40",
    badge: "bg-rose-500/20 border-rose-300/30 text-rose-50",
  },
  MEDIUM: {
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    glow: "shadow-orange-500/40",
    dot: "bg-amber-300",
    label: "text-amber-50",
    ring: "ring-amber-300/40",
    badge: "bg-amber-500/20 border-amber-300/30 text-amber-50",
  },
  LOW: {
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    glow: "shadow-emerald-500/40",
    dot: "bg-emerald-300",
    label: "text-emerald-50",
    ring: "ring-emerald-300/40",
    badge: "bg-emerald-500/20 border-emerald-300/30 text-emerald-50",
  },
};

const getRiskLevel = (remaining: number): RiskLevel => {
  if (remaining > RISK_THRESHOLDS.HIGH) return "HIGH";
  if (remaining > RISK_THRESHOLDS.MEDIUM) return "MEDIUM";
  return "LOW";
};

/* -------------------------------------------------------------------------- */
/*                          Animated Number Component                         */
/* -------------------------------------------------------------------------- */

const AnimatedNumber: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  decimals?: number;
}> = ({
  value,
  prefix = "",
  suffix = "",
  className = "",
  duration = 900,
  decimals = 0,
}) => {
    const [display, setDisplay] = useState(0);
    const frameRef = useRef<number>();
    const startRef = useRef<number>();

    useEffect(() => {
      const start = performance.now();
      startRef.current = start;
      const from = display;
      const delta = value - from;

      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(from + delta * eased);
        if (progress < 1) frameRef.current = requestAnimationFrame(tick);
      };

      frameRef.current = requestAnimationFrame(tick);
      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, duration]);

    const formatted = decimals
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString();

    return (
      <span className={className}>
        {prefix}
        {formatted}
        {suffix}
      </span>
    );
  };

/* -------------------------------------------------------------------------- */
/*                              Stat Card                                     */
/* -------------------------------------------------------------------------- */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  tone?: "neutral" | "success" | "accent" | "warning";
  delay?: number;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  subtext,
  tone = "neutral",
  delay = 0,
  trend,
}) => {
  const config = {
    neutral: {
      bg: "bg-white dark:bg-gray-900",
      border: "border-slate-200/70 dark:border-gray-800",
      iconBg:
        "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30",
      valueColor: "text-slate-900 dark:text-white",
      labelColor: "text-slate-500 dark:text-gray-400",
      accent: "from-blue-500/8 to-transparent",
      trendColor: "text-blue-600 dark:text-blue-400",
    },
    success: {
      bg: "bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30",
      border: "border-emerald-200/70 dark:border-emerald-800/50",
      iconBg:
        "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30",
      valueColor: "text-emerald-900 dark:text-emerald-200",
      labelColor: "text-emerald-700 dark:text-emerald-400",
      accent: "from-emerald-500/12 to-transparent",
      trendColor: "text-emerald-600 dark:text-emerald-400",
    },
    accent: {
      bg: "bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30",
      border: "border-indigo-200/70 dark:border-indigo-800/50",
      iconBg:
        "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/30",
      valueColor: "text-indigo-900 dark:text-indigo-200",
      labelColor: "text-indigo-700 dark:text-indigo-400",
      accent: "from-indigo-500/12 to-transparent",
      trendColor: "text-indigo-600 dark:text-indigo-400",
    },
    warning: {
      bg: "bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30",
      border: "border-amber-200/70 dark:border-amber-800/50",
      iconBg:
        "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30",
      valueColor: "text-amber-900 dark:text-amber-200",
      labelColor: "text-amber-700 dark:text-amber-400",
      accent: "from-amber-500/12 to-transparent",
      trendColor: "text-amber-600 dark:text-amber-400",
    },
  }[tone];

  return (
    <div
      className={`group relative overflow-hidden p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${config.bg} ${config.border}`}
      style={{ animation: `fadeInUp 0.5s ease-out ${delay}ms both` }}
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${config.accent} rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none`}
      />

      <div className="relative z-10 flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${config.iconBg}`}
          >
            {icon}
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${config.labelColor}`}
          >
            {label}
          </span>
        </div>
        {trend && (
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/60 dark:bg-gray-800/60 ${config.trendColor}`}
          >
            {trend}
          </span>
        )}
      </div>

      <p
        className={`text-xl font-bold tracking-tight tabular-nums ${config.valueColor}`}
      >
        {value}
      </p>
      {subtext && (
        <p className={`text-[11px] font-medium mt-1 ${config.labelColor}`}>
          {subtext}
        </p>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  Modal                                     */
/* -------------------------------------------------------------------------- */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  zIndex?: string;
  labelledBy?: string;
  closeOnBackdrop?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  zIndex = "z-50",
  labelledBy,
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-md`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      <div style={{ animation: "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        {children}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

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

  const currencySymbol = helperService.getCurrencySymbol();

  /* ----------------------------- Data Loading ----------------------------- */

  const loadUserDetails = useCallback(async () => {
    if (!id) return;
    try {
      const borrower = await dataService.getUser(id);
      if (!borrower) {
        toast.error("User not found");
        navigate("/");
        return;
      }

      const sortedPayments =
        borrower["payments"]?.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ) ?? [];

      setUser({ ...borrower, payments: sortedPayments } as User);
    } catch {
      toast.error("Failed to load user");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadUserDetails();
  }, [loadUserDetails]);

  /* -------------------------- Derived Values ------------------------------ */

  const remaining = useMemo(
    () => (user ? helperService.calculateUserRemainingAmount(user) : 0),
    [user],
  );
  const totalPayable = useMemo(
    () => (user ? helperService.calculateUserTotalWithInterest(user) : 0),
    [user],
  );
  const interestAmount = useMemo(
    () => totalPayable - (user?.borrowedAmount ?? 0),
    [totalPayable, user],
  );
  const paidAmount = useMemo(
    () => totalPayable - remaining,
    [totalPayable, remaining],
  );
  const progressPercentage = useMemo(() => {
    if (!totalPayable) return 0;
    return Math.min(100, Math.max(0, (paidAmount / totalPayable) * 100));
  }, [paidAmount, totalPayable]);

  const riskLevel = useMemo(() => getRiskLevel(remaining), [remaining]);
  const risk = RISK_THEME[riskLevel];

  const paymentCount = user?.payments?.length ?? 0;

  const avgPayment = useMemo(() => {
    if (!user?.payments?.length) return 0;
    const sum = user.payments.reduce((acc, p) => acc + p.amount, 0);
    return sum / user.payments.length;
  }, [user]);

  const lastPaymentDate = useMemo(() => {
    if (!user?.payments?.length) return null;
    return new Date(user.payments[0].date);
  }, [user]);

  const monthlyInterest = useMemo(
    () => (user ? (user.borrowedAmount * user.interestRate) / 100 / 12 : 0),
    [user],
  );

  // Progress ring
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  /* ----------------------------- Handlers --------------------------------- */

  const closePaymentModal = useCallback(() => {
    if (submitting) return;
    setShowPaymentModal(false);
  }, [submitting]);

  const closeDeleteModal = useCallback(() => {
    if (deleting) return;
    setShowDeleteModal(false);
  }, [deleting]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);

    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amount > remaining) {
      toast.error("Amount exceeds remaining balance");
      return;
    }

    setSubmitting(true);
    try {
      const payment: PaymentInput = {
        amount,
        note: paymentNote,
        date: new Date().toISOString(),
      };
      await dataService.addPayment(id!, payment);

      toast.success("Payment added successfully");
      setShowPaymentModal(false);
      setPaymentAmount("");
      setPaymentNote("");
      await loadUserDetails();
    } catch {
      toast.error("Failed to add payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (deleting || !id) return;
    setDeleting(true);
    try {
      await dataService.deleteUser(id);
      window.dispatchEvent(new Event("users-updated"));
      toast.success("User deleted");
      navigate("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user",
      );
      setDeleting(false);
    }
  };

  /* ----------------------------- Loading UI ------------------------------- */

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/40" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-gray-400 animate-pulse">
            Loading account details...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  /* ------------------------------- Render --------------------------------- */

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        /* Custom scrollbar for the payment history to keep it clean */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
      `}</style>

      {/* MAIN WRAPPER: Locks to viewport height, prevents outer scroll */}
      <div className="h-[100dvh] w-full bg-slate-50 dark:bg-gray-950 px-4 py-4 sm:px-6 lg:px-8 transition-colors duration-300 font-sans flex flex-col overflow-hidden">
        {/* HEADER: Fixed height, doesn't grow */}
        <header
          className="flex justify-between items-center shrink-0 mb-4"
          style={{ animation: "fadeInUp 0.4s ease-out both" }}
        >
          <button
            onClick={() => navigate("/")}
            aria-label="Back to dashboard"
            className="group flex items-center gap-2 px-4 h-10 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-slate-200/70 dark:border-gray-800 text-slate-600 dark:text-gray-300 hover:shadow-md hover:border-slate-300 active:scale-95 transition-all"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-semibold hidden sm:inline">
              Dashboard
            </span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/edit-user/${id}`)}
              aria-label="Edit user"
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/70 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-200 active:scale-95 transition-all"
            >
              <FiEdit className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              aria-label="Delete user"
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-gray-900 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/70 dark:border-gray-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 active:scale-95 transition-all"
            >
              <FiTrash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </header>

        {/* MAIN CONTENT GRID: Fills remaining height */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          {/* LEFT COLUMN: Hero + Total Payable + Stats */}
          <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
            {/* ----------------------------- Hero Card (SMALLER) ---------------------------- */}
            <section
              className={`relative overflow-hidden rounded-[20px] text-white shadow-xl shrink-0 ${risk.glow}`}
              style={{ animation: "fadeInUp 0.5s ease-out 0.05s both" }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${risk.gradient}`}
              />
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/25 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl -ml-12 -mb-12" />
              <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              <div className="relative z-10 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Left: identity */}
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-inner">
                        <FiUser className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <div
                          className={`w-2 h-2 rounded-full ${riskLevel === "LOW"
                              ? "bg-emerald-500"
                              : riskLevel === "MEDIUM"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                        >
                          <div
                            className={`w-full h-full rounded-full ${riskLevel === "LOW"
                                ? "bg-emerald-500"
                                : riskLevel === "MEDIUM"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                            style={{
                              animation: "pulse-ring 1.6s ease-out infinite",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-tight">
                        {user.name}
                      </h1>
                      <p className="text-white/80 font-medium mt-0.5 text-[11px] tabular-nums">
                        {user.phone}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border backdrop-blur-md text-[9px] font-bold tracking-widest uppercase ${risk.badge}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${risk.dot} animate-pulse`}
                          />
                          {t("risk")} ·{" "}
                          {riskLevel === "LOW"
                            ? t("riskLow")
                            : riskLevel === "MEDIUM"
                              ? t("riskMedium")
                              : t("riskHigh")}
                        </div>

                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-[9px] font-bold tracking-widest uppercase">
                          <FiShield className="w-2.5 h-2.5" />
                          Verified
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress ring */}
                  <div className="relative flex items-center justify-center self-center sm:self-auto">
                    <svg
                      className="w-20 h-20 transform -rotate-90"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient
                          id="progressGrad"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="white" stopOpacity="1" />
                          <stop
                            offset="100%"
                            stopColor="white"
                            stopOpacity="0.7"
                          />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="url(#progressGrad)"
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{
                          filter: "drop-shadow(0 0 6px rgba(255,255,255,0.55))",
                        }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-lg font-bold leading-none tabular-nums">
                        {Math.round(progressPercentage)}
                        <span className="text-[10px]">%</span>
                      </span>
                      <span className="text-[8px] uppercase tracking-[0.15em] text-white/75 font-bold mt-0.5">
                        {t("paid")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom row: mini KPIs */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/15 pt-3.5">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/60 font-bold">
                      Outstanding
                    </p>
                    <p className="text-sm font-bold mt-0.5 tabular-nums">
                      {currencySymbol}
                      {remaining.toLocaleString()}
                    </p>
                  </div>
                  <div className="border-l border-white/15 pl-3">
                    <p className="text-[9px] uppercase tracking-widest text-white/60 font-bold">
                      Paid
                    </p>
                    <p className="text-sm font-bold mt-0.5 tabular-nums">
                      {currencySymbol}
                      {paidAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="border-l border-white/15 pl-3">
                    <p className="text-[9px] uppercase tracking-widest text-white/60 font-bold">
                      Payments
                    </p>
                    <p className="text-sm font-bold mt-0.5 tabular-nums">
                      {paymentCount}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ------------------------ Total Payable Banner (SMALLER) ---------------------- */}
            <section
              className="relative overflow-hidden rounded-[20px] p-4 text-white shadow-xl shadow-indigo-500/20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 ring-1 ring-white/10 shrink-0"
              style={{ animation: "fadeInUp 0.5s ease-out 0.1s both" }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -ml-12 -mb-12" />

              <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center">
                      <FiActivity className="w-3 h-3 text-indigo-200" />
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/70 font-bold">
                      {t("totalPayable") || "Total Payable"}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[9px] font-bold text-emerald-200 uppercase tracking-wider">
                    <FiZap className="w-2.5 h-2.5" />
                    Active
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                  <div>
                    <p className="text-3xl font-bold tracking-tight tabular-nums">
                      <AnimatedNumber
                        value={totalPayable}
                        prefix={currencySymbol}
                      />
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]" />
                        <div>
                          <p className="text-[8px] uppercase tracking-widest text-white/50 font-bold">
                            Principal
                          </p>
                          <p className="text-[11px] font-bold tabular-nums text-white/90">
                            {currencySymbol}
                            {user.borrowedAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <span className="text-white/30">·</span>

                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_6px_rgba(232,121,249,0.6)]" />
                        <div>
                          <p className="text-[8px] uppercase tracking-widest text-white/50 font-bold">
                            Interest ({user.interestRate}%)
                          </p>
                          <p className="text-[11px] font-bold tabular-nums text-white/90">
                            {currencySymbol}
                            {interestAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-1 gap-2">
                    <div className="bg-white/8 backdrop-blur-md rounded-lg px-3 py-2 border border-white/15">
                      <p className="text-[8px] uppercase tracking-widest text-white/60 font-bold">
                        Paid
                      </p>
                      <p className="text-xs font-bold mt-0.5 tabular-nums text-emerald-300">
                        <AnimatedNumber
                          value={paidAmount}
                          prefix={currencySymbol}
                        />
                      </p>
                    </div>
                    <div className="bg-white/8 backdrop-blur-md rounded-lg px-3 py-2 border border-white/15">
                      <p className="text-[8px] uppercase tracking-widest text-white/60 font-bold">
                        Outstanding
                      </p>
                      <p className="text-xs font-bold mt-0.5 tabular-nums text-white">
                        <AnimatedNumber
                          value={remaining}
                          prefix={currencySymbol}
                        />
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5 text-[9px] font-semibold">
                    <span className="text-white/60">
                      {Math.round(progressPercentage)}% completed
                    </span>
                    <span className="text-white/60">
                      {currencySymbol}
                      {remaining.toLocaleString()} to go
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ----------------------------- Stats Grid --------------------------- */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
              <StatCard
                icon={<FiTrendingUp className="w-4 h-4" />}
                label="Principal"
                value={`${currencySymbol}${user.borrowedAmount.toLocaleString()}`}
                delay={150}
              />
              <StatCard
                icon={<FiPercent className="w-4 h-4" />}
                label="Interest"
                value={`${user.interestRate}%`}
                subtext={`+ ${currencySymbol}${interestAmount.toLocaleString()}`}
                tone="warning"
                delay={200}
                trend={`${currencySymbol}${Math.round(monthlyInterest).toLocaleString()}/mo`}
              />
              <StatCard
                icon={
                  <span className="text-sm font-bold leading-none">
                    {currencySymbol}
                  </span>
                }
                label="Avg Payment"
                value={`${currencySymbol}${Math.round(avgPayment).toLocaleString()}`}
                subtext={`${paymentCount} ${paymentCount === 1 ? "payment" : "payments"}`}
                tone="success"
                delay={250}
              />
              <StatCard
                icon={<FiClock className="w-4 h-4" />}
                label="Outstanding"
                value={`${currencySymbol}${remaining.toLocaleString()}`}
                subtext={
                  lastPaymentDate
                    ? `Last: ${lastPaymentDate.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}`
                    : "No payments yet"
                }
                tone="accent"
                delay={300}
              />
            </section>
          </div>

          {/* RIGHT COLUMN: Payment History */}
          <div className="lg:col-span-4 flex flex-col min-h-0">
            <section
              className="bg-white dark:bg-gray-900 rounded-[24px] shadow-sm border border-slate-200/70 dark:border-gray-800 overflow-hidden flex flex-col h-full"
              style={{ animation: "fadeInUp 0.5s ease-out 0.35s both" }}
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-gray-800 shrink-0">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-indigo-500" />
                      <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        {t("paymentHistory")}
                      </h2>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5 ml-6">
                      {paymentCount}{" "}
                      {paymentCount === 1 ? "transaction" : "transactions"} on
                      record
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 active:scale-95 transition-all"
                  >
                    <FiPlus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="hidden sm:inline">{t("addPayment")}</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>

              {/* Body: Scrollable internally */}
              <div className="p-5 flex-1 overflow-y-auto custom-scrollbar min-h-0">
                {!user.payments || user.payments.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-gray-700 h-full flex flex-col justify-center items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <FiClock className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-300 font-semibold">
                      {t("noPayments")}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                      {t("noPaymentsDesc")}
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-emerald-300 via-indigo-300 to-transparent dark:from-emerald-800 dark:via-indigo-900" />

                    <div className="space-y-2.5">
                      {user.payments.map((p, i) => (
                        <div
                          key={`${p.date}-${i}`}
                          className="relative pl-8"
                          style={{
                            animation: `fadeInUp 0.4s ease-out ${400 + i * 50
                              }ms both`,
                          }}
                        >
                          {/* Dot */}
                          <div className="absolute left-0 top-2.5 w-6 h-6 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm border border-slate-200 dark:border-gray-700">
                            <FiCheckCircle className="w-3 h-3 text-emerald-500" />
                          </div>

                          <div className="group flex justify-between items-center bg-slate-50/70 dark:bg-gray-800/40 rounded-xl p-3 border border-slate-200/60 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 transition-all">
                            <div className="min-w-0 flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/15 dark:to-teal-500/15 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold leading-none text-emerald-600 dark:text-emerald-400">
                                  {currencySymbol}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-slate-900 dark:text-white tracking-tight tabular-nums">
                                  {currencySymbol}
                                  {p.amount.toLocaleString()}
                                </p>
                                {p.note && (
                                  <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 truncate">
                                    {p.note}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <span className="inline-block text-[10px] font-bold text-slate-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-2 py-1 rounded-md border border-slate-200/80 dark:border-gray-700 tabular-nums">
                                {new Date(p.date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {remaining > 0 && (
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-2.5 w-6 h-6 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-gray-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-gray-600 animate-pulse" />
                          </div>
                          <div className="flex justify-between items-center bg-white dark:bg-gray-900 rounded-xl p-3 border border-dashed border-slate-300 dark:border-gray-700">
                            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
                              Next payment pending
                            </p>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded-md tabular-nums">
                              {currencySymbol}
                              {remaining.toLocaleString()} left
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Reminder Banner */}
            {user.enableReminder && (
              <div
                className="mt-3 relative overflow-hidden p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/70 dark:border-amber-800/40 flex items-center gap-2 shadow-sm shrink-0"
                style={{ animation: "fadeInUp 0.5s ease-out 0.45s both" }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5 -translate-x-full"
                  style={{
                    backgroundSize: "200% 100%",
                    animation: "shimmer 3s ease-in-out infinite",
                  }}
                />
                <div className="relative p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-lg shadow-amber-500/30">
                  <FiBell className="w-4 h-4 text-white animate-bounce" />
                </div>
                <p className="relative text-xs font-semibold text-amber-900 dark:text-amber-200">
                  {t("reminderSetForDay").replace(
                    "{day}",
                    String(user.reminderDay),
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------- Payment Modal ---------------------------- */}
      <Modal
        open={showPaymentModal}
        onClose={closePaymentModal}
        labelledBy="add-payment-title"
      >
        <form
          onSubmit={handleAddPayment}
          className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl border border-slate-200/70 dark:border-gray-800 overflow-hidden"
        >
          {/* Header */}
          <div className="relative px-6 sm:px-8 pt-6 pb-5 border-b border-slate-100 dark:border-gray-800 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closePaymentModal}
                aria-label="Close payment form"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-800 transition"
              >
                <FiArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2
                  id="add-payment-title"
                  className="text-lg font-bold text-slate-900 dark:text-white tracking-tight"
                >
                  {t("addPayment")}
                </h2>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 tabular-nums">
                  {currencySymbol}
                  {remaining.toLocaleString()} outstanding
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            <label className="block">
              <span className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-gray-400">
                <span>{t("paymentAmount")}</span>
                <button
                  type="button"
                  onClick={() => setPaymentAmount(String(remaining))}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline normal-case tracking-normal"
                >
                  Pay full · {currencySymbol}
                  {remaining.toLocaleString()}
                </button>
              </span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  autoFocus
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/60 px-4 py-4 pl-11 text-2xl font-bold text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800/60 dark:text-white dark:focus:border-indigo-500 tabular-nums"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-gray-400">
                {t("paymentNote")}
              </span>
              <textarea
                rows={3}
                className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50/60 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800/60 dark:text-white dark:focus:border-indigo-500"
                placeholder={t("addPaymentNote")}
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {[1000, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPaymentAmount(String(amt))}
                  disabled={amt > remaining}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition tabular-nums"
                >
                  {currencySymbol}
                  {amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <button
              disabled={submitting}
              className="group w-full rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-4 font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:shadow-xl hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t("processing")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 justify-center">
                  {t("confirmPayment")}
                  <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ---------------------------- Delete Modal ---------------------------- */}
      <Modal
        open={showDeleteModal}
        onClose={closeDeleteModal}
        zIndex="z-[60]"
        labelledBy="delete-user-title"
        closeOnBackdrop={!deleting}
      >
        <div className="w-full max-w-sm rounded-[28px] border border-slate-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center shadow-2xl overflow-hidden">
          <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-950/50 dark:to-red-950/50 text-rose-600 dark:text-rose-400 shadow-inner">
            <div className="absolute inset-0 rounded-2xl bg-rose-500/10 blur-xl" />
            <FiAlertTriangle className="relative h-8 w-8" />
          </div>

          <h2
            id="delete-user-title"
            className="text-xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            {t("deleteBorrower")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-gray-400">
            {t("deleteUserDescription")}{" "}
            <span className="font-bold text-slate-800 dark:text-gray-100">
              {user.name}
            </span>
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={deleting}
              onClick={closeDeleteModal}
              className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 active:scale-95 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteUser}
              className="rounded-2xl bg-gradient-to-br from-rose-600 to-red-600 px-4 py-3 font-semibold text-white shadow-lg shadow-rose-600/30 transition hover:shadow-xl hover:shadow-rose-600/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? t("deleting") : t("deleteUser")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserDetails;
