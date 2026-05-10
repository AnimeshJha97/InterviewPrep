import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    kind: { type: String, enum: ["required", "temporary"], required: true, index: true },
    level: { type: String, enum: ["info", "warn", "error"], required: true, index: true },
    event: { type: String, required: true, index: true },
    requestId: { type: String, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    kitId: { type: Schema.Types.ObjectId, ref: "PrepKit", index: true },
    route: { type: String, index: true },
    meta: { type: Schema.Types.Mixed, default: {} },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

export type ActivityLogDocument = InferSchemaType<typeof ActivityLogSchema>;

export const ActivityLogModel =
  (models.ActivityLog as Model<ActivityLogDocument>) ||
  model<ActivityLogDocument>("ActivityLog", ActivityLogSchema);
