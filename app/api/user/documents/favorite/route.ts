import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { Favorite, Page } from "@/models/model";
import mongoose from "mongoose";

export async function GET() {
  try {
    const { session, user } = await validateRequest();

    if (!session) {
      return NextResponse.json("Not Authorized", { status: 401 });
    }

    const favoritePages = await Favorite.aggregate([
      { $match: { user_id: user.id } },
      {
        $lookup: {
          from: "pages",
          localField: "page_id",
          foreignField: "_id",
          as: "page"
        }
      },
      { $unwind: "$page" },
      {
        $graphLookup: {
          from: "pages",
          startWith: "$page._id",
          connectFromField: "_id",
          connectToField: "parent_id",
          as: "page.children"
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              { isFavorite: true },
              "$page"
            ]
          }
        }
      }
    ]);

    return NextResponse.json({
      status: "success",
      data: favoritePages
    });
  } catch (error) {
    console.error("Error fetching favorite documents:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching favorite documents."
      },
      {
        status: 500
      }
    );
  }
}
