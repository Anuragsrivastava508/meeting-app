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


import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, User, Video } from "lucide-react";
import toast from "react-hot-toast";

const SignupPages = () => {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const { signup, isSigningUp } = useAuthStore();

  const validate = () => {
    if (!form.fullName.trim()) return toast.error("Full name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(form.email)) return toast.error("Invalid email");
    if (!form.password) return toast.error("Password is required");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate() === true) signup(form);
  };

  return (
    <div style={S.root}>
      {/* LEFT */}
      <div style={S.left}>
        <div style={S.leftInner}>
          <div style={S.brand}>
            <div style={S.brandIcon}><Video size={28} color="#fff" /></div>
            <span style={S.brandName}>QuickMeet</span>
          </div>
          <h1 style={S.heading}>Join us today 🚀</h1>
          <p style={S.sub}>Create your account and start connecting instantly with your team.</p>
          <div style={S.features}>
            {[["🎥","Start meetings instantly"],["👥","Invite your team easily"],["💬","Chat while you meet"],["🔒","Secure & reliable platform"]].map(([icon, label]) => (
              <div key={label} style={S.feature}>
                <span style={S.fIcon}>{icon}</span>
                <span style={S.fLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={S.right}>
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={S.iconBox}><User size={22} color="#534AB7" /></div>
            <h2 style={S.title}>Create Account</h2>
            <p style={S.desc}>Get started with your free account</p>
          </div>

          <form onSubmit={handleSubmit} style={S.form}>
            {/* Full Name */}
            <div style={S.field}>
              <label style={S.label}>Full Name</label>
              <div style={S.inputWrap}>
                <User size={16} color="#888" style={S.inputIcon} />
                <input type="text" placeholder="John Doe" value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  style={S.input} />
              </div>
            </div>

            {/* Email */}
            <div style={S.field}>
              <label style={S.label}>Email</label>
              <div style={S.inputWrap}>
                <Mail size={16} color="#888" style={S.inputIcon} />
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={S.input} />
              </div>
            </div>

            {/* Password */}
            <div style={S.field}>
              <label style={S.label}>Password</label>
              <div style={S.inputWrap}>
                <Lock size={16} color="#888" style={S.inputIcon} />
                <input type={show ? "text" : "password"} placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ ...S.input, paddingRight: 40 }} />
                <button type="button" onClick={() => setShow(!show)} style={S.eyeBtn}>
                  {show ? <EyeOff size={16} color="#888" /> : <Eye size={16} color="#888" />}
                </button>
              </div>
            </div>

            {/* Password strength hint */}
            <div style={S.hint}>
              {["6+ chars", "uppercase", "number"].map((h, i) => (
                <span key={h} style={{
                  ...S.hintBadge,
                  background: (i === 0 && form.password.length >= 6) || (i === 1 && /[A-Z]/.test(form.password)) || (i === 2 && /\d/.test(form.password))
                    ? "rgba(83,74,183,0.15)" : "rgba(0,0,0,0.05)",
                  color: (i === 0 && form.password.length >= 6) || (i === 1 && /[A-Z]/.test(form.password)) || (i === 2 && /\d/.test(form.password))
                    ? "#534AB7" : "#aaa",
                }}>{h}</span>
              ))}
            </div>

            <button type="submit" disabled={isSigningUp} style={S.submitBtn}>
              {isSigningUp ? <><Loader2 size={18} /> Creating account...</> : "Create Account →"}
            </button>
          </form>

          <p style={S.footer}>
            Already have an account?{" "}
            <Link to="/login" style={S.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const S = {
  root: { display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI',system-ui,sans-serif" },
  left: { flex: 1, background: "linear-gradient(135deg,#0f4c75,#1B6CA8,#1e3c72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 },
  leftInner: { maxWidth: 400, color: "#fff" },
  brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 48 },
  brandIcon: { width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" },
  brandName: { fontSize: 24, fontWeight: 700, color: "#fff" },
  heading: { fontSize: 36, fontWeight: 700, lineHeight: 1.2, margin: "0 0 16px" },
  sub: { fontSize: 16, opacity: 0.8, lineHeight: 1.6, margin: "0 0 36px" },
  features: { display: "flex", flexDirection: "column", gap: 16 },
  feature: { display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px" },
  fIcon: { fontSize: 20 },
  fLabel: { fontSize: 15, fontWeight: 500 },
  right: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#f8f9ff" },
  card: { width: "100%", maxWidth: 420, background: "#fff", borderRadius: 20, padding: 40, boxShadow: "0 8px 40px rgba(30,60,114,0.12)" },
  cardHeader: { textAlign: "center", marginBottom: 28 },
  iconBox: { width: 56, height: 56, borderRadius: 16, background: "rgba(83,74,183,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  title: { fontSize: 24, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" },
  desc: { fontSize: 14, color: "#888", margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 14, fontWeight: 600, color: "#374151" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: 14, pointerEvents: "none" },
  input: { width: "100%", padding: "12px 14px 12px 40px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fafb" },
  eyeBtn: { position: "absolute", right: 12, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" },
  hint: { display: "flex", gap: 8 },
  hintBadge: { fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500, transition: "all 0.2s" },
  submitBtn: { width: "100%", padding: "13px", borderRadius: 12, background: "linear-gradient(135deg,#1B6CA8,#534AB7)", color: "#fff", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
  footer: { textAlign: "center", fontSize: 14, color: "#888", marginTop: 24, marginBottom: 0 },
  link: { color: "#534AB7", fontWeight: 600, textDecoration: "none" },
};

export default SignupPages;