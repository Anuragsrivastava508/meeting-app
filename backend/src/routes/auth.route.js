// import express from "express";

// import { signup,login,logout,updateProfile,checkAuth } from "../controllers/auth.controller.js";
// const router = express.Router();

// router.post("/signup",signup);
// router.post("/login",login);
// router.post("/logout",logout);

// router.put("/update-profile", protectRoute, updateProfile);

// router.get("/check", protectRoute, checkAuth);

// export default router;
import express from "express";

import { signup, login, logout, updateProfile, checkAuth } 
from "../controllers/auth.controller.js";

import { protectRoute } from "../middlewares/auth.middleware.js"; // ✅ ADD THIS

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

export default router;
