import { validateRequest } from "@/lib/auth";
import { Page } from "@/models/model";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

interface DocumentType {
  title: string;
  _id: any;
  isOpen: boolean;
  depth: number;
  type: string;
  icon: string;
  parent_id: any;
  is_favorite: boolean;
  parent_title?: string | null;
}

export async function GET(req: NextRequest, { params }: Params) {
  if (!params?.id) {
    return NextResponse.json("Params missing", { status: 400 });
  }

  const { session, user } = await validateRequest();
  if (!session) {
    return NextResponse.json("Not Authorized", { status: 401 });
  }

  const document: DocumentType | null = await Page.findById(params.id)
    .populate("parent_id", "title")
    .lean();

  if (document) {
    document.parent_title = document.parent_id
      ? document.parent_id.title
      : null;
    document.parent_id = document.parent_id ? document.parent_id._id : null;
  }

  return NextResponse.json(
    { data: document, status: "success" },
    { status: 200 }
  );
}
