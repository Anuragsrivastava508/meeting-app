import React from 'react'

const Navbar = () => {
  return (
    <div>
      Navbar
    </div>
  )
}

export default Navbar;

// import React, { useState } from "react";
// import { Link } from "react-router-dom";

// const Navbar = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-700">
//       <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

//         {/* Logo */}
//         <Link
//           to="/"
//           className="text-2xl font-bold text-white cursor-pointer hover:text-blue-400"
//         >
//           Anurag Srivastava
//         </Link>

//         {/* Desktop Menu */}
//         <div className="hidden md:flex space-x-6 text-gray-300">
//           <Link to="/" className="hover:text-blue-400">Home</Link>
//           <Link to="/education" className="hover:text-blue-400">Education</Link>
//            {/* //<Link to="/skill" className="hover:text-blue-400">Skill</Link> */}
//             <Link onClick={() => setIsOpen(false)} to="/skill" className="block">Skill</Link>
//            <Link to="/experience" className="hover:text-blue-400">Experience</Link>
//           <Link to="/projects" className="hover:text-blue-400">Projects</Link>
//           <Link to="/contact" className="hover:text-blue-400">Contact</Link>
//         </div>

//         {/* Mobile Button */}
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="md:hidden text-white"
//         >
//           ☰
//         </button>
//       </div>

//       {/* Mobile Menu */}
//       {isOpen && (
//         <div className="md:hidden bg-gray-900 px-4 pb-4 space-y-2 text-gray-300">
//           <Link onClick={() => setIsOpen(false)} to="/" className="block">Home</Link>
//           <Link onClick={() => setIsOpen(false)} to="/education" className="block">Education</Link>
//            <Link onClick={() => setIsOpen(false)} to="/education" className="block">Skill</Link>
//           <Link onClick={() => setIsOpen(false)} to="/projects" className="block">Projects</Link>
//           <Link onClick={() => setIsOpen(false)} to="/experience" className="block">Experience</Link>
//           <Link onClick={() => setIsOpen(false)} to="/contact" className="block">Contact</Link>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;




