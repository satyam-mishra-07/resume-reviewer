import z from 'zod';

// Registration Schema (based on your Register component)
const signupSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .trim()
    .min(2, { message: "First name must be at least 2 characters" })
    .max(50, { message: "First name must not be more than 50 characters" }),
  
  lastName: z
    .string({ required_error: "Last name is required" })
    .trim()
    .min(2, { message: "Last name must be at least 2 characters" })
    .max(50, { message: "Last name must not be more than 50 characters" }),
  
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must not be more than 255 characters" }),
  
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must not be more than 128 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" 
    }),
  
  confirmPassword: z
    .string({ required_error: "Please confirm your password" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Login Schema (based on your Login component)
const signinSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" }),
  
  password: z
    .string({ required_error: "Password is required" })
    .min(1, { message: "Password is required" })
});

// Password Reset Request Schema
const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" })
});

// Password Reset Schema
const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: "Reset token is required" }),
  
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must not be more than 128 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" 
    }),
  
  confirmPassword: z
    .string({ required_error: "Please confirm your password" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// ✅ Correct ESM export
export { 
  signupSchema, 
  signinSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
};