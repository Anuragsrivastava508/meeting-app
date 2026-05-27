import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink,
  faVideo,
  faPlus,
  faCalendar,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const HomePages = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  // Create Meeting
  const createMeeting = () => {
    const id = Math.random().toString(36).substring(2, 10);
    navigate(`/room/${id}`);
  };

  // Join Meeting
  const joinMeeting = () => {
    const trimmed = code.trim();

    if (!trimmed) {
      toast.error("Please enter meeting code or link");
      return;
    }

    const cleanedCode = trimmed.split("/").pop()?.split("?")[0];

    if (!cleanedCode) {
      toast.error("Invalid meeting code");
      return;
    }

    navigate(`/room/${cleanedCode}`);
  };

  // Schedule
  const handleSchedule = () => {
    toast("Calendar integration coming soon 🚀");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden">

      {/* Navbar */}
      <div className="navbar px-6 lg:px-12 py-5 border-b border-white/10 bg-black/20 backdrop-blur-xl">

        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-wide">
            Meet<span className="text-primary">Flow</span>
          </h1>
        </div>

        <div className="flex gap-3">

          <button className="btn btn-ghost text-white hover:bg-white/10 rounded-full">
            Features
          </button>

          <button className="btn btn-primary rounded-full px-6">
            Sign In
          </button>

        </div>

      </div>

      {/* Hero */}
      <div className="hero min-h-[88vh] px-6">

        <div className="hero-content flex-col lg:flex-row-reverse gap-16 max-w-7xl">

          {/* Right Side Image */}
          <div className="relative flex-1">

            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>

            <img
              src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=1200&auto=format&fit=crop"
              alt="meeting"
              className="
                relative
                rounded-3xl
                border border-white/10
                shadow-[0_20px_80px_rgba(0,0,0,0.45)]
              "
            />

            {/* Floating Card */}
            <div
              className="
                absolute
                -bottom-6
                -left-6
                bg-white/10
                backdrop-blur-2xl
                border border-white/10
                rounded-3xl
                p-5
                shadow-2xl
              "
            >
              <p className="text-sm text-gray-300">
                Meetings hosted
              </p>

              <h2 className="text-3xl font-bold mt-1">
                12K+
              </h2>
            </div>

          </div>

          {/* Left Content */}
          <div className="flex-1">

            <div className="badge badge-primary badge-outline px-5 py-4 mb-6">
              🚀 Modern Video Conferencing
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Video meetings built for everyone
            </h1>

            <p className="py-6 text-lg text-gray-300 leading-relaxed max-w-2xl">
              Connect, collaborate and celebrate from anywhere with secure,
              high-quality meetings inspired by Zoom & Google Meet.
            </p>

            {/* Actions */}
            <div className="flex flex-col lg:flex-row gap-5">

              {/* Dropdown */}
              <div className="dropdown dropdown-bottom">

                <label
                  tabIndex={0}
                  className="
                    btn
                    btn-primary
                    rounded-2xl
                    h-14
                    px-7
                    text-base
                    gap-3
                    shadow-xl
                    hover:scale-[1.02]
                    transition-all
                    duration-300
                  "
                >
                  <FontAwesomeIcon icon={faVideo} />
                  New Meeting
                </label>

                {/* Dropdown Menu */}
                <div
                  tabIndex={0}
                  className="
                    dropdown-content
                    mt-4
                    w-80
                    rounded-3xl
                    border border-white/10
                    bg-slate-900/95
                    backdrop-blur-2xl
                    shadow-[0_20px_80px_rgba(0,0,0,0.45)]
                    overflow-hidden
                    z-50
                  "
                >

                  {/* Header */}
                  <div className="p-5 border-b border-white/10">

                    <h2 className="text-lg font-semibold text-white">
                      Start a meeting
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                      Create and join meetings instantly
                    </p>

                  </div>

                  {/* Options */}
                  <div className="p-3 flex flex-col gap-2">

                    {/* Create Link */}
                    <button
                      type="button"
                      onClick={createMeeting}
                      className="
                        group
                        flex items-center gap-4
                        p-4
                        rounded-2xl
                        hover:bg-white/10
                        transition-all duration-300
                        text-left
                      "
                    >

                      <div
                        className="
                          w-12 h-12
                          rounded-2xl
                          bg-primary/20
                          flex items-center justify-center
                          text-primary text-lg
                          group-hover:scale-110
                          transition
                        "
                      >
                        <FontAwesomeIcon icon={faLink} />
                      </div>

                      <div>

                        <h3 className="font-medium text-white">
                          Create meeting link
                        </h3>

                        <p className="text-sm text-gray-400">
                          Share a link with anyone
                        </p>

                      </div>

                    </button>

                    {/* Instant Meeting */}
                    <button
                      type="button"
                      onClick={createMeeting}
                      className="
                        group
                        flex items-center gap-4
                        p-4
                        rounded-2xl
                        hover:bg-white/10
                        transition-all duration-300
                        text-left
                      "
                    >

                      <div
                        className="
                          w-12 h-12
                          rounded-2xl
                          bg-success/20
                          flex items-center justify-center
                          text-success text-lg
                          group-hover:scale-110
                          transition
                        "
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </div>

                      <div>

                        <h3 className="font-medium text-white">
                          Start instant meeting
                        </h3>

                        <p className="text-sm text-gray-400">
                          Begin meeting immediately
                        </p>

                      </div>

                    </button>

                    {/* Schedule */}
                    <button
                      type="button"
                      onClick={handleSchedule}
                      className="
                        group
                        flex items-center gap-4
                        p-4
                        rounded-2xl
                        hover:bg-white/10
                        transition-all duration-300
                        text-left
                      "
                    >

                      <div
                        className="
                          w-12 h-12
                          rounded-2xl
                          bg-warning/20
                          flex items-center justify-center
                          text-warning text-lg
                          group-hover:scale-110
                          transition
                        "
                      >
                        <FontAwesomeIcon icon={faCalendar} />
                      </div>

                      <div>

                        <h3 className="font-medium text-white">
                          Schedule meeting
                        </h3>

                        <p className="text-sm text-gray-400">
                          Plan for later with calendar
                        </p>

                      </div>

                    </button>

                  </div>

                  {/* Footer */}
                  <div className="px-5 py-4 border-t border-white/10 bg-white/5">

                    <p className="text-xs text-gray-400">
                      Secure HD meetings with chat & screen sharing
                    </p>

                  </div>

                </div>

              </div>

              {/* Join Meeting */}
              <div
                className="
                  flex
                  bg-white/5
                  border border-white/10
                  rounded-2xl
                  overflow-hidden
                  backdrop-blur-xl
                  w-full
                  max-w-xl
                "
              >

                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") joinMeeting();
                  }}
                  placeholder="Enter meeting code or link"
                  className="
                    flex-1
                    px-5
                    bg-transparent
                    outline-none
                    text-white
                    placeholder:text-gray-400
                  "
                />

                <button
                  onClick={joinMeeting}
                  className="
                    btn
                    btn-primary
                    rounded-none
                    border-none
                    h-full
                    px-6
                  "
                >
                  Join
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>

              </div>

            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14">

              <div
                className="
                  bg-white/5
                  border border-white/10
                  p-6
                  rounded-3xl
                  backdrop-blur-xl
                  hover:bg-white/10
                  transition-all
                "
              >
                <h3 className="font-semibold text-lg mb-2">
                  HD Meetings
                </h3>

                <p className="text-sm text-gray-400">
                  Crystal clear video and audio conferencing.
                </p>
              </div>

              <div
                className="
                  bg-white/5
                  border border-white/10
                  p-6
                  rounded-3xl
                  backdrop-blur-xl
                  hover:bg-white/10
                  transition-all
                "
              >
                <h3 className="font-semibold text-lg mb-2">
                  Screen Sharing
                </h3>

                <p className="text-sm text-gray-400">
                  Present work instantly to your team.
                </p>
              </div>

              <div
                className="
                  bg-white/5
                  border border-white/10
                  p-6
                  rounded-3xl
                  backdrop-blur-xl
                  hover:bg-white/10
                  transition-all
                "
              >
                <h3 className="font-semibold text-lg mb-2">
                  Secure Rooms
                </h3>

                <p className="text-sm text-gray-400">
                  End-to-end encrypted private meetings.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default HomePages;








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

