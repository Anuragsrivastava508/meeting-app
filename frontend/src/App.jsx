
import React from 'react'
import Navbar from './components/Navbar';
import Footer from './components/footer';

const App = () => {
  return (
    <div>
    <Navbar/>
  
    <div className="h-screen bg-black flex items-center justify-center">
      <h1 className="text-white text-5xl font-bold">
        Frontend Ready 🚀
      </h1>
    </div>

<Footer/>
  
      </div>
  )
}

export default App;