import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const HomePages = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [code, setCode] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt     = (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const fmtDate = (d) => d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
  const initials = authUser?.fullName?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) ?? "U";

  const goLobby = () => {
    const id = Math.random().toString(36).substring(2, 10);
    navigate(`/lobby/${id}`);
    setShowDropdown(false);
  };

  const joinMeeting = () => {
    const trimmed = code.trim();
    if (!trimmed) { toast.error("Please enter a code or link"); return; }
    const cleaned = trimmed.split("/").pop()?.split("?")[0];
    if (!cleaned) { toast.error("Invalid meeting code"); return; }
    navigate(`/lobby/${cleaned}`);
  };

  return (
    <div style={S.page}>

      {/* ── TOP BAR (self-contained, no Navbar) ── */}
      <div style={S.topbar}>
        <div style={S.topLeft}>
          <div style={S.logoWrap}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#534AB7"/>
              <path d="M7 10h8v8H7z" fill="#fff" opacity=".9"/>
              <path d="M17 11l4-2v10l-4-2V11z" fill="#fff"/>
            </svg>
            <span style={S.logoText}>QuickMeet</span>
          </div>
        </div>

        <div style={S.topRight}>
          <span style={S.clock}>{fmt(time)} · {fmtDate(time)}</span>
          <TBtn icon="❓" title="Help" />
          <TBtn icon="⚙️" title="Settings" onClick={() => navigate("/settings")} />
          <TBtn icon="👤" title="Profile" onClick={() => navigate("/profile")} />
          <div style={S.avatar} title={authUser?.fullName}>{initials}</div>
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div style={S.layout}>

        {/* Sidebar */}
        <nav style={S.sidebar}>
          <SideItem label="Meetings" active />
          <SideItem label="Calls" />
        </nav>

        {/* Hero */}
        <main style={S.main}>
          <h1 style={S.title}>Video calls and meetings<br />for everyone</h1>
          <p style={S.sub}>Connect, collaborate and celebrate from anywhere with QuickMeet</p>

          {/* Action row */}
          <div style={S.actionRow}>

            {/* New meeting button + dropdown */}
            <div style={{ position:"relative" }}>
              <button style={S.newBtn} onClick={() => setShowDropdown(v => !v)}>
                <span style={{ fontSize:18 }}>📹</span> New meeting
              </button>

              {showDropdown && <>
                <div style={S.backdrop} onClick={() => setShowDropdown(false)} />
                <div style={S.dropdown}>
                  <DItem icon="🔗" title="Create a meeting for later" sub="Get a link to share" onClick={() => {
                    const id = Math.random().toString(36).substring(2,10);
                    const link = `${window.location.origin}/lobby/${id}`;
                    navigator.clipboard?.writeText(link);
                    toast.success("Link copied!");
                    setShowDropdown(false);
                  }} />
                  <DItem icon="⚡" title="Start an instant meeting" sub="Join immediately" onClick={goLobby} />
                  <DItem icon="📅" title="Schedule in calendar" sub="Plan a future meeting" onClick={() => { toast("Coming soon"); setShowDropdown(false); }} />
                </div>
              </>}
            </div>

            {/* Join input */}
            <div style={S.joinBox}>
              <span style={{ fontSize:18, flexShrink:0 }}>⌨️</span>
              <input
                style={S.joinInput}
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && joinMeeting()}
                placeholder="Enter a code or link"
              />
              <button
                style={{ ...S.joinBtn, ...(code.trim() ? S.joinBtnOn : S.joinBtnOff) }}
                onClick={joinMeeting}
                disabled={!code.trim()}
              >Join</button>
            </div>
          </div>

          <hr style={S.hr} />

          {/* Info cards */}
          <div style={S.cards}>
            <Card emoji="🔒" title="Your meeting is safe" desc="No one can join unless invited or admitted by the host." />
            <Card emoji="🖥️" title="Share your screen" desc="Present documents, spreadsheets, or anything on screen." />
            <Card emoji="👥" title="Invite anyone" desc="Share the meeting link or code with people you want to join." />
          </div>
        </main>
      </div>
    </div>
  );
};

/* ── sub-components ── */
function TBtn({ icon, title, onClick }) {
  return (
    <button title={title} onClick={onClick} style={{
      width:40, height:40, borderRadius:"50%", background:"transparent",
      border:"none", cursor:"pointer", fontSize:18, display:"flex",
      alignItems:"center", justifyContent:"center",
    }}>{icon}</button>
  );
}

function SideItem({ label, active }) {
  return (
    <button style={{
      display:"flex", alignItems:"center", gap:14, padding:"10px 18px",
      borderRadius:50, border:"none", cursor:"pointer", width:"100%",
      textAlign:"left", fontSize:14,
      background: active ? "rgba(83,74,183,0.15)" : "transparent",
      color: active ? "#534AB7" : "var(--color-text-secondary)",
      fontWeight: active ? 500 : 400,
    }}>
      <span style={{ fontSize:20 }}>{label === "Meetings" ? "📅" : "📞"}</span>
      {label}
    </button>
  );
}

function DItem({ icon, title, sub, onClick }) {
  return (
    <button style={{
      display:"flex", alignItems:"center", gap:14, padding:"13px 18px",
      width:"100%", background:"transparent", border:"none",
      borderBottom:"0.5px solid var(--color-border-tertiary)",
      cursor:"pointer", textAlign:"left",
    }} onClick={onClick}>
      <span style={{ fontSize:22, flexShrink:0 }}>{icon}</span>
      <div>
        <div style={{ fontSize:14, fontWeight:500, color:"var(--color-text-primary)" }}>{title}</div>
        <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:2 }}>{sub}</div>
      </div>
    </button>
  );
}

function Card({ emoji, title, desc }) {
  return (
    <div style={{
      background:"var(--color-background-secondary)",
      borderRadius:16, padding:"24px 20px",
      border:"0.5px solid var(--color-border-tertiary)",
    }}>
      <div style={{
        width:52, height:52, borderRadius:14, fontSize:26,
        background:"var(--color-background-primary)",
        border:"0.5px solid var(--color-border-tertiary)",
        display:"flex", alignItems:"center", justifyContent:"center",
        marginBottom:16,
      }}>{emoji}</div>
      <p style={{ fontSize:15, fontWeight:500, color:"var(--color-text-primary)", margin:"0 0 8px" }}>{title}</p>
      <p style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.6, margin:0 }}>{desc}</p>
    </div>
  );
}

/* ── styles ── */
const S = {
  page:   
   { minHeight:"100vh", background:"var(--color-background-primary)", fontFamily:"'Segoe UI',system-ui,sans-serif", display:"flex", flexDirection:"column" },
  topbar: 
   { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", borderBottom:"0.5px solid var(--color-border-tertiary)", background:"var(--color-background-primary)", position:"sticky", top:0, zIndex:50 },
  topLeft:
   { display:"flex", alignItems:"center" },
  logoWrap:
  { display:"flex", alignItems:"center", gap:10 },
  logoText:
  { fontSize:20, fontWeight:500, color:"var(--color-text-primary)" },
  topRight:
  { display:"flex", alignItems:"center", gap:4 },
  clock:
     { fontSize:13, color:"var(--color-text-secondary)", marginRight:8 },
  avatar: 
   { width:36, height:36, borderRadius:"50%", background:"#534AB7", color:"#EEEDFE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:500, cursor:"pointer", marginLeft:6 },

  layout: 
   { display:"flex", flex:1 },
  sidebar: 
  { width:230, padding:"12px 8px", borderRight:"0.5px solid var(--color-border-tertiary)", display:"flex", flexDirection:"column", gap:4, flexShrink:0 },
  main:   
   { flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 24px 48px", textAlign:"center" },

  title:
     { fontSize:42, fontWeight:400, color:"var(--color-text-primary)", margin:"0 0 14px", lineHeight:1.2, letterSpacing:"-0.5px" },
  sub:    
   { fontSize:16, color:"var(--color-text-secondary)", margin:"0 0 36px", lineHeight:1.6 },

  actionRow:
  { display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", justifyContent:"center", position:"relative", zIndex:10 },
  newBtn: 
    { display:"flex", alignItems:"center", gap:8, padding:"0 24px", height:48, borderRadius:24, background:"#1B6CA8", color:"#fff", border:"none", cursor:"pointer", fontSize:15, fontWeight:500 },
  backdrop: 
  { position:"fixed", inset:0, zIndex:98 },
  dropdown:
   { position:"absolute", top:"calc(100% + 8px)", left:0, background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-secondary)", borderRadius:14, minWidth:290, zIndex:99, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.12)" },

  joinBox: 
   { display:"flex", alignItems:"center", height:48, borderRadius:24, border:"1.5px solid var(--color-border-primary)", background:"var(--color-background-primary)", paddingLeft:16, gap:8, overflow:"hidden" },
  joinInput:
  { border:"none", outline:"none", fontSize:14, background:"transparent", color:"var(--color-text-primary)", width:200 },
  joinBtn: 
   { height:"100%", padding:"0 20px", border:"none", fontSize:14, fontWeight:500, cursor:"pointer", background:"transparent" },
  joinBtnOn:
  { color:"#1B6CA8",
     cursor:"pointer" 
    },
  joinBtnOff:
  { 
    color:"var(--color-text-secondary)",
     cursor:"not-allowed" 
    },

  hr: 
     { 
      width:"100%",
       maxWidth:700,
        border:"none",
         borderTop:"0.5px solid var(--color-border-tertiary)",
          margin:"40px 0 32px" 
        },
  cards: {
     display:"grid",
     gridTemplateColumns:"repeat(3,1fr)",
     gap:16,
     width:"100%",
     maxWidth:700,
     textAlign:"left"

   },
};

export default HomePages;
