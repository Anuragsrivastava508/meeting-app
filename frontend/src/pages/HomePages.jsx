import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
  Video,
  Keyboard,
  Link2,
  Zap,
  CalendarPlus,
  HelpCircle,
  Settings,
  User,
  Lock,
  MonitorUp,
  Users,
  CalendarDays,
  Phone,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// crypto.randomUUID is collision-resistant and available in all modern
// browsers/Node — no reason to lean on Math.random() for an ID that
// becomes part of a shareable URL.
const generateMeetingId = () => crypto.randomUUID().slice(0, 8);

const getInitials = (fullName) => {
  if (!fullName) return "U";
  return fullName
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const parseMeetingCode = (input) => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const last = trimmed.split("/").pop();
  const cleaned = last?.split("?")[0];
  return cleaned || null;
};

/* ------------------------------------------------------------------ */
/* Clock — isolated so the 1s tick only re-renders this leaf node,     */
/* not the entire page (dropdown state, input state, etc).             */
/* ------------------------------------------------------------------ */

function LiveClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="text-sm text-[var(--color-text-secondary)] mr-2 hidden md:inline">
      {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
      {" · "}
      {time.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Presentational subcomponents                                       */
/* ------------------------------------------------------------------ */

function TopBarIconButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="size-10 rounded-full flex items-center justify-center
                 text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

function SidebarItem({ label, icon: Icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm w-full text-left
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors
                  ${
                    active
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]"
                  }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}

function DropdownItem({ icon: Icon, title, sub, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3.5 w-full px-4 py-3 text-left
                 border-b border-[var(--color-border-tertiary)] last:border-b-0
                 hover:bg-[var(--color-background-secondary)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
    >
      <Icon className="w-5 h-5 shrink-0 text-[var(--color-text-secondary)]" />
      <div>
        <div className="text-sm font-medium text-[var(--color-text-primary)]">{title}</div>
        <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">{sub}</div>
      </div>
    </button>
  );
}

function InfoCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-[var(--color-background-secondary)] rounded-2xl p-5 border border-[var(--color-border-tertiary)] text-left">
      <div className="size-12 rounded-xl bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[var(--color-text-secondary)]" />
      </div>
      <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">{title}</p>
      <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">{desc}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const SIDEBAR_ITEMS = [
  { key: "meetings", label: "Meetings", icon: CalendarDays },
  { key: "calls", label: "Calls", icon: Phone },
];

const HomePages = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

  const [code, setCode] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState("meetings");

  const dropdownRef = useRef(null);
  const newMeetingBtnRef = useRef(null);

  const initials = useMemo(() => getInitials(authUser?.fullName), [authUser?.fullName]);

  const closeDropdown = useCallback(() => setShowDropdown(false), []);

  // Close on outside click or Escape — consistent with the app's Navbar pattern.
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !newMeetingBtnRef.current.contains(e.target)
      ) {
        closeDropdown();
      }
    };
    const handleEscape = (e) => e.key === "Escape" && closeDropdown();

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showDropdown, closeDropdown]);

  const goToLobby = useCallback(
    (id) => {
      navigate(`/lobby/${id}`);
      closeDropdown();
    },
    [navigate, closeDropdown]
  );

  const handleInstantMeeting = () => goToLobby(generateMeetingId());

  const handleCreateForLater = async () => {
    const id = generateMeetingId();
    const link = `${window.location.origin}/lobby/${id}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied!");
    } catch {
      toast.error("Couldn't copy link — copy it manually", { icon: "📋" });
      // Still surface the link so the user isn't stuck.
      toast(link, { duration: 6000 });
    }
    closeDropdown();
  };

  const handleScheduleLater = () => {
    toast("Scheduling is coming soon");
    closeDropdown();
  };

  const handleJoinMeeting = () => {
    const meetingId = parseMeetingCode(code);
    if (!meetingId) {
      toast.error("Please enter a valid code or link");
      return;
    }
    navigate(`/lobby/${meetingId}`);
  };

  const canJoin = code.trim().length > 0;

  return (
    <div className="min-h-screen bg-[var(--color-background-primary)] flex flex-col">
      {/* TOP BAR */}
      <header className="flex items-center justify-between px-5 py-2.5 border-b border-[var(--color-border-tertiary)] sticky top-0 z-50 bg-[var(--color-background-primary)]">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-medium text-[var(--color-text-primary)]">QuickMeet</span>
        </div>

        <div className="flex items-center gap-1">
          <LiveClock />
          <TopBarIconButton icon={HelpCircle} label="Help" />
          <TopBarIconButton icon={Settings} label="Settings" onClick={() => navigate("/settings")} />
          <TopBarIconButton icon={User} label="Profile" onClick={() => navigate("/profile")} />
          <div
            title={authUser?.fullName}
            aria-label={`Signed in as ${authUser?.fullName ?? "user"}`}
            className="size-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium ml-1.5"
          >
            {initials}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* SIDEBAR */}
        <nav aria-label="Sections" className="w-[230px] shrink-0 p-3 border-r border-[var(--color-border-tertiary)] flex flex-col gap-1">
          {SIDEBAR_ITEMS.map(({ key, label, icon }) => (
            <SidebarItem
              key={key}
              label={label}
              icon={icon}
              active={activeSidebar === key}
              onClick={() => setActiveSidebar(key)}
            />
          ))}
        </nav>

        {/* HERO */}
        <main className="flex-1 flex flex-col items-center px-6 py-14 md:py-16 text-center">
          <h1 className="text-3xl md:text-[42px] font-normal text-[var(--color-text-primary)] leading-tight tracking-tight mb-3.5">
            Video calls and meetings
            <br />
            for everyone
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-9 leading-relaxed">
            Connect, collaborate and celebrate from anywhere with QuickMeet
          </p>

          <div className="flex items-center gap-3 flex-wrap justify-center relative z-10">
            {/* New meeting */}
            <div className="relative">
              <button
                ref={newMeetingBtnRef}
                type="button"
                onClick={() => setShowDropdown((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={showDropdown}
                className="flex items-center gap-2 h-12 px-6 rounded-full bg-primary text-white text-sm font-medium
                           hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition"
              >
                <Video className="w-[18px] h-[18px]" />
                New meeting
              </button>

              {showDropdown && (
                <div
                  ref={dropdownRef}
                  role="menu"
                  className="absolute top-[calc(100%+8px)] left-0 min-w-[290px] bg-[var(--color-background-primary)]
                             border border-[var(--color-border-secondary)] rounded-2xl overflow-hidden shadow-xl z-20"
                >
                  <DropdownItem icon={Link2} title="Create a meeting for later" sub="Get a link to share" onClick={handleCreateForLater} />
                  <DropdownItem icon={Zap} title="Start an instant meeting" sub="Join immediately" onClick={handleInstantMeeting} />
                  <DropdownItem icon={CalendarPlus} title="Schedule in calendar" sub="Plan a future meeting" onClick={handleScheduleLater} />
                </div>
              )}
            </div>

            {/* Join */}
            <div className="flex items-center h-12 rounded-full border border-[var(--color-border-primary)] pl-4 gap-2 overflow-hidden">
              <Keyboard className="w-[18px] h-[18px] shrink-0 text-[var(--color-text-secondary)]" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
                placeholder="Enter a code or link"
                aria-label="Meeting code or link"
                className="border-none outline-none bg-transparent text-sm text-[var(--color-text-primary)] w-[200px]"
              />
              <button
                type="button"
                onClick={handleJoinMeeting}
                disabled={!canJoin}
                className={`h-full px-5 text-sm font-medium transition-colors
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset
                            ${canJoin ? "text-primary cursor-pointer" : "text-[var(--color-text-secondary)] cursor-not-allowed"}`}
              >
                Join
              </button>
            </div>
          </div>

          <hr className="w-full max-w-[700px] border-t border-[var(--color-border-tertiary)] my-10" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-[700px]">
            <InfoCard icon={Lock} title="Your meeting is safe" desc="No one can join unless invited or admitted by the host." />
            <InfoCard icon={MonitorUp} title="Share your screen" desc="Present documents, spreadsheets, or anything on screen." />
            <InfoCard icon={Users} title="Invite anyone" desc="Share the meeting link or code with people you want to join." />
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePages;





// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuthStore } from "../store/useAuthStore";
// import toast from "react-hot-toast";

// const HomePages = () => {
//   const navigate = useNavigate();
//   const { authUser } = useAuthStore();
//   const [code, setCode] = useState("");
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [time, setTime] = useState(new Date());

//   useEffect(() => {
//     const t = setInterval(() => setTime(new Date()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   const fmt     = (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
//   const fmtDate = (d) => d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
//   const initials = authUser?.fullName?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) ?? "U";

//   const goLobby = () => {
//     const id = Math.random().toString(36).substring(2, 10);
//     navigate(`/lobby/${id}`);
//     setShowDropdown(false);
//   };

//   const joinMeeting = () => {
//     const trimmed = code.trim();
//     if (!trimmed) { toast.error("Please enter a code or link"); return; }
//     const cleaned = trimmed.split("/").pop()?.split("?")[0];
//     if (!cleaned) { toast.error("Invalid meeting code"); return; }
//     navigate(`/lobby/${cleaned}`);
//   };

//   return (
//     <div style={S.page}>

//       {/* ── TOP BAR (self-contained, no Navbar) ── */}
//       <div style={S.topbar}>
//         <div style={S.topLeft}>
//           <div style={S.logoWrap}>
//             <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
//               <rect width="28" height="28" rx="8" fill="#534AB7"/>
//               <path d="M7 10h8v8H7z" fill="#fff" opacity=".9"/>
//               <path d="M17 11l4-2v10l-4-2V11z" fill="#fff"/>
//             </svg>
//             <span style={S.logoText}>QuickMeet</span>
//           </div>
//         </div>

//         <div style={S.topRight}>
//           <span style={S.clock}>{fmt(time)} · {fmtDate(time)}</span>
//           <TBtn icon="❓" title="Help" />
//           <TBtn icon="⚙️" title="Settings" onClick={() => navigate("/settings")} />
//           <TBtn icon="👤" title="Profile" onClick={() => navigate("/profile")} />
//           <div style={S.avatar} title={authUser?.fullName}>{initials}</div>
//         </div>
//       </div>

//       {/* ── LAYOUT ── */}
//       <div style={S.layout}>

//         {/* Sidebar */}
//         <nav style={S.sidebar}>
//           <SideItem label="Meetings" active />
//           <SideItem label="Calls" />
//         </nav>

//         {/* Hero */}
//         <main style={S.main}>
//           <h1 style={S.title}>Video calls and meetings<br />for everyone</h1>
//           <p style={S.sub}>Connect, collaborate and celebrate from anywhere with QuickMeet</p>

//           {/* Action row */}
//           <div style={S.actionRow}>

//             {/* New meeting button + dropdown */}
//             <div style={{ position:"relative" }}>
//               <button style={S.newBtn} onClick={() => setShowDropdown(v => !v)}>
//                 <span style={{ fontSize:18 }}>📹</span> New meeting
//               </button>

//               {showDropdown && <>
//                 <div style={S.backdrop} onClick={() => setShowDropdown(false)} />
//                 <div style={S.dropdown}>
//                   <DItem icon="🔗" title="Create a meeting for later" sub="Get a link to share" onClick={() => {
//                     const id = Math.random().toString(36).substring(2,10);
//                     const link = `${window.location.origin}/lobby/${id}`;
//                     navigator.clipboard?.writeText(link);
//                     toast.success("Link copied!");
//                     setShowDropdown(false);
//                   }} />
//                   <DItem icon="⚡" title="Start an instant meeting" sub="Join immediately" onClick={goLobby} />
//                   <DItem icon="📅" title="Schedule in calendar" sub="Plan a future meeting" onClick={() => { toast("Coming soon"); setShowDropdown(false); }} />
//                 </div>
//               </>}
//             </div>

//             {/* Join input */}
//             <div style={S.joinBox}>
//               <span style={{ fontSize:18, flexShrink:0 }}>⌨️</span>
//               <input
//                 style={S.joinInput}
//                 value={code}
//                 onChange={e => setCode(e.target.value)}
//                 onKeyDown={e => e.key === "Enter" && joinMeeting()}
//                 placeholder="Enter a code or link"
//               />
//               <button
//                 style={{ ...S.joinBtn, ...(code.trim() ? S.joinBtnOn : S.joinBtnOff) }}
//                 onClick={joinMeeting}
//                 disabled={!code.trim()}
//               >Join</button>
//             </div>
//           </div>

//           <hr style={S.hr} />

//           {/* Info cards */}
//           <div style={S.cards}>
//             <Card emoji="🔒" title="Your meeting is safe" desc="No one can join unless invited or admitted by the host." />
//             <Card emoji="🖥️" title="Share your screen" desc="Present documents, spreadsheets, or anything on screen." />
//             <Card emoji="👥" title="Invite anyone" desc="Share the meeting link or code with people you want to join." />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// /* ── sub-components ── */
// function TBtn({ icon, title, onClick }) {
//   return (
//     <button title={title} onClick={onClick} style={{
//       width:40, height:40, borderRadius:"50%", background:"transparent",
//       border:"none", cursor:"pointer", fontSize:18, display:"flex",
//       alignItems:"center", justifyContent:"center",
//     }}>{icon}</button>
//   );
// }

// function SideItem({ label, active }) {
//   return (
//     <button style={{
//       display:"flex", alignItems:"center", gap:14, padding:"10px 18px",
//       borderRadius:50, border:"none", cursor:"pointer", width:"100%",
//       textAlign:"left", fontSize:14,
//       background: active ? "rgba(83,74,183,0.15)" : "transparent",
//       color: active ? "#534AB7" : "var(--color-text-secondary)",
//       fontWeight: active ? 500 : 400,
//     }}>
//       <span style={{ fontSize:20 }}>{label === "Meetings" ? "📅" : "📞"}</span>
//       {label}
//     </button>
//   );
// }

// function DItem({ icon, title, sub, onClick }) {
//   return (
//     <button style={{
//       display:"flex", alignItems:"center", gap:14, padding:"13px 18px",
//       width:"100%", background:"transparent", border:"none",
//       borderBottom:"0.5px solid var(--color-border-tertiary)",
//       cursor:"pointer", textAlign:"left",
//     }} onClick={onClick}>
//       <span style={{ fontSize:22, flexShrink:0 }}>{icon}</span>
//       <div>
//         <div style={{ fontSize:14, fontWeight:500, color:"var(--color-text-primary)" }}>{title}</div>
//         <div style={{ fontSize:12, color:"var(--color-text-secondary)", marginTop:2 }}>{sub}</div>
//       </div>
//     </button>
//   );
// }

// function Card({ emoji, title, desc }) {
//   return (
//     <div style={{
//       background:"var(--color-background-secondary)",
//       borderRadius:16, padding:"24px 20px",
//       border:"0.5px solid var(--color-border-tertiary)",
//     }}>
//       <div style={{
//         width:52, height:52, borderRadius:14, fontSize:26,
//         background:"var(--color-background-primary)",
//         border:"0.5px solid var(--color-border-tertiary)",
//         display:"flex", alignItems:"center", justifyContent:"center",
//         marginBottom:16,
//       }}>{emoji}</div>
//       <p style={{ fontSize:15, fontWeight:500, color:"var(--color-text-primary)", margin:"0 0 8px" }}>{title}</p>
//       <p style={{ fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.6, margin:0 }}>{desc}</p>
//     </div>
//   );
// }

// /* ── styles ── */
// const S = {
//   page:   
//    { minHeight:"100vh", background:"var(--color-background-primary)", fontFamily:"'Segoe UI',system-ui,sans-serif", display:"flex", flexDirection:"column" },
//   topbar: 
//    { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", borderBottom:"0.5px solid var(--color-border-tertiary)", background:"var(--color-background-primary)", position:"sticky", top:0, zIndex:50 },
//   topLeft:
//    { display:"flex", alignItems:"center" },
//   logoWrap:
//   { display:"flex", alignItems:"center", gap:10 },
//   logoText:
//   { fontSize:20, fontWeight:500, color:"var(--color-text-primary)" },
//   topRight:
//   { display:"flex", alignItems:"center", gap:4 },
//   clock:
//      { fontSize:13, color:"var(--color-text-secondary)", marginRight:8 },
//   avatar: 
//    { width:36, height:36, borderRadius:"50%", background:"#534AB7", color:"#EEEDFE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:500, cursor:"pointer", marginLeft:6 },

//   layout: 
//    { display:"flex", flex:1 },
//   sidebar: 
//   { width:230, padding:"12px 8px", borderRight:"0.5px solid var(--color-border-tertiary)", display:"flex", flexDirection:"column", gap:4, flexShrink:0 },
//   main:   
//    { flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 24px 48px", textAlign:"center" },

//   title:
//      { fontSize:42, fontWeight:400, color:"var(--color-text-primary)", margin:"0 0 14px", lineHeight:1.2, letterSpacing:"-0.5px" },
//   sub:    
//    { fontSize:16, color:"var(--color-text-secondary)", margin:"0 0 36px", lineHeight:1.6 },

//   actionRow:
//   { display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", justifyContent:"center", position:"relative", zIndex:10 },
//   newBtn: 
//     { display:"flex", alignItems:"center", gap:8, padding:"0 24px", height:48, borderRadius:24, background:"#1B6CA8", color:"#fff", border:"none", cursor:"pointer", fontSize:15, fontWeight:500 },
//   backdrop: 
//   { position:"fixed", inset:0, zIndex:98 },
//   dropdown:
//    { position:"absolute", top:"calc(100% + 8px)", left:0, background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-secondary)", borderRadius:14, minWidth:290, zIndex:99, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.12)" },

//   joinBox: 
//    { display:"flex", alignItems:"center", height:48, borderRadius:24, border:"1.5px solid var(--color-border-primary)", background:"var(--color-background-primary)", paddingLeft:16, gap:8, overflow:"hidden" },
//   joinInput:
//   { border:"none", outline:"none", fontSize:14, background:"transparent", color:"var(--color-text-primary)", width:200 },
//   joinBtn: 
//    { height:"100%", padding:"0 20px", border:"none", fontSize:14, fontWeight:500, cursor:"pointer", background:"transparent" },
//   joinBtnOn:
//   { color:"#1B6CA8",
//      cursor:"pointer" 
//     },
//   joinBtnOff:
//   { 
//     color:"var(--color-text-secondary)",
//      cursor:"not-allowed" 
//     },

//   hr: 
//      { 
//       width:"100%",
//        maxWidth:700,
//         border:"none",
//          borderTop:"0.5px solid var(--color-border-tertiary)",
//           margin:"40px 0 32px" 
//         },
//   cards: {
//      display:"grid",
//      gridTemplateColumns:"repeat(3,1fr)",
//      gap:16,
//      width:"100%",
//      maxWidth:700,
//      textAlign:"left"

//    },
// };

// export default HomePages;
