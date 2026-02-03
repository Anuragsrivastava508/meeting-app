import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    meetingCode: {
      type: String,
      required: true,
      unique: true,
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["scheduled", "ongoing", "ended"],
      default: "scheduled",
    },

    isRecordingEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Meeting", meetingSchema);
