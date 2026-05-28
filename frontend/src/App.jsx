

import React from 'react'
import Navbar from './components/Navbar';
import { Routes,Route,Navigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import HomePages from './pages/HomePages';
import SignupPages from './pages/SignupPages';
import LoginPages from './pages/LoginPages';
import SettingPages from './pages/SettingPages';
import ProfilePages from './pages/ProfilePages';
import MeetingScreen from "./pages/MeetingScreen";
import Footer from "./components/Footer";
import { useAuthStore } from "./store/useAuthStore";

import { useEffect } from 'react';

const App = () => {
const {authUser,checkAuth,isCheckingAuth} = useAuthStore();
const location = useLocation();
const isMeetingRoute = location.pathname.startsWith("/room/");

useEffect(()=>{
  checkAuth();
},[checkAuth] );

console.log({authUser});
if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
  <div className="min-h-screen flex flex-col">
    {!isMeetingRoute && <Navbar />}

    <main className="flex-1 pt-16">
      <Routes>
        <Route
          path="/room/:id"
          element={authUser ? <MeetingScreen /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={authUser ? <HomePages /> : <Navigate to="/Login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPages /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPages /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingPages />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePages /> : <Navigate to="/Login" />}
        />
      </Routes>
    </main>

    {!isMeetingRoute && <Footer />}
    <Toaster />
  </div>
  )
}

export default App;