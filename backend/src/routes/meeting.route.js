import express from "express";
import {
  createMeeting,
  joinMeeting,
  endMeeting,
} from "../controllers/meeting.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";





const router = express.Router();

router.post("/create", protectRoute, createMeeting);
router.post("/join/:meetingCode", protectRoute, joinMeeting);
router.put("/end/:id", protectRoute, endMeeting);

export default router;
