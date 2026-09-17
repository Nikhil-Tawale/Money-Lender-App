import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiGlobe,
  FiMoon,
  FiSun,
  FiUser,
  FiBell,
  FiShield,
  FiLogOut,
  FiChevronRight,
  FiCheck,
  FiInfo,
  FiMail,
  FiPhone,
  FiLock,
  FiFileText,
  FiSmartphone,
  FiX,
  FiSave,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiArrowLeft
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useLanguage, Language } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

/* ============================================================
   FLAG COMPONENTS
   ============================================================ */
const UKFlag: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
    <clipPath id="uk-clip">
      <rect width="60" height="30" />
    </clipPath>
    <g clipPath="url(#uk-clip)">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

const IndiaFlag: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 60 40" className={className} aria-hidden="true">
    <rect width="60" height="13.33" fill="#FF9933" />
    <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
    <rect y="26.66" width="60" height="13.34" fill="#138808" />
    <circle cx="30" cy="20" r="5" fill="none" stroke="#000080" strokeWidth="0.8" />
    <circle cx="30" cy="20" r="1" fill="#000080" />
  </svg>
);

/* ============================================================
   SETTINGS PAGE
   ============================================================ */
const Settings: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /* ---- Notification preferences (persisted) ---- */
  const [pushEnabled, setPushEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("pushNotifications");
    return saved === null ? true : saved === "true";
  });

  const [emailEnabled, setEmailEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("emailReminders");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("pushNotifications", String(pushEnabled));
  }, [pushEnabled]);

  useEffect(() => {
    localStorage.setItem("emailReminders", String(emailEnabled));
  }, [emailEnabled]);

  /* ---- Modal state ---- */
  const [activeModal, setActiveModal] = useState<
    "changePassword" | "privacy" | "terms" | "about" | "editProfile" | null
  >(null);

  const closeModal = () => setActiveModal(null);

  const languageOptions: {
    value: Language;
    label: string;
    native: string;
    region: string;
    Flag: React.FC<{ className?: string }>;
  }[] = [
    { value: "en", label: t("english"), native: "English", region: "Global", Flag: UKFlag },
    { value: "hi", label: t("hindi"), native: "हिन्दी", region: "India", Flag: IndiaFlag },
    { value: "mr", label: t("marathi"), native: "मराठी", region: "India", Flag: IndiaFlag },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handlePushToggle = () => {
    const next = !pushEnabled;
    setPushEnabled(next);
    toast.success(next ? "Push notifications on" : "Push notifications off");
  };

  const handleEmailToggle = () => {
    const next = !emailEnabled;
    setEmailEnabled(next);
    toast.success(next ? "Email reminders on" : "Email reminders off");
  };

  return (
    <>
      <style>{`
        .settings-scroll::-webkit-scrollbar { width: 4px; }
        .settings-scroll::-webkit-scrollbar-track { background: transparent; }
        .settings-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1; border-radius: 4px;
        }
        .dark .settings-scroll::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>

      {/* VIEWPORT-LOCKED WRAPPER */}
      <div className="h-[100dvh] w-full bg-slate-50 dark:bg-gray-950 transition-colors duration-300 font-sans flex flex-col overflow-hidden">
        <button
          onClick={() => navigate("/")}
          aria-label="Back to dashboard"
          className="group flex items-center gap-2 px-4 h-10 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-slate-200/70 dark:border-gray-800 text-slate-600 dark:text-gray-300 hover:shadow-md hover:border-slate-300 active:scale-95 transition-all mb-4 w-fit shrink-0"
        >
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-semibold hidden sm:inline">
            Dashboard
          </span>
        </button>
        <div className="w-[100%] max-w-4xl flex flex-col h-full px-5 sm:px-6 pt-6">
          {/* ==================== PAGE HEADER ==================== */}
          <div className="mb-6 shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
              {t("preferences")}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t("settingsTitle")}
            </h1>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-gray-400">
              {t("settingsSubtitle")}
            </p>
          </div>

          {/* ==================== SCROLLABLE CONTENT ==================== */}
          <div className="flex-1 min-h-0 overflow-y-auto settings-scroll pr-1 -mr-1">
            <div className="space-y-5 pb-8">
              {/* ==================== ACCOUNT ==================== */}
              <Section
                icon={<FiUser />}
                title={t("account") || "Account"}
                description="Your profile and personal information"
              >
                <div className="flex items-center gap-3.5 px-5 py-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-base shadow-md shadow-indigo-500/25">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {user?.name || "LendFlow user"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">
                      {user?.email || "user@lendflow.app"}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModal("editProfile")}
                    className="hidden sm:inline-flex h-8 items-center px-3.5 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-200 text-xs font-semibold active:scale-[0.98] md:hover:bg-slate-200 md:dark:hover:bg-gray-700 transition-all"
                  >
                    Edit
                  </button>
                </div>
                <RowDivider />
                <ActionRow
                  icon={<FiMail />}
                  label="Email"
                  value={user?.email || "—"}
                />
                <RowDivider />
                <ActionRow icon={<FiPhone />} label="Phone" value="Not set" />
                <RowDivider />
                <ActionRow
                  icon={<FiLock />}
                  label="Password"
                  value="••••••••"
                  action={
                    <button
                      onClick={() => setActiveModal("changePassword")}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 md:hover:underline"
                    >
                      Change
                    </button>
                  }
                />
              </Section>

              {/* ==================== APPEARANCE ==================== */}
              <Section
                icon={<FiSun />}
                title={t("appearance") || "Appearance"}
                description="How LendFlow looks on your device"
              >
                <Row
                  icon={darkMode ? <FiMoon /> : <FiSun />}
                  iconBg={
                    darkMode
                      ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300"
                  }
                  title={t("darkMode")}
                  description={t("darkModeDescription")}
                  right={
                    <Toggle
                      checked={darkMode}
                      onChange={() => {
                        toggleDarkMode();
                        toast.success(
                          darkMode ? "Light mode on" : "Dark mode on",
                        );
                      }}
                    />
                  }
                />
                <RowDivider />
                <div className="px-5 py-4">
                  <h3 className="text-[13px] font-semibold text-slate-800 dark:text-white">
                    Theme preview
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 mb-3">
                    Tap a theme to apply it
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <ThemePreviewCard
                      label="Light"
                      selected={!darkMode}
                      onClick={() => {
                        if (darkMode) {
                          toggleDarkMode();
                          toast.success("Light mode on");
                        }
                      }}
                      variant="light"
                    />
                    <ThemePreviewCard
                      label="Dark"
                      selected={darkMode}
                      onClick={() => {
                        if (!darkMode) {
                          toggleDarkMode();
                          toast.success("Dark mode on");
                        }
                      }}
                      variant="dark"
                    />
                  </div>
                </div>
              </Section>

              {/* ==================== LANGUAGE ==================== */}
              <Section
                icon={<FiGlobe />}
                title={t("language")}
                description={t("languageDescription")}
              >
                <div className="divide-y divide-slate-100 dark:divide-gray-800">
                  {languageOptions.map((option) => {
                    const selected = language === option.value;
                    const Flag = option.Flag;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setLanguage(option.value);
                          toast.success(`Language: ${option.native}`);
                        }}
                        className={`w-full min-h-[56px] flex items-center justify-between gap-3 px-5 py-3 text-left transition-colors ${
                          selected
                            ? "bg-indigo-50/60 dark:bg-indigo-900/10"
                            : "active:bg-slate-50 dark:active:bg-gray-800/50 md:hover:bg-slate-50 md:dark:hover:bg-gray-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center overflow-hidden transition-all ${
                              selected
                                ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
                                : "ring-1 ring-slate-200 dark:ring-gray-700"
                            }`}
                          >
                            <Flag className="w-full h-full" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                              {option.label}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">
                              {option.native} · {option.region}
                            </p>
                          </div>
                        </div>
                        {selected ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-500/30"
                          >
                            <FiCheck className="w-3 h-3 text-white" />
                          </motion.div>
                        ) : (
                          <div className="w-5 h-5 shrink-0 rounded-full border-2 border-slate-200 dark:border-gray-700" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* ==================== NOTIFICATIONS ==================== */}
              <Section
                icon={<FiBell />}
                title={t("notifications") || "Notifications"}
                description="Manage when and how you're notified"
              >
                <Row
                  icon={<FiSmartphone />}
                  iconBg="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"
                  title="Push notifications"
                  description="Get alerts for due and overdue loans"
                  right={
                    <Toggle checked={pushEnabled} onChange={handlePushToggle} />
                  }
                />
                <RowDivider />
                <Row
                  icon={<FiMail />}
                  iconBg="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300"
                  title="Reminder emails"
                  description="Receive email reminders before due dates"
                  right={
                    <Toggle
                      checked={emailEnabled}
                      onChange={handleEmailToggle}
                    />
                  }
                />
                <RowDivider />
                <NavRow
                  title={t("reminderPreferences") || "Reminder preferences"}
                  description="Manage schedule and frequency"
                  onClick={() => navigate("/reminders")}
                />
              </Section>

              {/* ==================== PRIVACY & SECURITY ==================== */}
              <Section
                icon={<FiShield />}
                title={t("privacySecurity") || "Privacy & Security"}
                description="Control your data and account security"
              >
                <NavRow
                  icon={<FiLock />}
                  title={t("changePassword") || "Change password"}
                  description="Update your account password"
                  onClick={() => setActiveModal("changePassword")}
                />
                <RowDivider />
                <NavRow
                  icon={<FiFileText />}
                  title={t("privacyPolicy") || "Privacy policy"}
                  description="How we handle your data"
                  onClick={() => setActiveModal("privacy")}
                />
                <RowDivider />
                <NavRow
                  icon={<FiFileText />}
                  title={t("termsOfService") || "Terms of service"}
                  description="Our terms and conditions"
                  onClick={() => setActiveModal("terms")}
                />
                <RowDivider />
                <NavRow
                  icon={<FiInfo />}
                  title={t("about") || "About LendFlow"}
                  description="Version 1.0.0"
                  onClick={() => setActiveModal("about")}
                />
              </Section>

              {/* ==================== SESSION ==================== */}
              <Section
                icon={<FiLogOut />}
                title="Session"
                description="Sign out of your account on this device"
              >
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full min-h-[52px] flex items-center justify-center gap-2 px-5 py-3.5 text-rose-600 dark:text-rose-400 font-semibold text-sm active:bg-rose-50 dark:active:bg-rose-900/20 md:hover:bg-rose-50 md:dark:hover:bg-rose-900/20 transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  {t("logout")}
                </button>
              </Section>

              {/* ==================== FOOTER ==================== */}
              <div className="text-center pt-2 pb-4">
                <p className="text-[11px] text-slate-400 dark:text-gray-600">
                  LendFlow · v1.0.0
                </p>
                <Link
                  to="/"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 md:hover:underline"
                >
                  {t("backToDashboard") || "Back to dashboard"}
                  <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}
      <AnimatePresence>
        {activeModal === "changePassword" && (
          <ChangePasswordModal onClose={closeModal} />
        )}
        {activeModal === "privacy" && (
          <InfoModal
            title="Privacy Policy"
            onClose={closeModal}
            content={
              <>
                <p>
                  At LendFlow, we take your privacy seriously. We collect only
                  the information necessary to provide our lending management
                  services.
                </p>
                <p className="mt-3">
                  <strong>What we collect:</strong> Borrower names, contact
                  details, loan amounts, and payment history. All data is stored
                  securely and never shared with third parties without your
                  consent.
                </p>
                <p className="mt-3">
                  <strong>How we use it:</strong> To help you track loans, send
                  reminders, and generate reports. You retain full ownership of
                  your data.
                </p>
                <p className="mt-3">
                  <strong>Contact:</strong> For privacy concerns, email us at
                  privacy@lendflow.app
                </p>
              </>
            }
          />
        )}
        {activeModal === "terms" && (
          <InfoModal
            title="Terms of Service"
            onClose={closeModal}
            content={
              <>
                <p>By using LendFlow, you agree to the following terms:</p>
                <p className="mt-3">
                  <strong>1. Use of Service:</strong> LendFlow is a personal
                  loan tracking tool. You are responsible for the accuracy of
                  the data you enter.
                </p>
                <p className="mt-3">
                  <strong>2. Account Security:</strong> You are responsible for
                  maintaining the confidentiality of your account credentials.
                </p>
                <p className="mt-3">
                  <strong>3. Limitations:</strong> LendFlow is not a licensed
                  financial institution. We do not provide legal or financial
                  advice.
                </p>
                <p className="mt-3">
                  <strong>4. Changes:</strong> We may update these terms from
                  time to time. Continued use constitutes acceptance.
                </p>
              </>
            }
          />
        )}
        {activeModal === "about" && (
          <InfoModal
            title="About LendFlow"
            onClose={closeModal}
            content={
              <>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3">
                    <span className="text-2xl text-white font-bold">₹</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    LendFlow
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                    Version 1.0.0
                  </p>
                </div>
                <p className="text-center">
                  A modern lending management app for small business owners,
                  money lenders, and personal loan trackers.
                </p>
                <p className="text-center mt-3">
                  Built with ❤️ for simplified lending.
                </p>
              </>
            }
          />
        )}
        {activeModal === "editProfile" && user && (
          <EditProfileModal
            initialName={user.name || ""}
            initialEmail={user.email || ""}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </>
  );
};

/* ============================================================
   SUBCOMPONENTS
   ============================================================ */

const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ icon, title, description, children }) => (
  <section>
    <div className="flex items-start gap-3 mb-2.5 px-1">
      <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 flex items-center justify-center text-sm mt-0.5">
        {icon}
      </div>
      <div>
        <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
    <div className="rounded-2xl border border-slate-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {children}
    </div>
  </section>
);

const Row: React.FC<{
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  description?: string;
  right: React.ReactNode;
}> = ({ icon, iconBg, title, description, right }) => (
  <div className="flex items-center justify-between gap-4 px-5 py-4 min-h-[56px]">
    <div className="flex items-start gap-3.5 min-w-0 flex-1">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
          iconBg ||
          "bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-gray-400"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-[13px] text-slate-800 dark:text-white truncate">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
    <div className="shrink-0">{right}</div>
  </div>
);

const ActionRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  action?: React.ReactNode;
}> = ({ icon, label, value, action }) => (
  <div className="flex items-center justify-between gap-4 px-5 py-3.5 min-h-[52px]">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <span className="text-slate-400 dark:text-gray-500 text-sm shrink-0">
        {icon}
      </span>
      <span className="text-[13px] text-slate-500 dark:text-gray-400 shrink-0">
        {label}
      </span>
    </div>
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-[13px] font-semibold text-slate-800 dark:text-white truncate">
        {value}
      </span>
      {action}
    </div>
  </div>
);

const NavRow: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full min-h-[52px] flex items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors active:bg-slate-50 dark:active:bg-gray-800/50 md:hover:bg-slate-50 md:dark:hover:bg-gray-800/50"
  >
    <div className="flex items-center gap-3.5 min-w-0 flex-1">
      {icon && (
        <span className="text-slate-400 dark:text-gray-500 text-sm shrink-0">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-slate-800 dark:text-white truncate">
          {title}
        </p>
        {description && (
          <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
    <FiChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
  </button>
);

const RowDivider = () => (
  <div className="h-px bg-slate-100 dark:bg-gray-800 ml-5" />
);

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({
  checked,
  onChange,
}) => (
  <button
    type="button"
    onClick={onChange}
    role="switch"
    aria-checked={checked}
    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
      checked ? "bg-indigo-600" : "bg-slate-300 dark:bg-gray-700"
    }`}
  >
    <span
      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
        checked ? "left-5" : "left-0.5"
      }`}
    />
  </button>
);

const ThemePreviewCard: React.FC<{
  label: string;
  selected: boolean;
  onClick: () => void;
  variant: "light" | "dark";
}> = ({ label, selected, onClick, variant }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative rounded-xl border-2 overflow-hidden transition-all text-left ${
      selected
        ? "border-indigo-500 ring-4 ring-indigo-500/10"
        : "border-slate-200 dark:border-gray-700"
    }`}
  >
    <div
      className={`p-2.5 ${
        variant === "light"
          ? "bg-white"
          : "bg-gradient-to-br from-slate-800 to-slate-900"
      }`}
    >
      <div
        className={`h-[72px] rounded-lg ${
          variant === "light" ? "bg-slate-100" : "bg-slate-700"
        } flex flex-col justify-center px-3 gap-1.5`}
      >
        <div
          className={`h-1.5 rounded-full w-14 ${
            variant === "light" ? "bg-slate-300" : "bg-slate-500"
          }`}
        />
        <div
          className={`h-1.5 rounded-full w-9 ${
            variant === "light" ? "bg-slate-200" : "bg-slate-600"
          }`}
        />
        <div
          className={`h-1.5 rounded-full w-11 ${
            variant === "light" ? "bg-slate-200" : "bg-slate-600"
          }`}
        />
      </div>
    </div>
    <div
      className={`px-3 py-1.5 text-[11px] font-semibold flex items-center justify-between ${
        variant === "light"
          ? "bg-slate-50 text-slate-700"
          : "bg-slate-950 text-slate-200"
      }`}
    >
      <span>{label}</span>
      {selected && (
        <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 flex items-center justify-center">
          <FiCheck className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </div>
  </button>
);

/* ============================================================
   MODAL WRAPPER
   ============================================================ */
const ModalWrapper: React.FC<{
  children: React.ReactNode;
  onClose: () => void;
}> = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="w-full sm:max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-gray-800 max-h-[90dvh] overflow-y-auto"
      style={{
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      {children}
    </motion.div>
  </motion.div>
);

/* ============================================================
   CHANGE PASSWORD MODAL
   ============================================================ */
const ChangePasswordModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    // TODO: wire this to your auth service (dataService.changePassword or similar)
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Password updated");
      onClose();
    }, 800);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-gray-800 px-5 py-4 flex items-center justify-between rounded-t-3xl z-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Change Password
        </h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 active:bg-slate-100 dark:active:bg-gray-800 transition-colors"
        >
          <FiX />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <PasswordField
          label="Current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          onToggle={() => setShowCurrent(!showCurrent)}
        />
        <PasswordField
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggle={() => setShowNew(!showNew)}
          hint="At least 6 characters"
        />
        <PasswordField
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showNew}
          onToggle={() => setShowNew(!showNew)}
          match={confirmPassword.length > 0 ? newPassword === confirmPassword : undefined}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[52px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4" />
              Update password
            </>
          )}
        </button>
      </form>
    </ModalWrapper>
  );
};

const PasswordField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  hint?: string;
  match?: boolean;
}> = ({ label, value, onChange, show, onToggle, hint, match }) => (
  <div>
    <label className="text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1.5 block ml-1">
      {label}
    </label>
    <div className="relative">
      <FiLock className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none transition text-base ${
          match === false
            ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
            : match === true
              ? "border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              : "border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-indigo-500/10"
        }`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-3.5 text-slate-400 active:text-indigo-600 transition-colors"
      >
        {show ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
      </button>
    </div>
    {hint && !value && (
      <p className="text-[11px] text-slate-400 mt-1 ml-1">{hint}</p>
    )}
    {match === false && (
      <p className="text-[11px] text-rose-500 mt-1 ml-1 font-medium flex items-center gap-1">
        <FiAlertCircle className="w-3 h-3" /> Passwords do not match
      </p>
    )}
  </div>
);

/* ============================================================
   INFO MODAL (Privacy / Terms / About)
   ============================================================ */
const InfoModal: React.FC<{
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}> = ({ title, content, onClose }) => (
  <ModalWrapper onClose={onClose}>
    <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-gray-800 px-5 py-4 flex items-center justify-between rounded-t-3xl z-10">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h2>
      <button
        onClick={onClose}
        aria-label="Close"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 active:bg-slate-100 dark:active:bg-gray-800 transition-colors"
      >
        <FiX />
      </button>
    </div>
    <div className="p-5 text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
      {content}
    </div>
    <div className="px-5 pb-5">
      <button
        onClick={onClose}
        className="w-full min-h-[52px] rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-200 font-semibold text-sm active:scale-[0.98] transition-transform"
      >
        Got it
      </button>
    </div>
  </ModalWrapper>
);

/* ============================================================
   EDIT PROFILE MODAL
   ============================================================ */
const EditProfileModal: React.FC<{
  initialName: string;
  initialEmail: string;
  onClose: () => void;
}> = ({ initialName, initialEmail, onClose }) => {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }

    setSubmitting(true);
    // TODO: wire this to your auth service (dataService.updateProfile)
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Profile updated");
      onClose();
    }, 800);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-gray-800 px-5 py-4 flex items-center justify-between rounded-t-3xl z-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Edit Profile
        </h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 active:bg-slate-100 dark:active:bg-gray-800 transition-colors"
        >
          <FiX />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1.5 block ml-1">
            Full name
          </label>
          <div className="relative">
            <FiUser className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none transition text-base focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1.5 block ml-1">
            Email address
          </label>
          <div className="relative">
            <FiMail className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none transition text-base focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[52px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4" />
              Save changes
            </>
          )}
        </button>
      </form>
    </ModalWrapper>
  );
};

export default Settings;