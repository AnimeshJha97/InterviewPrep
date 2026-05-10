import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const RateLimitSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    count: { type: Number, default: 0 },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

export type RateLimitDocument = InferSchemaType<typeof RateLimitSchema>;

export const RateLimitModel =
  (models.RateLimit as Model<RateLimitDocument>) ||
  model<RateLimitDocument>("RateLimit", RateLimitSchema);
