import { validateRequest } from "@/lib/auth";
import { Page } from "@/models/model";
import { PageDocument } from "@/types/type";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

let deleteChildrens = async (document: PageDocument) => {
  if (!document) return;

  const childDocuments = await Page.find({ parent_id: document._id });

  for (const child of childDocuments) {
    await deleteChildrens(child);
  }

  await Page.deleteMany({ parent_id: document._id });
};

export async function DELETE(req: NextRequest, { params }: Params) {
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

    let deletedDocument;

    if (document.type === "parent") {
      await deleteChildrens(document);
      deletedDocument = await Page.deleteOne(document._id);
    } else {
      if (document.is_deleted) {
        await deleteChildrens(document);
        deletedDocument = await Page.deleteOne(document._id);
      } else {
        deletedDocument = await Page.findByIdAndUpdate(document._id, {
          is_deleted: true,
        });
      }
    }

    console.log(deletedDocument, "DOC");
    return NextResponse.json(
      { data: document, status: "success" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
