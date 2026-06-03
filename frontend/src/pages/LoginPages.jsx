import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, Video } from "lucide-react";

const LoginPages = () => {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const { login, isLogingIn } = useAuthStore();
  const handleSubmit = (e) => {
    e.preventDefault();
    login(form);
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
          <h1 style={S.heading}>Welcome back 👋</h1>
          <p style={S.sub}>Log in to continue your meetings and stay connected with your team.</p>
          <div style={S.features}>
            {[["🎥", "HD Video Meetings"], ["💬", "Real-time Chat"], ["⚡", "Instant Join Links"], ["🔒", "Secure Platform"]].map(([icon, label]) => (
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
            <div style={S.iconBox}><Mail size={22} color="#534AB7" /></div>
            <h2 style={S.title}>Sign In</h2>
            <p style={S.desc}>Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} style={S.form}>
            {/* Email */}
            <div style={S.field}>
              <label style={S.label}>Email</label>
              <div style={S.inputWrap}>
                <Mail size={16} color="#888" style={S.inputIcon} />
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={S.input} required />
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
                  style={{ ...S.input, paddingRight: 40 }} required />
                <button type="button" onClick={() => setShow(!show)} style={S.eyeBtn}>
                  {show ? <EyeOff size={16} color="#888" /> : <Eye size={16} color="#888" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLogingIn} style={S.submitBtn}>
              {isLogingIn ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : "Sign In →"}
            </button>
          </form>

          <p style={S.footer}>
            Don't have an account?{" "}
            <Link to="/signup" style={S.link}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const S = {
  root: { 
    display: "flex",
     minHeight: "100vh",
      fontFamily: "'Segoe UI',system-ui,sans-serif" 
    },
  left: 
  {
     flex: 1,
      background: "linear-gradient(135deg,#3730a3,#534AB7,#7c3aed)",
       display: "flex", 
       alignItems: "center",
        justifyContent: "center",
         padding: 48 
        },
  leftInner: 
  {
     maxWidth: 400,
     color: "#fff" 
    },
  brand:
   {
     display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 48 
      },
  brandIcon:
   {
     width: 48,
      height: 48,
      borderRadius: 12,
      background: "rgba(255,255,255,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center" 
        },
  brandName:
   { 
    fontSize: 24,
     fontWeight: 700,
      color: "#fff" 
    },
  heading: 
  { 
  fontSize: 36,
   fontWeight: 700,
    lineHeight: 1.2,
     marginBottom: 16, 
     margin: "0 0 16px"
     },
  sub: 
  {
     fontSize: 16,
      opacity: 0.8, 
      lineHeight: 1.6,
       margin: "0 0 36px" 
      },
  features:
   {
     display: "flex",
     flexDirection: "column",
     gap: 16 

  },
  feature: 
  {
     display: "flex",
      alignItems: "center",
       gap: 14, 
       background: "rgba(255,255,255,0.1)", 
       borderRadius: 12,
        padding: "12px 16px"
       },
  fIcon:
   {
     fontSize: 20 
    },
  fLabel: 
  { 
    fontSize: 15,
     fontWeight: 500 
    },
  right:
   {
     flex: 1, 
     display: "flex",
      alignItems: "center",
       justifyContent: "center",
        padding: 24,
         background: "#f8f9ff" 
        },
  card:
   { 
    width: "100%",
     maxWidth: 420, 
     background: "#fff",
      borderRadius: 20, 
      padding: 40,
       boxShadow: "0 8px 40px rgba(83,74,183,0.12)" 
      },
  cardHeader:
   { 
    textAlign: "center",
     marginBottom: 32 
    },
  iconBox:
   { 
    width: 56,
     height: 56, 
     borderRadius: 16,
      background: "rgba(83,74,183,0.1)",
       display: "flex",
        alignItems: "center",
         justifyContent: "center",
          margin: "0 auto 16px" 
        },
  title: 
  { 
    fontSize: 24,
     fontWeight: 700, 
     color: "#1a1a2e", 
     margin: "0 0 8px" 
    },
  desc:
   { 
    fontSize: 14, 
    color: "#888",
     margin: 0 
    },
  form:
   { 
    display: "flex", 
    flexDirection: "column",
     gap: 20 
    },
  field:
   {
     display: "flex",
     flexDirection: "column",
      gap: 8 
    },
  label: 
  {
     fontSize: 14,
      fontWeight: 600, 
      color: "#374151" 
    },
  inputWrap:
   {
     position: "relative",
     display: "flex", 
     alignItems: "center" 
    },
  inputIcon:
   {
     position: "absolute",
      left: 14,
       pointerEvents: "none" 
      },
  input: 
  {
     width: "100%",
      padding: "12px 14px 12px 40px", 
      borderRadius: 12, 
      border: "1.5px solid #e5e7eb", 
      fontSize: 14, 
      outline: "none", 
      boxSizing: "border-box", 
      transition: "border-color 0.2s", 
      background: "#f9fafb" 
    },
  eyeBtn: 
  { position: "absolute",
     right: 12,
      background: "none",
       border: "none",
        cursor: "pointer",
         display: "flex",
          alignItems: "center"
         },
  submitBtn:
   { width: "100%",
     padding: "13px",
      borderRadius: 12, 
      background: "linear-gradient(135deg,#534AB7,#7c3aed)", 
      color: "#fff",
       fontSize: 15,
        fontWeight: 600,
         border: "none",
          cursor: "pointer",
           display: "flex", 
          alignItems: "center",
           justifyContent:"center",
          gap: 8,
       marginTop: 4 },
  footer:
   { textAlign:
     "center",
      fontSize: 14,
       color: "#888", 
       marginTop: 24,
        marginBottom: 0 
      },
  link:
   { 
    color: "#534AB7",
     fontWeight: 600,
      textDecoration: "none"
     },
};

export default LoginPages;