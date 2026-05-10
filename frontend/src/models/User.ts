import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const OnboardingProfileSchema = new Schema(
  {
    fullName: { type: String, trim: true },
    currentRole: { type: String, trim: true },
    targetRole: { type: String, trim: true },
    yearsOfExperience: { type: Number, min: 0, max: 40 },
    interviewType: {
      type: String,
      enum: [
        "role-specific",
        "frontend",
        "backend",
        "full-stack",
        "system-design",
        "product-company",
        "startup",
        "design",
        "data-analytics",
        "product-management",
        "sales-marketing",
        "finance-accounting",
        "operations",
        "hr-recruiting",
        "leadership-management",
        "behavioral",
      ],
    },
    targetCompany: { type: String, trim: true },
    jobDescription: { type: String, trim: true },
    confidenceLevel: { type: String, enum: ["beginner", "intermediate", "advanced"] },
    timelineDays: { type: Number, enum: [7, 14, 30] },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String },
    googleId: { type: String, index: true, sparse: true },
    plan: { type: String, enum: ["free", "paid"], default: "free" },
    onboardingCompleted: { type: Boolean, default: false },
    onboarding: { type: OnboardingProfileSchema, default: null },
    profileRetargetCount: { type: Number, default: 0, min: 0 },
    latestPrepKitId: { type: Schema.Types.ObjectId, ref: "PrepKit", default: null },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof UserSchema>;

export const UserModel = (models.User as Model<UserDocument>) || model<UserDocument>("User", UserSchema);
