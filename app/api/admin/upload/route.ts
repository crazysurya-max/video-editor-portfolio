import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdmin } from "@/lib/db";
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;
  try {
    return NextResponse.json(await handleUpload({ body, request: req,
      onBeforeGenerateToken: async () => {
        if (!isAdmin(req)) throw new Error("Unauthorized");
        return { allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "video/quicktime"], maximumSizeInBytes: 500 * 1024 * 1024, addRandomSuffix: true };
      },
      onUploadCompleted: async () => {} }));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
