import { validateRequest } from "@/lib/auth";
import { Page } from "@/models/model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { session, user } = await validateRequest();
  
  const requestBody = await req.json();

  const { doc_id } = requestBody || { doc_id: null };

  if (!session) {
    return NextResponse.json("Not Authorized", { status: 401 });
  }

  try {
    let documents;
    if (doc_id) {
  
      documents = await Page.create({
        user_id: user?.id,
        title: "untitled",
        parent_id: doc_id,
      });
    } else {
      documents = await Page.create({
        user_id: user?.id,
        title: "untitled",
      });
    }

    console.log(documents)

    return NextResponse.json(
      { data: documents, status: "success" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating page:", err);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
