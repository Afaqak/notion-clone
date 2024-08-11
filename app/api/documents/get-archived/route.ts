import { validateRequest } from "@/lib/auth";
import { Page } from "@/models/model";
import { NextResponse } from "next/server";

export async function GET() {
  const { session, user } = await validateRequest();
  console.log(user);
  if (!session) {
    return NextResponse.json("Not Authorized", { status: 401 });
  }

  const archived = await Page.find({
    user_id: user.id,
    is_deleted: true,
  })
    .select("title _id isOpen depth type icon parent_id is_favorite is_deleted")
    .lean();

  return NextResponse.json(
    { data: archived, status: "success" },
    { status: 200 }
  );
}
