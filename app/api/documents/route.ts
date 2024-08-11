import { validateRequest } from "@/lib/auth";
import { Page } from "@/models/model";
import { NextResponse } from "next/server";

async function getAllDocumentsAndChildrens(parentId?: any, user_id?: string) {
  const children = await Page.find({
    parent_id: parentId,
    user_id,
    is_deleted: false,
  })
    .select("title _id isOpen depth type icon parent_id is_favorite is_deleted")
    .lean();

  for (const child of children) {
    child.children = await getAllDocumentsAndChildrens(child._id, user_id);
  }

  return children;
}

export async function GET() {
  const { session, user } = await validateRequest();
  console.log(user);
  if (!session) {
    return NextResponse.json("Not Authorized", { status: 401 });
  }

  let documents = await getAllDocumentsAndChildrens(null, user?.id);

  return NextResponse.json(
    { data: documents, status: "success" },
    { status: 200 }
  );
}
