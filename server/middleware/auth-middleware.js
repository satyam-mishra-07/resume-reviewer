import jwt from "jsonwebtoken";
import User from "../models/user-modal.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token not provided" });
    }

    const jwtToken = token.replace("Bearer", "").trim();
    const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET);

    const userData = await User.findOne({ email: isVerified.email }).select("-password");

    if (!userData) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not found" });
    }

    req.user = userData;
    req.isAdmin = userData.isAdmin;
    req.token = jwtToken;
    req.userID = userData._id;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};

export default authMiddleware;