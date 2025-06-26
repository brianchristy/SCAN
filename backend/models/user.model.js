import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    contactno: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    skills: {
      type: [String], // Array of strings to store multiple skills
      default: [],
    },
    location: {
      type: String, // Location field for volunteers
      default: null,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    sessionToken: {
      type: String,
      default: null,
    },
    sessionExpiresAt: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Indicates if a volunteer has been approved by admin
    isApproved: {
      type: Boolean,
      default: false,
    },
    helptitle: {
      type: String,
      default: null,
    },
    helpdescription: {
      type: String,
      default: null,
    },
    additional: {
      type: String,
      default: null,
    },
    helpstatus: {
      type: Boolean,
      default: true,
    },
    acceptedBy: {
      volunteerName: { type: String, default: null },
      volunteerContact: { type: String, default: null },
    },
    volunteerDetails: {
      name: { type: String, default: null },
      contactno: { type: String, default: null },
      isAccepted: { type: Boolean, default: false },
      volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
