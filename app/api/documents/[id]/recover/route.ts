import { validateRequest } from "@/lib/auth";
import { Page } from "@/models/model";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    if (!params?.id) {
      return NextResponse.json("Params missing", { status: 400 });
    }
    const { session, user } = await validateRequest();
    if (!session) {
      return NextResponse.json("Not Authorized", { status: 401 });
    }

    const document = await Page.findById(params?.id);

    if (!document) {
      return NextResponse.json("Not found", { status: 400 });
    }

    if (document?.user_id !== user?.id) {
      return NextResponse.json("unauthorized", { status: 401 });
    }

    const recoveredDocument = await Page.findByIdAndUpdate(
      document._id,
      {
        is_deleted: false,
      },
      { new: true }
    );

    return NextResponse.json(
      { data: recoveredDocument, status: "success" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error recovering page:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
