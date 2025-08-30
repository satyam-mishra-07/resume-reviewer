import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import mongoose from "mongoose";
import Review from "../models/review-modal.js";
import User from "../models/user-modal.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const reviewController = {
  analyzeResume: async (req, res, next) => {
    try {
      const userId = req.userID || null;
      console.log("🔍 Auth middleware set userId:", userId, typeof userId);

      let jd, resumeData, isPDF;

      if (req.file) {
        jd = req.body.jd;
        resumeData = req.file.buffer;
        isPDF = true;
        console.log("PDF received:", req.file.originalname);
      } else {
        jd = req.body.jd;
        resumeData = req.body.resume;
        isPDF = false;
        console.log("Text resume received");
      }

      if (!jd || !resumeData) {
        return res.status(400).json({
          success: false,
          message: "Job description and resume are required",
        });
      }

      console.log("Calling HF API...");
      let hfResponse;

      const formData = new FormData();
      formData.append("jd", jd.trim());

      if (isPDF) {
        formData.append("resume_pdf", resumeData, {
          filename: req.file.originalname,
          contentType: "application/pdf",
        });
      } else {
        formData.append("resume_text", resumeData.trim());
      }

      hfResponse = await axios.post(
        "https://howler3212-resume-reviewer.hf.space/review",
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 30000,
        }
      );

      const analysisResult = hfResponse.data;

      let userObjectId = userId;
      console.log("💾 Saving with userObjectId:", userObjectId);

      const reviewData = {
        userId: userObjectId,
        atsScore: analysisResult.ats_score,
        matchedKeywords: analysisResult.matched_keywords || [],
        missingKeywords: analysisResult.missing_keywords || [],
        keywordSuggestions: analysisResult.keyword_suggestions || [],
        improvedBullets: analysisResult.improved_bullets || [],
        resumeExcerpt:
          analysisResult.resume_excerpt ||
          (isPDF ? "PDF uploaded" : resumeData.substring(0, 500)),
      };

      const savedReview = await Review(reviewData).save();
      console.log("✅ Review saved with userId:", savedReview.userId);

      if (userObjectId) {
        await User.findByIdAndUpdate(userObjectId, {
          $inc: { resumeReviewsCount: 1 },
        });
      }

      console.log("Review saved to database:", savedReview._id);

      res.status(200).json({
        success: true,
        message: "Resume analyzed successfully",
        analysis: {
          id: savedReview._id,
          atsScore: analysisResult.ats_score,
          matchedKeywords: analysisResult.matched_keywords,
          missingKeywords: analysisResult.missing_keywords,
          keywordSuggestions: analysisResult.keyword_suggestions,
          improvedBullets: analysisResult.improved_bullets,
          resumeExcerpt: analysisResult.resume_excerpt,
        },
      });
    } catch (error) {
      console.error("Resume analysis error:", error);
      next(error);
    }
  },

  getUserReviews: async (req, res, next) => {
    try {
      const userId = req.userID;
      console.log("🔍 Looking for reviews with userId:", userId, typeof userId);

      const userObjectId = userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const totalReviewsInDB = await Review.countDocuments({});
      console.log("📊 Total reviews in database:", totalReviewsInDB);

      const sampleReviews = await Review.find({}).limit(3).select("userId");
      console.log("🔬 Sample userIds in database:", sampleReviews);

      const reviews = await Review.find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "atsScore matchedKeywords missingKeywords createdAt resumeExcerpt"
        )
        .lean();

      console.log("📋 Found reviews for user:", reviews.length);

      const mappedReviews = reviews.map((review) => ({
        ...review,
        id: review._id.toString(),
      }));

      const totalReviews = await Review.countDocuments({
        userId: userObjectId,
      });

      res.status(200).json({
        success: true,
        reviews: mappedReviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page < Math.ceil(totalReviews / limit),
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get user reviews error:", error);
      next(error);
    }
  },

  getUserStats: async (req, res, next) => {
    try {
      const userId = req.userID;
      const userObjectId = userId;

      const totalReviews = await Review.countDocuments({
        userId: userObjectId,
      });

      if (totalReviews === 0) {
        return res.status(200).json({
          success: true,
          stats: {
            reviewsCount: 0,
            averageScore: 0,
            daysSinceLastReview: null,
          },
        });
      }

      const avgResult = await Review.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, avgScore: { $avg: "$atsScore" } } },
      ]);

      const lastReview = await Review.findOne({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .select("createdAt");

      const daysSinceLastReview = lastReview
        ? Math.floor(
            (Date.now() - lastReview.createdAt) / (1000 * 60 * 60 * 24)
          )
        : null;

      res.status(200).json({
        success: true,
        stats: {
          reviewsCount: totalReviews,
          averageScore: Math.round(avgResult[0]?.avgScore || 0),
          daysSinceLastReview,
        },
      });
    } catch (error) {
      console.error("Get user stats error:", error);
      next(error);
    }
  },

  getReviewById: async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const userId = req.userID;

      const review = await Review.findOne({
        _id: reviewId,
        userId: userId,
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      res.status(200).json({
        success: true,
        review,
      });
    } catch (error) {
      console.error("Get review by ID error:", error);
      next(error);
    }
  },

  deleteReview: async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const userId = req.userID;

      const deletedReview = await Review.findOneAndDelete({
        _id: reviewId,
        userId: userId,
      });

      if (!deletedReview) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      await User.findByIdAndUpdate(userId, {
        $inc: { resumeReviewsCount: -1 },
      });

      res.status(200).json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error) {
      console.error("Delete review error:", error);
      next(error);
    }
  },
};

export default reviewController;
