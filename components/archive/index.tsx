import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useOnClickOutside from "@/hooks/use-outside-click";
import { Trash, RotateCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { PageDocument } from "@/types/type";
import { toast } from "sonner";

interface DocumentType {
  is_favorite: unknown;
  _id: string;
  title: string;
  content: string;
  parent_id?: string;
  children?: DocumentType[];
  parent_title?: string;
  is_deleted: boolean;
}

interface ArchivedProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  data: DocumentType[];
}

const Archived: React.FC<ArchivedProps> = ({ isOpen, setIsOpen, data }) => {
  const ref = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const client = useQueryClient();

  const archiveMutation = useMutation({
    mutationFn: (id: string) => axios.patch(`/api/documents/${id}/recover`, {}),
    onSuccess({ data: queryData }) {
      client.invalidateQueries({ queryKey: ["documents", "archived"] });
      client.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  useOnClickOutside(ref, () => setIsOpen(false));

  const filteredData = data?.filter((page) =>
    page?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteDocument = useMutation({
    mutationFn: (_id: string) => axios.delete(`/api/documents/${_id}/delete`),
    onSuccess(data) {
      toast.success("Document deleted from archive");
      client.invalidateQueries({ queryKey: ["documents", "archived"] });
    },
  });

  const handleRestore = (id: string) => {
    // Implement the restore functionality
    archiveMutation.mutate(id);
    console.log(`Restored page with id: ${id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9999999999] bg-opacity-50" />
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed w-[400px] h-72 left-[22rem] top-96 left z-[9999999999] bg-white border border-gray-200 shadow-max rounded-md p-4"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pages"
              className="outline-none border p-2 w-full rounded-md mb-4"
            />
            <div className="max-h-96 z-[900000000] overflow-y-auto">
              {filteredData.map((page) => (
                <div
                  key={page._id}
                  className="flex items-center justify-between p-2 border-b"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate">{page.title}</span>
                    <span className="text-gray-500 text-sm">
                      {page.parent_title}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <RotateCw
                      className="text-gray-500 size-4 cursor-pointer"
                      onClick={() => handleRestore(page._id)}
                    />
                    <Trash
                      className="text-gray-500 size-4 cursor-pointer"
                      onClick={() => deleteDocument.mutate(page._id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Archived;
