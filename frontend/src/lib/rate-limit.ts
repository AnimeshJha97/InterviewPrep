import { RateLimitModel } from "@/models/RateLimit";

function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function assertRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);

  const record = await RateLimitModel.findOneAndUpdate(
    {
      key,
      $or: [{ expiresAt: { $lte: now } }, { expiresAt: { $gt: now } }],
    },
    [
      {
        $set: {
          key,
          count: {
            $cond: [{ $lte: ["$expiresAt", now] }, 1, { $add: [{ $ifNull: ["$count", 0] }, 1] }],
          },
          expiresAt: {
            $cond: [{ $lte: ["$expiresAt", now] }, expiresAt, "$expiresAt"],
          },
        },
      },
    ],
    {
      upsert: true,
      returnDocument: "after",
    },
  ).lean();

  const count = record?.count ?? 1;
  const retryAfterSeconds = Math.max(1, Math.ceil(((record?.expiresAt ?? expiresAt).getTime() - now.getTime()) / 1000));

  return {
    allowed: count <= limit,
    count,
    limit,
    retryAfterSeconds,
  };
}

export const rateLimitConfig = {
  resumeUploadLimit: readNumber(process.env.PREPWISE_RATE_LIMIT_RESUME_UPLOADS_PER_HOUR, 6),
  kitGenerateLimit: readNumber(process.env.PREPWISE_RATE_LIMIT_KIT_GENERATIONS_PER_HOUR, 4),
  onboardingLimit: readNumber(process.env.PREPWISE_RATE_LIMIT_ONBOARDING_PER_HOUR, 12),
  windowMs: 60 * 60 * 1000,
};
