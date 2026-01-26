Meeting App – Frontend

This is the frontend of the Meeting App, built using React, Vite, and Tailwind CSS.
It handles the user interface for authentication, meeting rooms, and real-time interaction with the backend using Socket.IO and WebRTC.

🚀 Tech Stack

React

Vite

Tailwind CSS

Socket.IO Client

Axios

JavaScript (ES Modules)

📁 Project Structure
frontend/
│
├── public/
│   └── index.html
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── package.json
└── README.md

⚙️ Prerequisites

Make sure you have installed:

Node.js (v18 or later recommended)

npm (comes with Node.js)

Check versions:

node -v
npm -v

🛠️ Installation & Setup (Step-by-Step)
1️⃣ Clone the Repository
git clone <repository-url>
cd frontend

2️⃣ Install Dependencies
npm install

🎨 Tailwind CSS Setup (Stable v3)
3️⃣ Install Tailwind CSS
npm install -D tailwindcss@3.4.17 postcss autoprefixer

4️⃣ Initialize Tailwind
npx tailwindcss init -p


This creates:

tailwind.config.js
postcss.config.js

5️⃣ Configure tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

6️⃣ Configure postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

7️⃣ Add Tailwind to CSS

📄 src/index.css

@tailwind base;
@tailwind components;
@tailwind utilities;

8️⃣ Import CSS in main.jsx

📄 src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

▶️ Run the Frontend
Development Mode
npm run dev


Open in browser:

http://localhost:5173

🧪 Test Tailwind (Verification)

📄 src/App.jsx

function App() {
  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <h1 className="text-white text-5xl font-bold">
        Frontend Ready 🚀
      </h1>
    </div>
  )
}

export default App


If you see:

Black background

Big white text

👉 Tailwind is working correctly ✅

🔌 Environment Variables (Optional)

Create a .env file in frontend/:

VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

🔁 Frontend ↔ Backend Flow
User Login → REST API (Axios)
Create / Join Meeting → Backend
Socket.IO → Real-time signaling
WebRTC → Audio / Video (P2P)

📈 Future Enhancements

Login / Signup UI

Meeting Room UI (Video Grid)

Screen Sharing

In-meeting Chat

Responsive Mobile UI

📄 License

This project is licensed under the MIT License.

👨‍💻 Author

Anurag Srivastava
Frontend Developer | React | Tailwind | Real-Time Apps