// import { useState } from "react";
// import { FaMicrophone, FaVideo } from "react-icons/fa";
// import { MdCallEnd } from "react-icons/md";
// import { HiUserGroup } from "react-icons/hi";
// import { IoChatbubbleEllipses } from "react-icons/io5";

// export default function MeetingScreen() {
//   const [showPopup, setShowPopup] = useState(true);

//   return (
//     <div className="h-screen bg-black relative text-white">

//       {/* VIDEO AREA */}
//       <div className="w-full h-full flex items-center justify-center">
//         <div className="w-[80%] h-[80%] bg-gray-900 rounded-xl flex items-center justify-center">
//           <p>Your Camera</p>
//         </div>
//       </div>

//       {/* POPUP (LINK SHARE) */}
//       {showPopup && (
//         <div className="absolute top-20 left-10 bg-white text-black p-5 rounded-xl shadow-xl w-80">

//           <div className="flex justify-between items-center mb-3">
//             <h2 className="font-semibold">Your meeting's ready</h2>
//             <button onClick={() => setShowPopup(false)}>✕</button>
//           </div>

//           <button className="btn btn-primary w-full mb-3">
//             Add others
//           </button>

//           <p className="text-sm mb-2">
//             Share this link with others
//           </p>

//           <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
//             <span className="text-sm">meet/app/abc123</span>
//             <button className="text-blue-600">📋</button>
//           </div>

//         </div>
//       )}

//       {/* BOTTOM BAR */}
//       <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-800 px-6 py-3 rounded-full">

//         <button className="btn btn-circle bg-gray-700 border-none">
//           <FaMicrophone />
//         </button>

//         <button className="btn btn-circle bg-gray-700 border-none">
//           <FaVideo />
//         </button>

//         <button className="btn btn-circle bg-red-600 border-none">
//           <MdCallEnd />
//         </button>

//         <button className="btn btn-circle bg-gray-700 border-none">
//           <HiUserGroup />
//         </button>

//         <button className="btn btn-circle bg-gray-700 border-none">
//           <IoChatbubbleEllipses />
//         </button>

//       </div>

//     </div>
//   );
// }