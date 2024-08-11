import React, { useRef, useState, useCallback } from "react";
import { FileText } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useMetaDataUpdate from "@/store/meta-data-update";
import useOnClickOutside from "@/hooks/use-outside-click";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useDebouncedCallback } from "use-debounce";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface Document {
  _id: string;
  title: string;
  content: any;
  icon: string;
  children?: Document[];
}

const updateDocumentTree = (
  tree: Document,
  id: string,
  newTitle?: string,
  newIcon?: string,
  newDocument?: Document
): Document => {
  if (!tree) return tree;

  if (tree._id === id) {
    return {
      ...tree,
      ...(newTitle !== undefined && { title: newTitle }),
      ...(newIcon && { icon: newIcon }),
      ...(newDocument && newDocument),
    };
  }

  if (tree.children) {
    return {
      ...tree,
      children: tree.children.map((child) =>
        updateDocumentTree(child, id, newTitle, newIcon, newDocument)
      ),
    };
  }

  return tree;
};

const RenamePageMetaContent = ({
  open,
  setIsOpen,
}: {
  open: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const ref = useRef(null);
  const { setData, _id, emoji: emojiValue, title } = useMetaDataUpdate();
  const queryClient = useQueryClient();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [renameTitle, setRenameTitle] = useState(title);
  const [emoji, setEmoji] = useState<string>("");

  useOnClickOutside(ref, () => {
    setData(false, "", "", "");
    setIsOpen(false);
  });

  const updateTitle = useMutation({
    mutationFn: (newTitle: string) =>
      axios.patch(`/api/documents/${_id}/update`, { title: newTitle }),
    onSuccess({ data: queryData }) {
      if (queryClient.getQueryData(["documents", _id])) {
        queryClient.invalidateQueries({ queryKey: ["documents", _id] });
      }
    },
  });

  const updateIcon = useMutation({
    mutationFn: (newIcon: string) =>
      axios.patch(`/api/documents/${_id}/update`, { icon: newIcon }),
    onSuccess({ data: queryData }) {
      if (queryClient.getQueryData(["documents", _id])) {
        queryClient.invalidateQueries({ queryKey: ["documents", _id] });
      }
    },
  });

  const debouncedUpdateTitle = useCallback(
    useDebouncedCallback((newTitle: string) => {
      updateTitle.mutate(newTitle);
    }, 500),
    []
  );

  const debouncedIconChange = useCallback(
    useDebouncedCallback((icon: string) => {
      updateIcon.mutate(icon);
    }, 500),
    []
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setRenameTitle(newTitle);

    queryClient.setQueryData<Document[]>(["documents"], (old) =>
      old
        ? old.map((doc) =>
            updateDocumentTree(doc, _id, newTitle, undefined, undefined)
          )
        : []
    );

    debouncedUpdateTitle(newTitle);
  };

  const handleEmojiClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    setShowEmojiPicker(!showEmojiPicker);
  };

  const onEmojiClick = (event: EmojiClickData) => {
    setEmoji(event?.emoji);
    queryClient.setQueryData<Document[]>(["documents"], (old) =>
      old
        ? old.map((doc) =>
            updateDocumentTree(doc, _id, undefined, event?.emoji)
          )
        : []
    );

    debouncedIconChange(event?.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* <div className="z-[9999998] bg-opacity-50" /> */}
          <motion.div
            key="renamePageMetaContent"
            ref={ref}
            initial={{ scale: 0.7, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: -10 }}
            className="w-[350px] z-40 bg-white border border-gray-200 shadow-max rounded-md p-1"
          >
            <div className="rounded-md items-center flex gap-2">
              <div className="p-1 border rounded-md" onClick={handleEmojiClick}>
                {emoji || emojiValue ? (
                  <span className="text-lg">{emoji || emojiValue}</span>
                ) : (
                  <FileText className="shrink-0 h-5 w-5 text-gray-500" />
                )}
              </div>

              <input
                value={renameTitle}
                className="outline-none border p-1 w-full rounded-md"
                placeholder="Change title"
                onChange={handleTitleChange}
              />
            </div>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute shadow-max z-[1000] mt-2"
              >
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RenamePageMetaContent;
