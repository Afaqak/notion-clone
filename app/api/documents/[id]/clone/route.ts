import { validateRequest } from "@/lib/auth";
import { Page } from "@/models/model";
import { PageDocument } from "@/types/type";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

interface Params {
  params: {
    id: string;
  };
}

interface Body {
  with_content: boolean;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!params?.id) {
    return NextResponse.json({ message: "Params missing" }, { status: 400 });
  }

  try {
    const { with_content }: Partial<Body> = await req.json();
    const { session, user } = await validateRequest();

    if (!session) {
      return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const pageToClone = await Page.findById(params.id);

    if (!pageToClone) {
      return NextResponse.json({ message: "Page not found" }, { status: 404 });
    }

    if (pageToClone.type === "parent") {
      return NextResponse.json(
        { message: "Cannot clone a parent document" },
        { status: 400 }
      );
    }

    const newPageData: Partial<PageDocument> = {
      icon: pageToClone?.icon,
      title: pageToClone.title,
      ...(with_content && { content: pageToClone.content }),
      parent_id: pageToClone?.parent_id,
      user_id: user?.id,
    };

    const newPage = await Page.create(newPageData);

    return NextResponse.json(
      { data: newPage, status: "success" },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
