"use client";
import React from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useParams } from "next/navigation";
import { useDocumentQuery } from "@/features/documents/queries";
import Editor from "@/components/editor";
import Link from "next/link";
import useArchiveOpen from "@/store/archive-manage";
import { cn } from "@/lib/utils";

const Page = () => {
  const params = useParams() as { page: string };
  const { data } = useDocumentQuery(params.page);
  // const { isOpen } = useArchiveOpen();
  return (
    <div className={cn("min-h-screen")}>
      <div className="p-4 text-sm text-gray-500">
        <Link
          className="p-1 hover:bg-gray-100 rounded-md cursor-pointer"
          href={"/" + data?.parent_id}
        >
          {data?.parent_title}
        </Link>
        {data?.parent_id && " / "}{" "}
        <span className="p-1 hover:bg-gray-100 rounded-md cursor-pointer">
          {data?.title}
        </span>
      </div>
      <Editor page={params?.page} data={data} />
    </div>
  );
};

export default Page;
