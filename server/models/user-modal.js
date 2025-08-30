import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true, // Creates a unique index automatically
    lowercase: true,
    trim: true,
    maxlength: 255
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  profilePicture: {
    type: String,
    default: null
  },
  resumeReviewsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const saltRounds = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate JWT token
userSchema.methods.generateToken = async function () {
  try {
    return jwt.sign(
      {
        userId: this._id.toString(),
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        isAdmin: this.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
  } catch (error) {
    console.error("Token generation error:", error);
    throw error;
  }
};

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("Password comparison error:", error);
    throw error;
  }
};

// Get user's full name
userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

// Update last login timestamp
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  return await this.save({ validateBeforeSave: false });
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Create indexes for better query performance
userSchema.index({ createdAt: -1 });

const User = mongoose.model("User", userSchema);

export default User;
