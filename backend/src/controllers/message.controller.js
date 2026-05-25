import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../config/cloudinary.js";
// Meeting app mein messages in-room socket se hote hain
// ye REST endpoints optional hain (future use)

export const getUsersForSidebar = async (req, res) => {
  try {
    const filteredUsers = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: req.params.id },
        { senderId: req.params.id, receiverId: req.user._id },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploaded = await cloudinary.uploader.upload(image);
      imageUrl = uploaded.secure_url;
    }

    const newMessage = await new Message({ senderId, receiverId, text, image: imageUrl }).save();
    res.status(201).json(newMessage.toObject());
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
