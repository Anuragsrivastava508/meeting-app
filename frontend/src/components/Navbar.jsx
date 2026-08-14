import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

const NAV_ITEMS = [
  { to: "/settings", label: "Settings", Icon: Settings },
  { to: "/profile", label: "Profile", Icon: User },
];

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const toggleBtnRef = useRef(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !toggleBtnRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, closeMenu]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (e) => e.key === "Escape" && closeMenu();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen, closeMenu]);

  const handleLogout = async () => {
    if (loggingOut) return;
    try {
      setLoggingOut(true);
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoggingOut(false);
      closeMenu();
    }
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-2 py-1 rounded-md transition-colors
     hover:bg-base-200 focus-visible:outline-none focus-visible:ring-2
     focus-visible:ring-primary
     ${isActive ? "text-primary font-medium" : "text-base-content"}`;

  return (
    <header className="bg-base-100/80 backdrop-blur-lg border-b border-base-300 fixed w-full top-0 z-40">
      <nav className="px-4 h-16 w-full flex items-center justify-between" aria-label="Main">
        {/* LOGO */}
        <NavLink
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition shrink-0"
        >
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold max-[350px]:hidden">QuickMeet</h1>
        </NavLink>

        {/* DESKTOP */}
        {authUser && (
          <div className="hidden sm:flex items-center gap-2">
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-base-200
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                         disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}

        {/* MOBILE TOGGLE */}
        {authUser && (
          <button
            ref={toggleBtnRef}
            type="button"
            className="sm:hidden p-2 rounded-md hover:bg-base-200
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
      </nav>

      {/* MOBILE MENU */}
      {authUser && menuOpen && (
        <div
          id="mobile-nav-menu"
          ref={menuRef}
          className="sm:hidden bg-base-100 border-t border-base-300 p-4 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} onClick={closeMenu} className={linkClass}>
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-base-200
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                       disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;




// import { Link } from "react-router-dom";
// import { useAuthStore } from "../store/useAuthStore";
// import { LogOut, MessageSquare, Settings, User, Menu } from "lucide-react";
// import { useState } from "react";

// const Navbar = () => {
//   const { logout, authUser } = useAuthStore();
//   const [menuOpen, setMenuOpen] = useState(false);

//   return (
//     <header
//       className="
//         bg-base-100 border-b border-base-300 
//         fixed w-full top-0 z-40 
//         backdrop-blur-lg bg-base-100/80
//       "
//     >
//       <div className="px-4 h-16 w-full flex items-center justify-between">

//         {/* LEFT: LOGO */}
//         <div className="flex items-center gap-2 shrink-0">
//           <Link
//             to="/"
//             className="flex items-center gap-2 hover:opacity-80 transition"
//           >
//             <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
//               <MessageSquare className="w-5 h-5 text-primary" />
//             </div>
//             <h1 className="text-lg font-bold max-[350px]:hidden">QuickMeet</h1>
//           </Link>
//         </div>

//         {/* DESKTOP BUTTONS */}
//         <div className="hidden sm:flex items-center gap-2">
//           <Link to="/settings" className="btn btn-sm gap-2">
//             <Settings className="w-4 h-4" /> Settings
//           </Link>

//           <Link to="/profile" className="btn btn-sm gap-2">
//             <User className="w-5 h-5" /> Profile
//           </Link>

//           <button onClick={logout} className="flex items-center gap-2 px-2 py-1">
//             <LogOut className="w-5 h-5" /> Logout
//           </button>
//         </div>

//         {/* MOBILE MENU BUTTON */}
//         <button
//           className="sm:hidden p-2"
//           onClick={() => setMenuOpen(!menuOpen)}
//         >
//           <Menu className="w-6 h-6" />
//         </button>
//       </div>

//       {/* MOBILE DROPDOWN MENU */}
//       {menuOpen && (
//         <div className="sm:hidden bg-base-100 border-t border-base-300 p-4 flex flex-col gap-3">
//           <Link
//             to="/settings"
//             onClick={() => setMenuOpen(false)}
//             className="flex items-center gap-2"
//           >
//             <Settings className="w-5 h-5" /> Settings
//           </Link>

//           <Link
//             to="/profile"
//             onClick={() => setMenuOpen(false)}
//             className="flex items-center gap-2"
//           >
//             <User className="w-5 h-5" /> Profile
//           </Link>

//           <button
//             onClick={logout}
//             className="flex items-center gap-2"
//           >
//             <LogOut className="w-5 h-5" /> Logout
//           </button>
//         </div>
//       )}
//     </header>
//   );
// };

// export default Navbar;

