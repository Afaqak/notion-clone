import { validateRequest } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";
import { Media } from "@/models/model";

interface Params {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: Params) {
  if (!params?.id) {
    return NextResponse.json(
      { code: 0, message: "Params missing" },
      { status: 400 }
    );
  }

  const { session, user } = await validateRequest();

  if (!session) {
    return NextResponse.json(
      { code: 0, message: "Not Authorized" },
      { status: 401 }
    );
  }

  const { objectUrl, type, name, pageId } = await request.json();

  if (!objectUrl || !type || !name || !pageId) {
    return NextResponse.json(
      { code: 0, message: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { code: 0, message: "Database URL not configured" },
      { status: 500 }
    );
  }

  try {
    const newMedia = new Media({
      type,
      url: objectUrl,
      pageId,
      name,
    });

    await newMedia.save();

    return NextResponse.json(
      { code: 1, status: "Success", data: newMedia },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      {
        code: 0,
        message: e instanceof Error ? e.message : e?.toString(),
      },
      { status: 500 }
    );
  }
}
