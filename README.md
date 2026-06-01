# Meeting App

A full-stack real-time meeting application built with React, Vite, Node.js, Express, Socket.IO, and mediasoup.

The project includes:
- `frontend/` — React + Vite client application
- `backend/` — Node.js + Express server with Socket.IO, mediasoup signaling, MongoDB, and Cloudinary support

## Key Features

- User signup and login with JWT authentication
- Create and join meeting rooms
- Realtime meeting signaling using Socket.IO
- WebRTC media negotiation with mediasoup
- Profile and settings pages
- Responsive frontend using Tailwind CSS and DaisyUI

## Project Structure

```
meeting app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
   │   ├── routes/
│   │   ├── socket/
│   │   └── utils/
│   ├── package.json
│   └── scripts/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── store/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Prerequisites

- Node.js 18+ (or compatible)
- npm
- MongoDB instance
- Cloudinary account (for media handling)

## Backend Setup

1. Open a terminal and navigate to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in `backend/` with the following values:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Start the backend server in development mode:

```bash
npm run dev
```

The backend server listens on `http://localhost:5001` by default.

## Frontend Setup

1. Open a second terminal and navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will run on the Vite default port, usually `http://localhost:5173`.

## Running the App

1. Start the backend server first.
2. Start the frontend app.
3. Open the frontend URL in your browser.
4. Sign up or log in, then create or join a meeting room.

## Available Scripts

### Backend
- `npm run dev` — start the backend with `nodemon`
- `npm start` — start the backend using Node.js

### Frontend
- `npm run dev` — start the Vite development server
- `npm run build` — build the frontend for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint on the frontend codebase

## Notes

- The frontend uses `http://localhost:5001` as the Socket.IO backend base URL.
- The backend uses mediasoup for WebRTC routing and signaling.

## Future Improvements

- Add group video conferencing support
- Add screen sharing
- Add meeting recording
- Add TURN server configuration for production
- Add chat and in-call messaging

## License

This project is available under the MIT License.
