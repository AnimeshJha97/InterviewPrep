import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const QuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    type: { type: String, enum: ["common", "tricky"], default: "common" },
    tags: [{ type: String }],
    estimatedMinutes: { type: Number, default: 0 },
    whyAsked: { type: String, default: "" },
    idealAnswer: { type: String, default: "" },
    beginnerAnswer: { type: String, default: "" },
    seniorAnswer: { type: String, default: "" },
    followUpQuestions: [{ type: String }],
    resumeConnection: { type: String, default: "" },
    commonMistakes: [{ type: String }],
    isCompleted: { type: Boolean, default: false },
    userNotes: { type: String, default: "" },
  },
  { _id: false },
);

const SectionSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    icon: { type: String, default: "" },
    color: { type: String, default: "" },
    textColor: { type: String, default: "" },
    description: { type: String, default: "" },
    estimatedHours: { type: Number, default: 0 },
    priorityScore: { type: Number, default: 0 },
    questions: [QuestionSchema],
  },
  { _id: false },
);

const PrepKitSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "analyzing_resume", "generating_sections", "generating_questions", "completed", "failed"],
      default: "pending",
    },
    resumeFileName: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    resumeText: { type: String, default: "" },
    onboarding: { type: Schema.Types.Mixed, default: {} },
    candidateProfile: { type: Schema.Types.Mixed, default: {} },
    sections: [SectionSchema],
    generationMeta: { type: Schema.Types.Mixed, default: {} },
    errorMessage: { type: String, default: "" },
  },
  { timestamps: true },
);

export type PrepKitDocument = InferSchemaType<typeof PrepKitSchema>;

export const PrepKitModel =
  (models.PrepKit as Model<PrepKitDocument>) || model<PrepKitDocument>("PrepKit", PrepKitSchema);
