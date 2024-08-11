import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { Page } from "@/models/model";

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { session, user } = await validateRequest();
    if (!session) {
      return NextResponse.json("Not Authorized", { status: 401 });
    }
    if (!params?.id) {
      return NextResponse.json("Params missing", { status: 400 });
    }

    const page = await Page.findById(params.id);
    if (!page) {
      return NextResponse.json("Page not found", { status: 404 });
    }

    if (page.user_id !== user.id) {
      return NextResponse.json("Not Authorized", { status: 401 });
    }
    page.is_favorite = !page.is_favorite;
    await page.save();

    return NextResponse.json({ 
      success: true,
      message: `Page has been ${
        page.is_favorite ? "marked as favorite" : "unmarked as favorite"
      }.`,
      data: page,
    });
  } catch (error) {
    console.error("Error toggling favorite status:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while toggling the favorite status.",
      },
      {
        status: 500,
      }
    );
  }
}
