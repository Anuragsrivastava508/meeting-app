import { useState, useCallback, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, Video, AlertCircle } from "lucide-react";

/**
 * Form validation schema
 */
const VALIDATION_RULES = {
  email: {
    required: "Email is required",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
  },
  password: {
    required: "Password is required",
    minLength: 6,
    message: "Password must be at least 6 characters",
  },
};

/**
 * Validate form field
 */
const validateField = (name, value) => {
  const rules = VALIDATION_RULES[name];
  if (!rules) return null;

  if (!value && rules.required) {
    return rules.required;
  }

  if (rules.pattern && value && !rules.pattern.test(value)) {
    return rules.message;
  }

  if (rules.minLength && value && value.length < rules.minLength) {
    return rules.message;
  }

  return null;
};

/**
 * Features data configuration
 */
const FEATURES = [
  { icon: "🎥", label: "HD Video Meetings" },
  { icon: "💬", label: "Real-time Chat" },
  { icon: "⚡", label: "Instant Join Links" },
  { icon: "🔒", label: "Secure Platform" },
];

/**
 * Branding component
 */
const BrandSection = () => (
  <div className="mb-12 lg:mb-16">
    <div className="flex items-center gap-3 mb-12">
      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center transform transition-transform hover:scale-105">
        <Video size={28} className="text-white" />
      </div>
      <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
        QuickMeet
      </span>
    </div>

    <div className="space-y-3 lg:space-y-4">
      <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
        Welcome back 👋
      </h1>
      <p className="text-base lg:text-lg text-white/80 leading-relaxed max-w-sm">
        Log in to continue your meetings and stay connected with your team.
      </p>
    </div>
  </div>
);

/**
 * Features list component
 */
const FeaturesList = () => (
  <div className="space-y-3">
    {FEATURES.map(({ icon, label }) => (
      <div
        key={label}
        className="flex items-center gap-3 p-3 lg:p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/15 transition-colors duration-200"
      >
        <span className="text-xl lg:text-2xl flex-shrink-0">{icon}</span>
        <span className="text-sm lg:text-base font-500 text-white/90">{label}</span>
      </div>
    ))}
  </div>
);

/**
 * Left sidebar component
 */
const LeftSidebar = () => (
  <div className="hidden lg:flex flex-col flex-1 justify-center px-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700">
    <div className="max-w-md">
      <BrandSection />
      <FeaturesList />
    </div>
  </div>
);

/**
 * Input field component with validation
 */
const InputField = ({
  label,
  type = "text",
  icon: Icon,
  value,
  onChange,
  error,
  showPassword,
  onTogglePassword,
  placeholder,
  disabled,
  ...props
}) => (
  <div className="space-y-2">
    <label htmlFor={label} className="block text-sm font-semibold text-gray-700">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon size={18} className="text-gray-400" />
      </div>

      <input
        id={label}
        type={type === "password" && showPassword ? "text" : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
        className={`w-full pl-12 pr-4 py-3 rounded-xl border-1.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 bg-gray-50 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
            : "border-gray-200 focus:border-purple-500 focus:ring-purple-200"
        } ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}`}
        {...props}
      />

      {type === "password" && (
        <button
          type="button"
          onClick={onTogglePassword}
          disabled={disabled}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>

    {error && (
      <div
        id={`${label}-error`}
        className="flex items-center gap-2 mt-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"
      >
        <AlertCircle size={16} className="flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

/**
 * Login form component
 */
const LoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });

  const { login, isLogingIn, error: loginError } = useAuthStore();

  const isFormValid = useMemo(
    () =>
      formData.email &&
      formData.password &&
      !errors.email &&
      !errors.password,
    [formData, errors]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  }, [touched]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate all fields
      const emailError = validateField("email", formData.email);
      const passwordError = validateField("password", formData.password);

      setErrors({ email: emailError, password: passwordError });
      setTouched({ email: true, password: true });

      if (!emailError && !passwordError) {
        const success = await login(formData);
        if (success) {
          navigate("/lobby");
        }
      }
    },
    [formData, login, navigate]
  );

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      {/* Card container */}
      <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-purple-100 flex items-center justify-center">
            <Mail size={24} className="text-purple-600" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Sign In
          </h2>
          <p className="text-sm lg:text-base text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Error alert */}
        {loginError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">Login failed</p>
              <p className="text-sm text-red-700 mt-0.5">{loginError}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="Email"
            type="email"
            icon={Mail}
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : ""}
            placeholder="you@example.com"
            disabled={isLogingIn}
          />

          <InputField
            label="Password"
            type="password"
            icon={Lock}
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ""}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            placeholder="••••••••"
            disabled={isLogingIn}
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLogingIn || !isFormValid}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 mt-6 ${
              isLogingIn || !isFormValid
                ? "bg-gray-300 cursor-not-allowed opacity-60"
                : "bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg hover:shadow-purple-200 active:scale-95 transform"
            }`}
          >
            {isLogingIn && <Loader2 size={18} className="animate-spin" />}
            <span>{isLogingIn ? "Signing in..." : "Sign In"}</span>
            {!isLogingIn && <span>→</span>}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-500">
        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
        <span>Secure • SSL Encrypted</span>
        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
      </div>
    </div>
  );
};

/**
 * Main login page component
 */
const LoginPages = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 lg:bg-white flex flex-col lg:flex-row">
      {/* Left sidebar - Hidden on mobile */}
      <LeftSidebar />

      {/* Right content area */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 lg:py-0 px-4 sm:px-6 lg:px-8 lg:bg-gradient-to-br lg:from-gray-50 lg:to-gray-100">
        {/* Mobile brand - Shown only on mobile */}
        <div className="lg:hidden mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <Video size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">QuickMeet</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
        </div>

        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPages;