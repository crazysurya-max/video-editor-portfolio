import { NextResponse } from "next/server";
import { issueSignedToken } from "@vercel/blob";
import {
  type HandleUploadPresignedBody,
  handleUploadPresigned,
} from "@vercel/blob/client";
import { isAdmin } from "@/lib/db";

const TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
const MAX = 500 * 1024 * 1024;

export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadPresignedBody;
  try {
    const json = await handleUploadPresigned({
      body,
      request: req,
      getSignedToken: async (pathname) => {
        if (!isAdmin(req)) throw new Error("Not authorized");
        const validUntil = Date.now() + 60 * 60 * 1000;
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes: TYPES,
          maximumSizeInBytes: MAX,
          validUntil,
        });
        return {
          token,
          urlOptions: {
            allowedContentTypes: TYPES,
            maximumSizeInBytes: MAX,
            validUntil,
            addRandomSuffix: true,
            allowOverwrite: false,
          },
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: msg },
      { status: msg === "Not authorized" ? 401 : 400 }
    );
  }
}