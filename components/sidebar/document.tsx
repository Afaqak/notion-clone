import { cn } from "@/lib/utils";
import useModalStore from "@/store/modal-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowUpRight,
  ChevronRight,
  Copy,
  FileText,
  Link as LinkTag,
  PlusIcon,
  SquarePen,
  Star,
  StarOff,
  Trash2,
  GrabIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuShortcut,
} from "../ui/context-menu";
import { PageDocument } from "@/types/type";
import RenamePageMetaContent from "../rename-title";
import useMetaDataUpdate from "@/store/meta-data-update";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { toast } from "sonner";

const Document = ({ doc, open, handleOpenStateChange }: any) => {
  const router = useRouter();
  const { setData, _id } = useMetaDataUpdate();
  const { setTypeAndData } = useModalStore();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  interface DocumentData {
    _id: string;
    parent_id?: string;
    children?: DocumentData[];
    [key: string]: any;
  }

  function getParentAndUpdateChildren(
    data: DocumentData,
    newData: DocumentData
  ): DocumentData {
    if (!data) return data;

    if (data._id === newData?.parent_id) {
      return {
        ...data,
        children: [...(data.children || []), newData],
      };
    }
    if (data.children && data.children.length > 0) {
      return {
        ...data,
        children: data.children.map((child) =>
          getParentAndUpdateChildren(child, newData)
        ),
      };
    }
    return data;
  }

  const addDocument = useMutation({
    mutationFn: () => axios.post(`/api/documents/create`, { doc_id: doc?._id }),

    onSuccess(data) {
      const newDoc = data?.data?.data;
      if (newDoc) {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set("p", newDoc?._id);
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, "", newUrl);
        // setTypeAndData("create", newDoc);

        queryClient.setQueryData<DocumentData[]>(["documents"], (oldData) => {
          if (!oldData) return [newDoc];
          return oldData.map((doc) => getParentAndUpdateChildren(doc, newDoc));
        });
      }
    },
  });

  const markFavorite = useMutation({
    mutationFn: () => axios.post(`/api/documents/${doc?._id}/toggle-favorite`),
    onSuccess(data) {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: () => axios.delete(`/api/documents/${doc?._id}/delete`),
    onSuccess(data) {
      
      const firstDoc = queryClient.getQueryData([
        "documents",
      ]) as PageDocument[];
      router.push(`/${firstDoc[0]?._id}`);
      console.log(data?.data?.type === "parent", data?.data?.data);
      if (data?.data?.data?.type === "parent") {
        toast.success("Document deleted");
      } else {
        toast.success("Document sent to trash");
      }
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const cloneDocument = useMutation({
    mutationFn: ({ with_content }: { with_content: boolean }) =>
      axios.patch(`/api/documents/${doc?._id}/clone`, { with_content }),
    onSuccess(data) {
      console.log("[CLONED]", data);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const copyUrl = () => {
    const url = `${window.location.origin}/${doc?._id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("URL copied to clipboard");
    });
  };

  const { page } = useParams();
  const active = page === doc?._id;

  return (
    <div className="relative">
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              router.push(`/${doc?._id}`);
            }}
            className={cn(
              "group flex cursor-pointer font-medium justify-between text-gray-500 rounded-md px-2 py-2 hover:bg-stone-200 items-center",
              active && "bg-stone-100"
            )}
          >
            <div className="flex gap-2 items-center">
              <ChevronRight
                onClick={handleOpenStateChange}
                className={cn(
                  "h-4 w-4 ml-0.5 opacity-0 hidden group-hover:opacity-100 group-hover:block group-hover:bg-gray-200 rounded-full transition-opacity duration-200",
                  {
                    "rotate-90": open,
                  }
                )}
              />
              {doc?.icon ? (
                <p className="text-[1.2rem] -mt-0.5 group-hover:hidden">
                  {doc?.icon}
                </p>
              ) : (
                <FileText className="h-5 w-5 shrink-0 group-hover:hidden" />
              )}
              <span className="line-clamp-1 w-[80%]">
                {doc?.title ? doc?.title : "untitled"}
              </span>
            </div>
            <PlusIcon
              onClick={(e) => {
                e.stopPropagation();
                addDocument.mutate();
              }}
              className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:bg-gray-200 rounded-full p-1 transition-opacity duration-200"
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64 text-gray-500">
          {doc?.type !== "parent" && (
            <ContextMenuItem
              onClick={() => markFavorite.mutate()}
              className="flex font-medium gap-2"
            >
              {doc?.is_favorite ? (
                <StarOff className="size-4" />
              ) : (
                <Star className="size-4" />
              )}

              {doc?.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={copyUrl} className="flex font-medium gap-2">
            <LinkTag className="size-4" /> Copy Url
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => deleteDocument.mutate()}
            className="flex font-medium gap-2"
          >
            <Trash2 className="size-4" /> Delete
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex font-medium gap-2">
              <Copy className="size-4" /> Duplicate
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-64  font-medium ">
              <ContextMenuItem
                className="text-gray-500 hover:text-black cursor-pointer"
                onClick={() => cloneDocument.mutate({ with_content: false })}
              >
                without content
                <ContextMenuShortcut>Ctrl + D</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem
                className="text-gray-500 hover:text-black cursor-pointer"
                onClick={() => cloneDocument.mutate({ with_content: true })}
              >
                with content
                <ContextMenuShortcut>Ctrl + Shift + D</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem
            // onClick={() => {
            //   setIsOpen(true);
            //   setData(true, doc?._id, doc?.title, doc?.icon);
            // }}
            asChild
            className=""
          >
            <Popover>
              <PopoverTrigger asChild className="flex gap-2">
                <div
                  onClick={() => {
                    setIsOpen(true);
                    setData(true, doc?._id, doc?.title, doc?.icon);
                  }}
                  className="flex font-medium hover:text-black gap-2 cursor-pointer px-2 items-center"
                >
                  <SquarePen className="size-4" /> Rename
                </div>
              </PopoverTrigger>
              <PopoverContent
                asChild
                className="w-80 bg-none border-none shadow-none"
              >
                <div className="z-10">
                  <RenamePageMetaContent setIsOpen={setIsOpen} open={isOpen} />
                </div>
              </PopoverContent>
            </Popover>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <Link
              className="flex font-medium items-center gap-2"
              href={`/${doc?._id}`}
              target="_blank"
            >
              <ArrowUpRight className="size-4" /> Open in new tab
            </Link>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {/* {<RenamePageMetaContent setIsOpen={setIsOpen} open={isOpen} />} */}
    </div>
  );
};

export default Document;
