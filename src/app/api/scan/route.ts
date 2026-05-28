// POST /api/scan
//
// Fatia 1 STUB. Accepts { eventCode, selfie (data URL or base64) } and returns
// the curated mock photo list, simulating Rekognition's SearchFacesByImage
// response. Fatia 3 swaps the body of this handler to:
//   1. Decode + validate the image
//   2. Call Rekognition SearchFacesByImage against the event's FaceCollection
//      (or InsightFace at stadium scale per FanSnap brief §6)
//   3. Return matched photo IDs + similarity scores from D1
//
// IMPORTANT: this is the only public-facing endpoint that touches biometric data.
// LFPDPPP/GDPR consent must already be recorded server-side before this is
// called in production (Fatia 2).

import { NextResponse } from "next/server";
import { MOCK_PHOTOS } from "@/lib/mock";

export const runtime = "nodejs"; // OpenNext on Workers; nodejs_compat enabled in wrangler.jsonc

interface ScanRequest {
  eventCode?: string;
  selfie?: string;
}

interface ScanResponse {
  eventCode: string;
  matches: Array<{
    photoId: number;
    similarity: number;
    timestamp: string;
    photographer: string;
  }>;
  processedAt: string;
  // Fatia 3+
  stub: true;
}

export async function POST(req: Request): Promise<Response> {
  let body: ScanRequest;
  try {
    body = (await req.json()) as ScanRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventCode = body.eventCode?.trim();
  if (!eventCode) {
    return NextResponse.json({ error: "eventCode is required" }, { status: 400 });
  }
  if (!body.selfie) {
    return NextResponse.json({ error: "selfie is required" }, { status: 400 });
  }

  // Stub: return mock photos with fake similarity scores, slowly trending down.
  const matches = MOCK_PHOTOS.map((p, i) => ({
    photoId: p.id,
    similarity: Math.max(0.72, 0.985 - i * 0.018),
    timestamp: p.timestamp,
    photographer: p.photographer,
  }));

  const res: ScanResponse = {
    eventCode,
    matches,
    processedAt: new Date().toISOString(),
    stub: true,
  };

  return NextResponse.json(res, { status: 200 });
}

export async function GET(): Promise<Response> {
  return NextResponse.json(
    {
      ok: true,
      service: "fansnap:scan",
      version: "0.1.0",
      note: "Fatia 1 stub. POST { eventCode, selfie } to receive matches.",
    },
    { status: 200 }
  );
}
