import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { extractResumeText } from "@/lib/resume-parser";
import { PrepKitModel } from "@/models/PrepKit";
import { UserModel } from "@/models/User";

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const maxFileSizeInBytes = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const resume = formData.get("resume");

  if (!(resume instanceof File)) {
    return NextResponse.json({ error: "Resume file is required." }, { status: 400 });
  }

  if (!allowedMimeTypes.includes(resume.type)) {
    return NextResponse.json({ error: "Only PDF and DOCX resumes are supported right now." }, { status: 400 });
  }

  if (resume.size > maxFileSizeInBytes) {
    return NextResponse.json({ error: "Resume exceeds the 5MB file limit." }, { status: 400 });
  }

  const arrayBuffer = await resume.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  let resumeText = "";

  try {
    resumeText = await extractResumeText(fileBuffer, resume.name, resume.type);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to parse resume.",
      },
      { status: 400 },
    );
  }

  if (!resumeText) {
    return NextResponse.json({ error: "Could not extract text from the uploaded resume." }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "resumes");
  await mkdir(uploadsDir, { recursive: true });

  const safeBaseName = resume.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const storedFileName = `${Date.now()}-${safeBaseName}`;
  const storedFilePath = path.join(uploadsDir, storedFileName);
  await writeFile(storedFilePath, fileBuffer);

  await connectToDatabase();

  const user = await UserModel.findById(session.user.id).select("onboarding plan").lean();

  if (user?.plan === "free") {
    const existingKitCount = await PrepKitModel.countDocuments({
      userId: session.user.id,
    });

    if (existingKitCount >= 1) {
      return NextResponse.json(
        {
          error: "Free plan currently allows one generated prep kit. Upgrade will unlock multiple personalized kits.",
        },
        { status: 403 },
      );
    }
  }

  const prepKit = await PrepKitModel.create({
    userId: session.user.id,
    status: "pending",
    resumeFileName: resume.name,
    resumeUrl: `/uploads/resumes/${storedFileName}`,
    resumeText,
    onboarding: user?.onboarding ?? {},
    candidateProfile: {},
    sections: [],
  });

  await UserModel.findByIdAndUpdate(session.user.id, {
    $set: {
      latestPrepKitId: prepKit._id,
    },
  });

  return NextResponse.json({
    success: true,
    prepKitId: String(prepKit._id),
    extractedCharacters: resumeText.length,
  });
}
