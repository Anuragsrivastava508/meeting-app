import Meeting from "../models/meeting.model.js";
import { v4 as uuidv4 } from "uuid";

// 🔹 Create Meeting
export const createMeeting = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const meeting = await Meeting.create({
      title,
      meetingCode: uuidv4(),
      host: req.user._id,
      participants: [req.user._id],
      status: "scheduled",
    });

    res.status(201).json(meeting);
  } catch (error) {
    console.error("Error creating meeting:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🔹 Join Meeting
export const joinMeeting = async (req, res) => {
  try {
    const { meetingCode } = req.params;

    const meeting = await Meeting.findOne({ meetingCode });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (!meeting.participants.includes(req.user._id)) {
      meeting.participants.push(req.user._id);
      await meeting.save();
    }

    res.status(200).json(meeting);
  } catch (error) {
    console.error("Error joining meeting:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🔹 End Meeting (Only Host)
export const endMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only host can end meeting" });
    }

    meeting.status = "ended";
    await meeting.save();

    res.status(200).json({ message: "Meeting ended successfully" });
  } catch (error) {
    console.error("Error ending meeting:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
