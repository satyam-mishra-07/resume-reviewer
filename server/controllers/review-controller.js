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

const uploadFields = upload.fields([
  { name: 'resume_pdf', maxCount: 1 },
  { name: 'resume_text', maxCount: 1 }
]);


const reviewController = {
  analyzeResume: async (req, res, next) => {
    try {
      const userId = req.userID || null;
      console.log("🔍 Auth middleware set userId:", userId, typeof userId);

      let jd, resumeData, isPDF;

      // ✅ Fixed: Check req.files instead of req.file
      const pdfFile = req.files && req.files['resume_pdf'] ? req.files['resume_pdf'][0] : null;
      
      if (pdfFile) {
        jd = req.body.jd;
        resumeData = pdfFile.buffer;  // ✅ Use pdfFile instead of req.file
        isPDF = true;
        console.log("PDF received:", pdfFile.originalname);
      } else if (req.body.resume_text) {  // ✅ Check for resume_text field
        jd = req.body.jd;
        resumeData = req.body.resume_text;
        isPDF = false;
        console.log("Text resume received");
      } else {
        console.log("❌ No resume data received");
        return res.status(400).json({
          success: false,
          message: "Job description and resume are required",
        });
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
          filename: pdfFile.originalname,  // ✅ Use pdfFile instead of req.file
          contentType: "application/pdf",
        });
      } else {
        formData.append("resume_text", resumeData.trim());
      }

      try {
        hfResponse = await axios.post(
          "https://howler3212-resume-reviewer.hf.space/review",
          formData,
          {
            headers: formData.getHeaders(),
            timeout: 60000,
          }
        );
        
        console.log("✅ HF API responded successfully");
        
      } catch (hfError) {
        console.error("❌ HF API Error:", {
          status: hfError.response?.status,
          statusText: hfError.response?.statusText,
          data: hfError.response?.data,
          message: hfError.message
        });

        return res.status(500).json({
          success: false,
          message: "AI analysis service temporarily unavailable",
          error: hfError.response?.data?.error || hfError.message,
          details: hfError.response?.data?.details || "Please try again later"
        });
      }

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
      
      // ✅ Better error handling
      return res.status(500).json({
        success: false,
        message: "Analysis failed",
        error: error.message,
        details: "Please try again or contact support"
      });
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
};

export { uploadFields, reviewController };
export default reviewController;
