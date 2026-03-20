// import React from 'react'

// const App = () => {
//   return (
//     <div>
//       <h1 className="text-5xl text-red-500">TAILWIND WORKING 🚀</h1>
//     </div>
//   )
// }

// export default App

import React from 'react'
import Navbar from './components/Navbar';
import { Routes,Route,Navigate } from 'react-router-dom';
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import HomePages from './pages/homePages';
import SignupPages from './pages/SignupPages';
import LoginPages from './pages/LoginPages';
import SettingPages from './pages/SettingPages';
import ProfilePages from './pages/ProfilePages';

import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from 'react';

const App = () => {
const {authUser,checkAuth,isCheckingAuth} = useAuthStore();

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
  <div>
    <Navbar/>
    <Routes>
       <Route
          path="/"
          element={authUser ? <HomePages /> : <Navigate to="/Login" />}
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

      <Toaster />
  </div>
  )
}

export default App;