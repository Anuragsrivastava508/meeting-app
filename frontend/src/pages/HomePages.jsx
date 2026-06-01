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
  page:    { minHeight:"100vh", background:"var(--color-background-primary)", fontFamily:"'Segoe UI',system-ui,sans-serif", display:"flex", flexDirection:"column" },
  topbar:  { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", borderBottom:"0.5px solid var(--color-border-tertiary)", background:"var(--color-background-primary)", position:"sticky", top:0, zIndex:50 },
  topLeft: { display:"flex", alignItems:"center" },
  logoWrap:{ display:"flex", alignItems:"center", gap:10 },
  logoText:{ fontSize:20, fontWeight:500, color:"var(--color-text-primary)" },
  topRight:{ display:"flex", alignItems:"center", gap:4 },
  clock:   { fontSize:13, color:"var(--color-text-secondary)", marginRight:8 },
  avatar:  { width:36, height:36, borderRadius:"50%", background:"#534AB7", color:"#EEEDFE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:500, cursor:"pointer", marginLeft:6 },

  layout:  { display:"flex", flex:1 },
  sidebar: { width:230, padding:"12px 8px", borderRight:"0.5px solid var(--color-border-tertiary)", display:"flex", flexDirection:"column", gap:4, flexShrink:0 },
  main:    { flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 24px 48px", textAlign:"center" },

  title:   { fontSize:42, fontWeight:400, color:"var(--color-text-primary)", margin:"0 0 14px", lineHeight:1.2, letterSpacing:"-0.5px" },
  sub:     { fontSize:16, color:"var(--color-text-secondary)", margin:"0 0 36px", lineHeight:1.6 },

  actionRow:{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", justifyContent:"center", position:"relative", zIndex:10 },
  newBtn:   { display:"flex", alignItems:"center", gap:8, padding:"0 24px", height:48, borderRadius:24, background:"#1B6CA8", color:"#fff", border:"none", cursor:"pointer", fontSize:15, fontWeight:500 },
  backdrop: { position:"fixed", inset:0, zIndex:98 },
  dropdown: { position:"absolute", top:"calc(100% + 8px)", left:0, background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-secondary)", borderRadius:14, minWidth:290, zIndex:99, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.12)" },

  joinBox:  { display:"flex", alignItems:"center", height:48, borderRadius:24, border:"1.5px solid var(--color-border-primary)", background:"var(--color-background-primary)", paddingLeft:16, gap:8, overflow:"hidden" },
  joinInput:{ border:"none", outline:"none", fontSize:14, background:"transparent", color:"var(--color-text-primary)", width:200 },
  joinBtn:  { height:"100%", padding:"0 20px", border:"none", fontSize:14, fontWeight:500, cursor:"pointer", background:"transparent" },
  joinBtnOn:{ color:"#1B6CA8", cursor:"pointer" },
  joinBtnOff:{ color:"var(--color-text-secondary)", cursor:"not-allowed" },

  hr:    { width:"100%", maxWidth:700, border:"none", borderTop:"0.5px solid var(--color-border-tertiary)", margin:"40px 0 32px" },
  cards: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, width:"100%", maxWidth:700, textAlign:"left" },
};

export default HomePages;



// import React, { useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faLink,
//   faVideo,
//   faPlus,
//   faCalendar,
//   faArrowRight,
// } from "@fortawesome/free-solid-svg-icons";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// const HomePages = () => {
//   const navigate = useNavigate();
//   const [code, setCode] = useState("");

//   // Create Meeting
//   const createMeeting = () => {
//     const id = Math.random().toString(36).substring(2, 10);
//     navigate(`/room/${id}`);
//   };

//   // Join Meeting
//   const joinMeeting = () => {
//     const trimmed = code.trim();

//     if (!trimmed) {
//       toast.error("Please enter meeting code or link");
//       return;
//     }

//     const cleanedCode = trimmed.split("/").pop()?.split("?")[0];

//     if (!cleanedCode) {
//       toast.error("Invalid meeting code");
//       return;
//     }

//     navigate(`/room/${cleanedCode}`);
//   };

//   // Schedule
//   const handleSchedule = () => {
//     toast("Calendar integration coming soon 🚀");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden">

//       {/* Navbar */}
//       <div className="navbar px-6 lg:px-12 py-5 border-b border-white/10 bg-black/20 backdrop-blur-xl">

//         <div className="flex-1">
//           <h1 className="text-3xl font-bold tracking-wide">
//             Meet<span className="text-primary">Flow</span>
//           </h1>
//         </div>

//         <div className="flex gap-3">

//           <button className="btn btn-ghost text-white hover:bg-white/10 rounded-full">
//             Features
//           </button>

//           <button className="btn btn-primary rounded-full px-6">
//             Sign In
//           </button>

//         </div>

//       </div>

//       {/* Hero */}
//       <div className="hero min-h-[88vh] px-6">

//         <div className="hero-content flex-col lg:flex-row-reverse gap-16 max-w-7xl">

//           {/* Right Side Image */}
//           <div className="relative flex-1">

//             <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>

//             <img
//               src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=1200&auto=format&fit=crop"
//               alt="meeting"
//               className="
//                 relative
//                 rounded-3xl
//                 border border-white/10
//                 shadow-[0_20px_80px_rgba(0,0,0,0.45)]
//               "
//             />

//             {/* Floating Card */}
//             <div
//               className="
//                 absolute
//                 -bottom-6
//                 -left-6
//                 bg-white/10
//                 backdrop-blur-2xl
//                 border border-white/10
//                 rounded-3xl
//                 p-5
//                 shadow-2xl
//               "
//             >
//               <p className="text-sm text-gray-300">
//                 Meetings hosted
//               </p>

//               <h2 className="text-3xl font-bold mt-1">
//                 12K+
//               </h2>
//             </div>

//           </div>

//           {/* Left Content */}
//           <div className="flex-1">

//             <div className="badge badge-primary badge-outline px-5 py-4 mb-6">
//               🚀 Modern Video Conferencing
//             </div>

//             <h1 className="text-5xl md:text-7xl font-bold leading-tight">
//               Video meetings built for everyone
//             </h1>

//             <p className="py-6 text-lg text-gray-300 leading-relaxed max-w-2xl">
//               Connect, collaborate and celebrate from anywhere with secure,
//               high-quality meetings inspired by Zoom & Google Meet.
//             </p>

//             {/* Actions */}
//             <div className="flex flex-col lg:flex-row gap-5">

//               {/* Dropdown */}
//               <div className="dropdown dropdown-bottom">

//                 <label
//                   tabIndex={0}
//                   className="
//                     btn
//                     btn-primary
//                     rounded-2xl
//                     h-14
//                     px-7
//                     text-base
//                     gap-3
//                     shadow-xl
//                     hover:scale-[1.02]
//                     transition-all
//                     duration-300
//                   "
//                 >
//                   <FontAwesomeIcon icon={faVideo} />
//                   New Meeting
//                 </label>

//                 {/* Dropdown Menu */}
//                 <div
//                   tabIndex={0}
//                   className="
//                     dropdown-content
//                     mt-4
//                     w-80
//                     rounded-3xl
//                     border border-white/10
//                     bg-slate-900/95
//                     backdrop-blur-2xl
//                     shadow-[0_20px_80px_rgba(0,0,0,0.45)]
//                     overflow-hidden
//                     z-50
//                   "
//                 >

//                   {/* Header */}
//                   <div className="p-5 border-b border-white/10">

//                     <h2 className="text-lg font-semibold text-white">
//                       Start a meeting
//                     </h2>

//                     <p className="text-sm text-gray-400 mt-1">
//                       Create and join meetings instantly
//                     </p>

//                   </div>

//                   {/* Options */}
//                   <div className="p-3 flex flex-col gap-2">

//                     {/* Create Link */}
//                     <button
//                       type="button"
//                       onClick={createMeeting}
//                       className="
//                         group
//                         flex items-center gap-4
//                         p-4
//                         rounded-2xl
//                         hover:bg-white/10
//                         transition-all duration-300
//                         text-left
//                       "
//                     >

//                       <div
//                         className="
//                           w-12 h-12
//                           rounded-2xl
//                           bg-primary/20
//                           flex items-center justify-center
//                           text-primary text-lg
//                           group-hover:scale-110
//                           transition
//                         "
//                       >
//                         <FontAwesomeIcon icon={faLink} />
//                       </div>

//                       <div>

//                         <h3 className="font-medium text-white">
//                           Create meeting link
//                         </h3>

//                         <p className="text-sm text-gray-400">
//                           Share a link with anyone
//                         </p>

//                       </div>

//                     </button>

//                     {/* Instant Meeting */}
//                     <button
//                       type="button"
//                       onClick={createMeeting}
//                       className="
//                         group
//                         flex items-center gap-4
//                         p-4
//                         rounded-2xl
//                         hover:bg-white/10
//                         transition-all duration-300
//                         text-left
//                       "
//                     >

//                       <div
//                         className="
//                           w-12 h-12
//                           rounded-2xl
//                           bg-success/20
//                           flex items-center justify-center
//                           text-success text-lg
//                           group-hover:scale-110
//                           transition
//                         "
//                       >
//                         <FontAwesomeIcon icon={faPlus} />
//                       </div>

//                       <div>

//                         <h3 className="font-medium text-white">
//                           Start instant meeting
//                         </h3>

//                         <p className="text-sm text-gray-400">
//                           Begin meeting immediately
//                         </p>

//                       </div>

//                     </button>

//                     {/* Schedule */}
//                     <button
//                       type="button"
//                       onClick={handleSchedule}
//                       className="
//                         group
//                         flex items-center gap-4
//                         p-4
//                         rounded-2xl
//                         hover:bg-white/10
//                         transition-all duration-300
//                         text-left
//                       "
//                     >

//                       <div
//                         className="
//                           w-12 h-12
//                           rounded-2xl
//                           bg-warning/20
//                           flex items-center justify-center
//                           text-warning text-lg
//                           group-hover:scale-110
//                           transition
//                         "
//                       >
//                         <FontAwesomeIcon icon={faCalendar} />
//                       </div>

//                       <div>

//                         <h3 className="font-medium text-white">
//                           Schedule meeting
//                         </h3>

//                         <p className="text-sm text-gray-400">
//                           Plan for later with calendar
//                         </p>

//                       </div>

//                     </button>

//                   </div>

//                   {/* Footer */}
//                   <div className="px-5 py-4 border-t border-white/10 bg-white/5">

//                     <p className="text-xs text-gray-400">
//                       Secure HD meetings with chat & screen sharing
//                     </p>

//                   </div>

//                 </div>

//               </div>

//               {/* Join Meeting */}
//               <div
//                 className="
//                   flex
//                   bg-white/5
//                   border border-white/10
//                   rounded-2xl
//                   overflow-hidden
//                   backdrop-blur-xl
//                   w-full
//                   max-w-xl
//                 "
//               >

//                 <input
//                   type="text"
//                   value={code}
//                   onChange={(e) => setCode(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") joinMeeting();
//                   }}
//                   placeholder="Enter meeting code or link"
//                   className="
//                     flex-1
//                     px-5
//                     bg-transparent
//                     outline-none
//                     text-white
//                     placeholder:text-gray-400
//                   "
//                 />

//                 <button
//                   onClick={joinMeeting}
//                   className="
//                     btn
//                     btn-primary
//                     rounded-none
//                     border-none
//                     h-full
//                     px-6
//                   "
//                 >
//                   Join
//                   <FontAwesomeIcon icon={faArrowRight} />
//                 </button>

//               </div>

//             </div>

//             {/* Features */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14">

//               <div
//                 className="
//                   bg-white/5
//                   border border-white/10
//                   p-6
//                   rounded-3xl
//                   backdrop-blur-xl
//                   hover:bg-white/10
//                   transition-all
//                 "
//               >
//                 <h3 className="font-semibold text-lg mb-2">
//                   HD Meetings
//                 </h3>

//                 <p className="text-sm text-gray-400">
//                   Crystal clear video and audio conferencing.
//                 </p>
//               </div>

//               <div
//                 className="
//                   bg-white/5
//                   border border-white/10
//                   p-6
//                   rounded-3xl
//                   backdrop-blur-xl
//                   hover:bg-white/10
//                   transition-all
//                 "
//               >
//                 <h3 className="font-semibold text-lg mb-2">
//                   Screen Sharing
//                 </h3>

//                 <p className="text-sm text-gray-400">
//                   Present work instantly to your team.
//                 </p>
//               </div>

//               <div
//                 className="
//                   bg-white/5
//                   border border-white/10
//                   p-6
//                   rounded-3xl
//                   backdrop-blur-xl
//                   hover:bg-white/10
//                   transition-all
//                 "
//               >
//                 <h3 className="font-semibold text-lg mb-2">
//                   Secure Rooms
//                 </h3>

//                 <p className="text-sm text-gray-400">
//                   End-to-end encrypted private meetings.
//                 </p>
//               </div>

//             </div>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// };

// export default HomePages;








// import React, { useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faLink,
//   faVideo,
//   faPlus,
//   faCalendar,
// } from "@fortawesome/free-solid-svg-icons";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// const HomePages = () => {
//   const navigate = useNavigate();
//   const [code, setCode] = useState("");

//   const createMeeting = () => {
//     const id = Math.random().toString(36).substring(2, 10);
//     navigate(`/room/${id}`);
//   };

//   const joinMeeting = () => {
//     const trimmed = code.trim();

//     if (!trimmed) {
//       toast.error("Please enter meeting code or link");
//       return;
//     }

//     const cleanedCode = trimmed.split("/").pop()?.split("?")[0];

//     if (!cleanedCode) {
//       toast.error("Invalid meeting code");
//       return;
//     }

//     navigate(`/room/${cleanedCode}`);
//   };

//   const handleSchedule = () => {
//     toast("Calendar integration coming soon");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">

//       <div className="card w-full max-w-4xl bg-base-100 shadow-xl border border-base-300">
//         <div className="card-body items-center text-center">

//           {/* Heading */}
//           <h1 className="text-4xl md:text-5xl font-semibold">
//             Video calls and meetings for everyone
//           </h1>

//           <p className="text-base-content/70 mt-2 mb-8">
//             Connect, collaborate and celebrate from anywhere
//           </p>

//           {/* Actions */}
//           <div className="flex flex-col md:flex-row gap-4 w-full justify-center">

//             {/* Dropdown */}
//             <div className="dropdown">
//               <label tabIndex={0} className="btn btn-primary gap-2">
//                 <FontAwesomeIcon icon={faVideo} />
//                 New meeting
//               </label>

//               <ul
//                 tabIndex={0}
//                 className="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow"
//               >
//                 <li>
//                   <button type="button" onClick={createMeeting}>
//                     <FontAwesomeIcon icon={faLink} />
//                     Create link
//                   </button>
//                 </li>

//                 <li>
//                   <button type="button" onClick={createMeeting}>
//                     <FontAwesomeIcon icon={faPlus} />
//                     Start instant meeting
//                   </button>
//                 </li>

//                 <li>
//                   <button type="button" onClick={handleSchedule}>
//                     <FontAwesomeIcon icon={faCalendar} />
//                     Schedule in Calendar
//                   </button>
//                 </li>
//               </ul>
//             </div>

//             {/* Join Section */}
//             <div className="flex w-full md:w-auto gap-2">

//               <input
//                 type="text"
//                 value={code}
//                 onChange={(e) => setCode(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") joinMeeting();
//                 }}
//                 placeholder="Enter a code or link"
//                 className="input input-bordered w-full md:w-80"
//               />

//               <button className="btn btn-outline btn-primary" onClick={joinMeeting}>
//                 Join
//               </button>

//             </div>

//           </div>

//         </div>
//       </div>

//     </div>
//   );
// };

// export default HomePages;





// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const HomePages = () => {
//   const navigate = useNavigate();
//   const [code, setCode] = useState("");

//   const createMeeting = () => {
//     const id = Math.random().toString(36).substring(2, 8);
//     navigate(`/room/${id}`);
//   };

//   const joinMeeting = () => {
//     if (!code.trim()) return;

//     const cleanedCode = code.split("/").pop();
//     navigate(`/room/${cleanedCode}`);
//   };

//   return (
//     <div className="h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
//       <h1 className="text-3xl font-bold">Video Meeting App</h1>

//       <button onClick={createMeeting} className="btn btn-primary">
//         New Meeting
//       </button>

//       <div className="flex gap-2">
//         <input
//           value={code}
//           onChange={(e) => setCode(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && joinMeeting()}
//           placeholder="Enter meeting code or link"
//           className="input input-bordered"
//         />

//         <button onClick={joinMeeting} className="btn btn-outline">
//           Join
//         </button>
//       </div>
//     </div>
//   );
// };

// export default HomePages;


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const HomePages = () => {
//   const navigate = useNavigate();
//   const [code, setCode] = useState("");

//   const createMeeting = () => {
//     const id = Math.random().toString(36).substring(2, 8);
//     navigate(`/room/${id}`);
//   };

//   const joinMeeting = () => {
//     if (!code.trim()) return;
//     navigate(`/room/${code}`);
//   };

//   return (
//     <div className="h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
//       <h1 className="text-3xl font-bold">Video Meeting App</h1>

//       <button onClick={createMeeting} className="btn btn-primary">
//         New Meeting
//       </button>

//       <div className="flex gap-2">
//         <input
//           value={code}
//           onChange={(e) => setCode(e.target.value)}
//           placeholder="Enter meeting code"
//           className="input input-bordered"
//         />
//         <button onClick={joinMeeting} className="btn btn-outline">
//           Join
//         </button>
//       </div>
//     </div>
//   );
// };

// export default HomePages;
// import React from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faLink,
//   faVideo,
//   faPlus,
//   faCalendar,
// } from "@fortawesome/free-solid-svg-icons";

// const HomePages = () => {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">

//       <div className="card w-full max-w-4xl bg-base-100 shadow-xl border border-base-300">
//         <div className="card-body items-center text-center">

//           {/* Heading */}
//           <h1 className="text-4xl md:text-5xl font-semibold">
//             Video calls and meetings for everyone
//           </h1>

//           <p className="text-base-content/70 mt-2 mb-8">
//             Connect, collaborate and celebrate from anywhere
//           </p>

//           {/* Actions */}
//           <div className="flex flex-col md:flex-row gap-4 w-full justify-center">

//             {/* Dropdown */}
//             <div className="dropdown">
//               <label tabIndex={0} className="btn btn-primary gap-2">
//                 <FontAwesomeIcon icon={faVideo} />
//                 New meeting
//               </label>

//               <ul
//                 tabIndex={0}
//                 className="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow"
//               >
//                 <li>
//                   <a>
//                     <FontAwesomeIcon icon={faLink} />
//                     Create link
//                   </a>
//                 </li>

//                 <li>
//                   <a>
//                     <FontAwesomeIcon icon={faPlus} />
//                     Start instant meeting
//                   </a>
//                 </li>

//                 <li>
//                   <a>
//                     <FontAwesomeIcon icon={faCalendar} />
//                     Schedule in Calendar
//                   </a>
//                 </li>
//               </ul>
//             </div>

//             {/* Join Section */}
//             <div className="flex w-full md:w-auto gap-2">

//               <input
//                 type="text"
//                 placeholder="Enter a code or link"
//                 className="input input-bordered w-full md:w-80"
//               />

//               <button className="btn btn-outline btn-primary">
//                 Join
//               </button>

//             </div>

//           </div>

//         </div>
//       </div>

//     </div>
//   );
// };

// export default HomePages;


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faLink,
//   faVideo,
//   faPlus,
//   faCalendar,
// } from "@fortawesome/free-solid-svg-icons";

// const HomePages = () => {
//   const navigate = useNavigate();   // ✅ important
//   const [code, setCode] = useState("");

//   const createMeeting = () => {
//     const id = Math.random().toString(36).substring(2, 8);
//     navigate(`/room/${id}`);
//   };

//   const joinMeeting = () => {
//     if (!code) return;
//     navigate(`/room/${code}`);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">

//       <div className="card w-full max-w-4xl bg-base-100 shadow-xl border border-base-300">
//         <div className="card-body items-center text-center">

//           <h1 className="text-4xl md:text-5xl font-semibold">
//             Video calls and meetings for everyone
//           </h1>

//           <p className="text-base-content/70 mt-2 mb-8">
//             Connect, collaborate and celebrate from anywhere
//           </p>

//           <div className="flex flex-col md:flex-row gap-4 w-full justify-center">

//             {/* New Meeting */}
//             <button onClick={createMeeting} className="btn btn-primary gap-2">
//               <FontAwesomeIcon icon={faVideo} />
//               New meeting
//             </button>

//             {/* Join */}
//             <div className="flex w-full md:w-auto gap-2">

//               <input
//                 value={code}
//                 onChange={(e) => setCode(e.target.value)}
//                 placeholder="Enter a code"
//                 className="input input-bordered w-full md:w-80"
//               />

//               <button onClick={joinMeeting} className="btn btn-outline btn-primary">
//                 Join
//               </button>

//             </div>

//           </div>

//         </div>
//       </div>

//     </div>
//   );
// };

// export default HomePages;

