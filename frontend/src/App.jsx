
import React from 'react'
import Navbar from './components/Navbar';
import { Routes,Route } from 'react-router-dom';

import HomePages from './pages/homePages';
import SignupPages from './pages/SignupPages';
import LoginPages from './pages/LoginPages';
import SettingPages from './pages/SettingPages';
import ProfilePages from './pages/ProfilePages';

const App = () => {
  return (
  <div>
    <Navbar/>
    <Routes>
    <Route path='/' element={<HomePages/>}/>
    <Route path='/Signup' element={<SignupPages/>}/>
    <Route path='/Login' element={<LoginPages/>}/>
    <Route path='/Settings' element={<SettingPages/>}/>
    <Route path='/Profile' element={<ProfilePages/>}/>

    </Routes>
    
  </div>
  )
}

export default App;