

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import HomePages    from './pages/HomePages';
import SignupPages  from './pages/SignupPages';
import LoginPages   from './pages/LoginPages';
import SettingPages from './pages/SettingPages';
import ProfilePages from './pages/ProfilePages';
import LobbyScreen  from "./pages/LobbyScreen";
import MeetingScreen from "./pages/MeetingScreen";
import Navbar       from './components/Navbar';
import { useAuthStore } from "./store/useAuthStore";

const HIDE_NAVBAR = ["/", "/lobby", "/room"];

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  // hide Navbar on home, lobby, room pages (they have their own topbars)
  const hideNavbar = HIDE_NAVBAR.some(p => location.pathname === p || location.pathname.startsWith(p + "/"));

  useEffect(() => { checkAuth(); }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/"          element={authUser ? <HomePages />    : <Navigate to="/login" />} />
        <Route path="/signup"    element={!authUser ? <SignupPages /> : <Navigate to="/" />} />
        <Route path="/login"     element={!authUser ? <LoginPages />  : <Navigate to="/" />} />
        <Route path="/lobby/:id" element={authUser ? <LobbyScreen />  : <Navigate to="/login" />} />
        <Route path="/room/:id"  element={authUser ? <MeetingScreen />: <Navigate to="/login" />} />
        <Route path="/settings"  element={<SettingPages />} />
        <Route path="/profile"   element={authUser ? <ProfilePages /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;