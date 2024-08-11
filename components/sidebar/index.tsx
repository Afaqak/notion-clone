"use client";
import { User } from "lucia";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Box from "./box";
import {
  useArchivedDocumentQuery,
  useDocumentsQuery,
} from "@/features/documents/queries";
import DocumentsList from "./documents-list";
import { cn } from "@/lib/utils";
import Archived from "../archive";
import { Trash } from "lucide-react";
import useArchiveOpen from "@/store/archive-manage";

interface DocumentType {
  is_favorite: unknown;
  _id: string;
  title: string;
  content: string;
  parent_id?: string;
  children?: DocumentType[];
  is_deleted: boolean;
}

const Sidebar = ({ user }: { user: User }) => {
  const { data } = useDocumentsQuery();
  const { data: archived } = useArchivedDocumentQuery();
  const grabRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState<number>(340);
  const [isFixed, setIsFixed] = useState<boolean>(false);
  const { isOpen, setOpen } = useArchiveOpen();
  const [openStates, setOpenStates] = useState<{
    favorites: boolean;
    private: boolean;
  }>({
    favorites: true,
    private: true,
  });

  const handleMouseMove = (e: MouseEvent) => {
    if (grabRef.current) {
      let newWidth = e.clientX;
      newWidth = Math.max(340, Math.min(newWidth, 550));
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = () => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleDoubleClick = () => {
    setSidebarWidth(340);
  };

  const handleToggle = (section: "favorites" | "private") => {
    setOpenStates((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFixedPosition = () => {
    setIsFixed((prev) => !prev);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const documentMap = new Map<string, DocumentType>();

  const buildDocumentMap = (docs: DocumentType[]) => {
    docs?.forEach((doc) => {
      documentMap.set(doc._id, doc);
      if (doc.children) {
        buildDocumentMap(doc.children);
      }
    });
  };

  buildDocumentMap(data || []);

  let favorites: DocumentType[] = [...documentMap]
    .map((doc) => doc[1])
    ?.filter((doc) => doc?.is_favorite);

  return (
    <motion.div className={cn(isFixed && "w-40 group-hover")}>
      <motion.div
        ref={sidebarRef}
        className={cn(
          "h-screen sticky top-0 font-medium overflow-y-auto border-r max-h-full text-sm flex flex-col",
          isFixed && "shadow-2xl rounded-md overflow-hidden",
          isFixed && "w-40 group-hover:left-0 -left-40"
        )}
        style={{ width: !isFixed ? sidebarWidth : 340, overflow: "auto" }}
        animate={{
          position: isFixed ? "fixed" : "sticky",
          height: isFixed ? "80vh" : "100vh",
          top: isFixed ? "10vh" : "0",
          left: isFixed ? "auto" : 0,
          margin: isFixed ? "auto" : "0",
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="h-40 sticky border-b shadow-sm top-0 bg-white text-neutral-500 p-4">
          <Box user={user} setIsFixed={toggleFixedPosition} />
        </div>

        {favorites?.length > 0 && (
          <div className="p-3 -z-10">
            <div
              className="text-gray-400 text-xs cursor-pointer mb-1 rounded-md px-2 py-2 hover:bg-stone-200"
              onClick={() => handleToggle("favorites")}
            >
              Favorites
            </div>
            {openStates.favorites && (
              <DocumentsList documentMap={documentMap} documents={favorites} />
            )}
          </div>
        )}

        {/* {data?.length > 0 && ( */}
        <div className="p-3 -z-10">
          <div
            className="text-gray-400 text-xs cursor-pointer mb-1 rounded-md px-2 py-2 hover:bg-stone-200"
            onClick={() => handleToggle("private")}
          >
            Private
          </div>
          {openStates.private &&
            (data?.length <= 0 ? (
              <p className="text-sm text-center text-gray-500">No documents found</p>
            ) : (
              <DocumentsList documentMap={documentMap} documents={data} />
            ))}
        </div>
        {/* )} */}
        <div className="flex flex-col justify-end mt-auto p-3 -z-10">
          <div
            onClick={() => setOpen(!isOpen)}
            className="gap-2 relative group flex cursor-pointer font-medium justify-between text-gray-500 rounded-md px-2 py-2 hover:bg-stone-200 items-center"
          >
            Trash <Trash className="size-4" />
          </div>
          <Archived
            setIsOpen={() => setOpen(!isOpen)}
            isOpen={isOpen}
            data={archived}
          />
        </div>
        {/* 
        <div
          ref={grabRef}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          className={cn(
            "h-full w-[5px] cursor-col-resize flex items-center justify-center absolute right-0 top-0 hover:bg-gray-300",
            isFixed && "pointer-events-none cursor-default"
          )}
        >
          <div className="h-full bg-gray-200 absolute right-0" />
        </div> */}
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
