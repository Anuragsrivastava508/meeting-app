🧑‍💻 Meeting App – Backend

A real-time meeting application backend built using Node.js, Express, Socket.IO, and WebRTC, with MongoDB for data storage and Cloudinary for media handling.

This backend handles:

Authentication

Meeting creation & management

Real-time signaling for audio/video calls

Media uploads

Secure and scalable APIs

🚀 Tech Stack

Node.js

Express

Socket.IO

WebRTC (Real-Time Communication)

MongoDB

Cloudinary

JWT Authentication

Mongoose ODM

📌 Features

User Signup & Login (JWT based)

Create & Join Meetings

Real-time signaling using Socket.IO

WebRTC support for audio/video calls

Socket rooms for meetings

Cloudinary integration for profile images / uploads

Secure API architecture

Scalable folder structure

📁 Project Folder Structure
backend/
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── cloudinary.js
│   │   └── socket.js
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   └── meeting.model.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── meeting.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   └── meeting.service.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── meeting.routes.js
│   │
│   ├── socket/
│   │   └── rtc.socket.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── utils/
│   │   └── generateMeetingId.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── package.json
└── README.md

⚙️ Environment Variables

Create a .env file in the root directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

🛠️ Installation & Setup
1️⃣ Clone Repository
git clone <repository-url>
cd backend

2️⃣ Install Dependencies
npm install

3️⃣ Run in Development
npx nodemon src/server.js

4️⃣ Run in Production
node src/server.js

🔁 WebRTC Signaling Flow
Client A → Offer → Socket Server
Socket Server → Offer → Client B

Client B → Answer → Socket Server
Socket Server → Answer → Client A

ICE Candidates exchanged
Media flows peer-to-peer (WebRTC)


⚠️ Note:
Server is used only for signaling, not for audio/video streaming.

🔐 Security Best Practices

JWT-based authentication

Protected routes with middleware

.env file excluded from version control

Role-based access (future scope)

📈 Future Enhancements

Group video meetings

Screen sharing

Meeting recording

Chat during meetings

Redis for socket scaling

TURN/STUN server integration

🤝 Contributing

Contributions are welcome.
Feel free to fork the repository and submit a pull request.

📄 License

This project is licensed under the MIT License.

💡 Author

Anurag Srivastava
Backend Developer | Node.js | Real-Time Applications