import { validateRequest } from "@/lib/auth";
import { Page } from "@/models/model";
import { PageDocument } from "@/types/type";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: {
    id: string;
  };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!params?.id) {
    return NextResponse.json("Params missing", { status: 400 });
  }

  try {
    const requestBody: Partial<PageDocument> = await req.json();
    console.log(requestBody,'[body]')
    const { session, user } = await validateRequest();

    if (!session) {
      return NextResponse.json("Not Authorized", { status: 401 });
    }

    const dataToUpdate: Partial<PageDocument> = {};

    if (typeof requestBody.isOpen === "boolean") {
      dataToUpdate.isOpen = requestBody.isOpen;

    }
    if (requestBody.icon !== undefined) {
      dataToUpdate.icon = requestBody.icon;
    }
    if (requestBody.title !== undefined) {
      dataToUpdate.title = requestBody.title;
    }
    if (requestBody.content !== undefined) {
      dataToUpdate.content = requestBody.content;
    }

    if (requestBody.bg_image !== undefined) {
      dataToUpdate.bg_image = requestBody.bg_image;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { message: "Nothing to update", status: "success" },
        { status: 200 }
      );
    }

    console.log(Object.keys(dataToUpdate).join(" "));

    const data = await Page.findByIdAndUpdate(params.id, dataToUpdate, {
      new: true,
    })
    return NextResponse.json({ data, status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
