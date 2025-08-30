import User from "../models/user-modal.js";

const authController = {
  // Register new user
  register: async (req, res, next) => {
    try {
      const { firstName, lastName, email, password, confirmPassword } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Create new user (password will be hashed by the pre-save middleware)
      const user = new User({
        firstName,
        lastName,
        email,
        password,
      });

      const savedUser = await user.save();

      // Generate JWT token
      const token = await savedUser.generateToken();

      // Update last login
      await savedUser.updateLastLogin();

      // Send response (exclude password)
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: savedUser._id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          isAdmin: savedUser.isAdmin,
          createdAt: savedUser.createdAt,
        },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  },

  // Login existing user
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = await user.generateToken();

      // Update last login
      await user.updateLastLogin();

      // Send response (exclude password)
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isAdmin: user.isAdmin,
          lastLogin: user.lastLogin,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      next(error);
    }
  },

  // Logout (client-side token removal)
  logout: async (req, res, next) => {
    try {
      // In JWT, logout is handled client-side by removing the token
      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      console.error("Logout error:", error);
      next(error);
    }
  },
};

export default authController;