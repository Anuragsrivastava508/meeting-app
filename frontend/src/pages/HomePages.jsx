import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink,
  faVideo,
  faPlus,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const HomePages = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const createMeeting = () => {
    const id = Math.random().toString(36).substring(2, 10);
    navigate(`/room/${id}`);
  };

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

  const handleSchedule = () => {
    toast("Calendar integration coming soon");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">

      <div className="card w-full max-w-4xl bg-base-100 shadow-xl border border-base-300">
        <div className="card-body items-center text-center">

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-semibold">
            Video calls and meetings for everyone
          </h1>

          <p className="text-base-content/70 mt-2 mb-8">
            Connect, collaborate and celebrate from anywhere
          </p>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4 w-full justify-center">

            {/* Dropdown */}
            <div className="dropdown">
              <label tabIndex={0} className="btn btn-primary gap-2">
                <FontAwesomeIcon icon={faVideo} />
                New meeting
              </label>

              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow"
              >
                <li>
                  <button type="button" onClick={createMeeting}>
                    <FontAwesomeIcon icon={faLink} />
                    Create link
                  </button>
                </li>

                <li>
                  <button type="button" onClick={createMeeting}>
                    <FontAwesomeIcon icon={faPlus} />
                    Start instant meeting
                  </button>
                </li>

                <li>
                  <button type="button" onClick={handleSchedule}>
                    <FontAwesomeIcon icon={faCalendar} />
                    Schedule in Calendar
                  </button>
                </li>
              </ul>
            </div>

            {/* Join Section */}
            <div className="flex w-full md:w-auto gap-2">

              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") joinMeeting();
                }}
                placeholder="Enter a code or link"
                className="input input-bordered w-full md:w-80"
              />

              <button className="btn btn-outline btn-primary" onClick={joinMeeting}>
                Join
              </button>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default HomePages;





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

