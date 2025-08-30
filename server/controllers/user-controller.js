import mongoose from "mongoose";
import User from "../models/user-modal.js";
import Review from "../models/review-modal.js";

const userController = {
  // Get user profile with stats for Profile Page
  getProfile: async (req, res, next) => {
    try {
      const userId = req.userID; // Set by authMiddleware

      // Get user details
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Get user's review statistics
      const totalReviews = await Review.countDocuments({ userId });

      let avgATSScore = 0;
      let daysSinceLastReview = null;

      if (totalReviews > 0) {
        // Calculate average ATS score and get last review date
        const statsResult = await Review.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(userId) } },
          {
            $group: {
              _id: null,
              avgScore: { $avg: "$atsScore" },
              lastReviewDate: { $max: "$createdAt" },
            },
          },
        ]);

        if (statsResult.length > 0) {
          avgATSScore = Math.round(statsResult[0].avgScore);

          // Calculate days since last review
          const lastReviewDate = statsResult[0].lastReviewDate;
          daysSinceLastReview = Math.floor(
            (Date.now() - new Date(lastReviewDate)) / (1000 * 60 * 60 * 24)
          );
        }
      }

      // Send response matching your Profile page needs
      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          fullName: user.getFullName(), // Using the method from User model
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
        stats: {
          reviewsCount: totalReviews, // "Reviews Done"
          avgATSScore: avgATSScore, // "Avg ATS Score"
          daysSinceLastReview: daysSinceLastReview || 0, // "Days Since Last Review"
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      next(error);
    }
  },

  // Update user profile
  updateProfile: async (req, res, next) => {
    try {
      const userId = req.userID;
      const { firstName, lastName } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          fullName: updatedUser.getFullName(),
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      next(error);
    }
  },

  // Delete user account
  deleteAccount: async (req, res, next) => {
    try {
      const userId = req.userID;

      // Delete all user's reviews first
      await Review.deleteMany({ userId });

      // Delete user account
      await User.findByIdAndDelete(userId);

      res.status(200).json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      console.error("Delete account error:", error);
      next(error);
    }
  },
};

// Helper functions (if needed elsewhere, we can export separately later)
function extractJobTitle(resumeExcerpt) {
  const commonTitles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "React Developer",
    "Node.js Developer",
    "Software Engineer",
    "Web Developer",
    "UI/UX Designer",
    "DevOps Engineer",
  ];

  for (let title of commonTitles) {
    if (resumeExcerpt.toLowerCase().includes(title.toLowerCase())) {
      return title;
    }
  }
  return "Software Developer"; // Default
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getScoreCategory(score) {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  return "needs-work";
}

export default userController;
