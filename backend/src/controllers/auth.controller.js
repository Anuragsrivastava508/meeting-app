import  {generateToken} from "../utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// export const signup = async (req,res )=>{
//     const {fullName ,email,password } = req.body;
//     try {
//         if (!fullName || !email || !password) {
//             return res.status(400).json({message : "All feild are required" })
//         }
//         if (password.length < 8) {
//             return res.status(400).json({message:"password must be at least 8 characters "})
//         }
//         const user = await User.findOne({ email });

//         if (user) {return res.status(400).json({ message:"email already exixts"})    
//         }
//      const salt = await bcrypt.genSalt(10);
//      const hashedPassword = await bcrypt.hash(password,salt);

//      const newUser = new User({
//         fullName,
//         email,
//         password:hashedPassword,
//      });

//  if (newUser) {
//     generateToken(newUser._id ,res );
//     await newUser.save();

//     res.status(201).json({
//         _id : newUser._id,
//         fullName:newUser.fullName,
//         email:newUser.email,
//         profilepic:newUser.profilepic,
 
//     });
// } 
// else{
//     res.status(400).json({
//         message:"Invalid user data "
//     });

// }
        
//     } catch (error) {
//  console.log("Error in signup controller", error.message);    
//  res.status(500).json({ message: "Internal Server Error" });
//     }
// };

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // 1️⃣ Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // 2️⃣ Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 3️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4️⃣ Create user
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // 5️⃣ Generate JWT
    generateToken(newUser._id, res);

    // 6️⃣ Response
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email, 
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


