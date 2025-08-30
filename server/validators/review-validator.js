import { z } from "zod";

// Resume Analysis Request Schema
const resumeAnalysisSchema = z.object({
  jd: z
    .string({ required_error: "Job description is required" })
    .trim()
    .min(10, { message: "Job description must be at least 10 characters" })
    .max(5000, { message: "Job description is too long" }),
  
  resume: z
    .string()
    .optional(), // Either text content or handled as file upload
  
  targetRole: z
    .string()
    .trim()
    .max(100, { message: "Target role must be less than 100 characters" })
    .optional(),
  
  experienceLevel: z
    .enum(["Fresher", "0-1 years", "1-2 years", "2-5 years", "5+ years"])
    .optional()
});

// Resume Analysis Result Schema (for storing in database)
const resumeResultSchema = z.object({
  userId: z
    .string()
    .optional(), // For authenticated users
  
  jobTitle: z
    .string({ required_error: "Job title is required" })
    .trim()
    .max(200, { message: "Job title is too long" }),
  
  company: z
    .string()
    .trim()
    .max(100, { message: "Company name is too long" })
    .optional(),
  
  atsScore: z
    .number({ required_error: "ATS score is required" })
    .min(0)
    .max(100),
  
  matchedKeywords: z
    .array(z.string())
    .default([]),
  
  missingKeywords: z
    .array(z.string())
    .default([]),
  
  suggestions: z
    .array(z.string())
    .default([]),
  
  bulletImprovements: z
    .array(
      z.object({
        original: z.string(),
        improved: z.string()
      })
    )
    .default([]),
  
  resumeText: z
    .string()
    .optional(), // Store resume content for reference
  
  jobDescription: z
    .string()
    .optional(), // Store JD for reference
  
  analysisDate: z
    .date()
    .default(() => new Date()),
  
  targetRole: z
    .string()
    .optional(),
  
  experienceLevel: z
    .string()
    .optional()
});

// ✅ Proper ESM export
export { resumeAnalysisSchema, resumeResultSchema };