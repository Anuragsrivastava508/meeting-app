// import { useState } from "react";
// import { useAuthStore } from "../store/useAuthStore";
//  import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
//  import { Link } from "react-router-dom";

// // import AuthImagePattern from "../components/AuthImagePattern";
// import toast from "react-hot-toast";

// const SignUpPage = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//   });

//   const { signup, isSigningUp } = useAuthStore();

//   const validateForm = () => {
//     if (!formData.fullName.trim()) return toast.error("Full name is required");
//     if (!formData.email.trim()) return toast.error("Email is required");
//     if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
//     if (!formData.password) return toast.error("Password is required");
//     if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

//     return true;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const success = validateForm();

//     if (success === true) signup(formData);
//   };

//   return (
//     <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

//   {/* LEFT SIDE */}
//   {/* LEFT SIDE (INFO PANEL) */}
// <div className="hidden md:flex flex-col justify-center items-center 
// bg-gradient-to-br from-primary to-secondary text-white p-10">

//   <div className="max-w-md text-center space-y-6">

//     <h1 className="text-4xl font-bold">
//       Join us today 🚀
//     </h1>

//     <p className="text-lg opacity-80">
//       Create your account and start connecting instantly with your team.
//     </p>

//     {/* FEATURES */}
//     <div className="space-y-3 text-left mt-6">
//       <div className="flex items-center gap-3">
//         <span>🎥</span>
//         <p>Start meetings instantly</p>
//       </div>

//       <div className="flex items-center gap-3">
//         <span>👥</span>
//         <p>Invite your team easily</p>
//       </div>

//       <div className="flex items-center gap-3">
//         <span>💬</span>
//         <p>Chat while you meet</p>
//       </div>

//       <div className="flex items-center gap-3">
//         <span>🔒</span>
//         <p>Secure & reliable platform</p>
//       </div>
//     </div>

//   </div>
// </div>

//   {/* RIGHT SIDE (FORM) */}
//   <div className="flex flex-col justify-center items-center p-3 sm:p-12">
//          <div className="w-full max-w-md space-y-6">
//            {/* LOGO */}
//            <div className="text-center mb-4 p-2">
//              <div className="flex flex-col items-center gap-2 group">
//              <div
//                 className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
//               group-hover:bg-primary/20 transition-colors"
//               >
//                 <MessageSquare className="size-6 text-primary" />
//               </div>
//               <h1 className="text-2xl font-bold mt-2">Create Account</h1>
//               <p className="text-base-content/60">Get started with your free account</p>
//             </div>
//           </div>

          
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text font-medium">Full Name</span>
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="size-5 text-base-content/40" />
//                 </div>
//                 <input
//                   type="text"
//                   className={`input input-bordered w-full pl-10`}
//                   placeholder="John Doe"
//                   value={formData.fullName}
//                   onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
//                 />
//               </div>
//             </div>

//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text font-medium">Email</span>
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="size-5 text-base-content/40" />
//                 </div>
//                 <input
//                   type="email"
//                   className={`input input-bordered w-full pl-10`}
//                   placeholder="you@example.com"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 />
//               </div>
//             </div>

//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text font-medium">Password</span>
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="size-5 text-base-content/40" />
//                 </div>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   className={`input input-bordered w-full pl-10`}
//                   placeholder="••••••••"
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="size-5 text-base-content/40" />
//                   ) : (
//                     <Eye className="size-5 text-base-content/40" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
//               {isSigningUp ? (
//                 <>
//                   <Loader2 className="size-5 animate-spin" />
//                   Loading...
//                 </>
//               ) : (
//                 "Create Account"
//               )}
//             </button>
//           </form>

//           <div className="text-center">
//             <p className="text-base-content/60">
//               Already have an account?{" "}
//               <Link to="/login" className="link link-primary">
//                 Sign in
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>

        
//         </div>
 
//   );
// };
// export default SignUpPage;


import { useState, useCallback, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, User, Video, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Password strength validation
 */
const PASSWORD_STRENGTH = {
  minLength: 6,
  hasUpperCase: /[A-Z]/,
  hasNumber: /\d/,
  hasSpecial: /[!@#$%^&*]/,
};

const calculatePasswordStrength = (password) => {
  let score = 0;
  if (password.length >= PASSWORD_STRENGTH.minLength) score++;
  if (PASSWORD_STRENGTH.hasUpperCase.test(password)) score++;
  if (PASSWORD_STRENGTH.hasNumber.test(password)) score++;
  if (PASSWORD_STRENGTH.hasSpecial.test(password)) score++;
  return score;
};

const getStrengthLabel = (score) => {
  if (score === 0) return { label: "Very Weak", color: "text-red-600", bg: "bg-red-100" };
  if (score === 1) return { label: "Weak", color: "text-orange-600", bg: "bg-orange-100" };
  if (score === 2) return { label: "Fair", color: "text-yellow-600", bg: "bg-yellow-100" };
  if (score === 3) return { label: "Good", color: "text-blue-600", bg: "bg-blue-100" };
  return { label: "Strong", color: "text-green-600", bg: "bg-green-100" };
};

/**
 * Form validation schema
 */
const VALIDATION_RULES = {
  fullName: {
    required: "Full name is required",
    minLength: 2,
    message: "Name must be at least 2 characters",
  },
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

const validateField = (name, value) => {
  const rules = VALIDATION_RULES[name];
  if (!rules) return null;

  if (!value && rules.required) {
    return rules.required;
  }

  if (rules.minLength && value && value.length < rules.minLength) {
    return rules.message;
  }

  if (rules.pattern && value && !rules.pattern.test(value)) {
    return rules.message;
  }

  return null;
};

const FEATURES = [
  { icon: "🎥", label: "Start meetings instantly" },
  { icon: "👥", label: "Invite your team easily" },
  { icon: "💬", label: "Chat while you meet" },
  { icon: "🔒", label: "Secure & reliable platform" },
];

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
        Join us today 🚀
      </h1>
      <p className="text-base lg:text-lg text-white/80 leading-relaxed max-w-sm">
        Create your account and start connecting instantly with your team.
      </p>
    </div>
  </div>
);

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

const LeftSidebar = () => (
  <div className="hidden lg:flex flex-col flex-1 justify-center px-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
    <div className="max-w-md">
      <BrandSection />
      <FeaturesList />
    </div>
  </div>
);

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
            : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
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

const PasswordStrengthIndicator = ({ password }) => {
  const strength = calculatePasswordStrength(password);
  const { label, color, bg } = getStrengthLabel(strength);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">Password Strength</span>
        <span className={`text-xs font-semibold ${color}`}>{label}</span>
      </div>
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < strength ? `${bg.split(" ")[1]} ${color.split("-")[0]}-500` : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const SignupForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState({ fullName: "", email: "", password: "" });
  const [touched, setTouched] = useState({ fullName: false, email: false, password: false });

  const { signup, isSigningUp } = useAuthStore();

  const isFormValid = useMemo(
    () =>
      formData.fullName &&
      formData.email &&
      formData.password &&
      !errors.fullName &&
      !errors.email &&
      !errors.password,
    [formData, errors]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched]
  );

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const fullNameError = validateField("fullName", formData.fullName);
      const emailError = validateField("email", formData.email);
      const passwordError = validateField("password", formData.password);

      setErrors({ fullName: fullNameError, email: emailError, password: passwordError });
      setTouched({ fullName: true, email: true, password: true });

      if (!fullNameError && !emailError && !passwordError) {
        const success = await signup(formData);
        if (success) {
          navigate("/login");
        }
      }
    },
    [formData, signup, navigate]
  );

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-100 flex items-center justify-center">
            <User size={24} className="text-blue-600" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-sm lg:text-base text-gray-600">
            Get started with your free account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="Full Name"
            type="text"
            icon={User}
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.fullName ? errors.fullName : ""}
            placeholder="John Doe"
            disabled={isSigningUp}
          />

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
            disabled={isSigningUp}
          />

          <div className="space-y-3">
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
              disabled={isSigningUp}
            />
            {formData.password && <PasswordStrengthIndicator password={formData.password} />}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSigningUp || !isFormValid}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 mt-6 ${
              isSigningUp || !isFormValid
                ? "bg-gray-300 cursor-not-allowed opacity-60"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-95 transform"
            }`}
          >
            {isSigningUp && <Loader2 size={18} className="animate-spin" />}
            <span>{isSigningUp ? "Creating account..." : "Create Account"}</span>
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Sign in
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

const SignupPages = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 lg:bg-white flex flex-col lg:flex-row">
      <LeftSidebar />

      <div className="flex-1 flex flex-col items-center justify-center py-8 lg:py-0 px-4 sm:px-6 lg:px-8 lg:bg-gradient-to-br lg:from-gray-50 lg:to-gray-100">
        <div className="lg:hidden mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Video size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">QuickMeet</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Join us today</h1>
        </div>

        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPages;