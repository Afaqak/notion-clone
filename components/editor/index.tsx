import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Image, PlusIcon, Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import BlockEditor from "./block-editor";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { emojis } from "@/utils/emojis";
import CoverImage from "@/app/(main)/[page]/cover-image";
import { updateDocumentTree } from "@/utils/update-document-tree";
import { DocumentType } from "@/types/type";
import useOnClickOutside from "@/hooks/use-outside-click";
import useArchiveOpen from "@/store/archive-manage";
import { cn } from "@/lib/utils";

interface Document {
  _id: string;
  title: string;
  content: any;
  icon: string;
  children?: Document[];
  bg_image?: "";
}

interface EditorProps {
  data?: Document;
  page: string;
}

const Editor: FunctionComponent<EditorProps> = ({ data, page }) => {
  const queryClient = useQueryClient();

  const isInitialContentSet = useRef(false);
  const [title, setTitle] = useState<string>("");
  const [emoji, setEmoji] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const ref = useRef(null);
  const {isOpen}=useArchiveOpen()

  useEffect(() => {
    if (data) {
      setTitle(data?.title);
      setEmoji(data?.icon);
    }
  }, [data]);

  const getInitialContent = () => {
    try {
      return JSON.parse(data?.content) || undefined;
    } catch (error) {
      console.error("Error parsing content JSON:", error);
      return [
        {
          type: "paragraph",
          content: [],
        },
      ];
    }
  };

  const updateTitle = useMutation({
    mutationFn: (newTitle: string) =>
      axios.patch(`/api/documents/${page}/update`, { title: newTitle }),
    onError: (err, newTitle, context) => {},
    onSuccess({ data: queryData }) {
      console.log(data, "[data]");
      queryClient.setQueryData(["documents", page], {
        ...data,
        ...queryData?.data,
      });
    },
  });

  const updateIcon = useMutation({
    mutationFn: (newIcon: string) =>
      axios.patch(`/api/documents/${page}/update`, { icon: newIcon }),
    onError: (err, newTitle, context) => {},
    onSuccess({ data: queryData }) {
      console.log(data, "[data]");
      queryClient.setQueryData(["documents", page], {
        ...data,
        ...queryData?.data,
      });
    },
  });

  const updateContent = useMutation({
    mutationFn: (newContent: string) =>
      axios.patch(`/api/documents/${page}/update`, {
        content: newContent,
      }),
    onSuccess({ data: queryData }) {
      console.log(data, "[data block]");
      queryClient.setQueryData(["documents", page], {
        ...data,
        ...queryData?.data,
      });
    },
  });

  const updateBgImage = useMutation({
    mutationFn: (url: string) =>
      axios.patch(`/api/documents/${page}/update`, {
        bg_image: url,
      }),
    onSuccess({ data: queryData }) {
      const data = queryClient.getQueryData(["documents", page]) as any;
      queryClient.setQueryData(["documents", page], {
        ...data,
        ...queryData?.data,
      });
    },
  });

  const debouncedUpdateTitle = useCallback(
    useDebouncedCallback((newTitle: string) => {
      updateTitle.mutate(newTitle);
    }, 500),
    []
  );

  const debouncedBlocksChange = useCallback(
    useDebouncedCallback((newBlocks: string) => {
      updateContent.mutate(newBlocks);
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
    setTitle(newTitle);
    queryClient.setQueryData<DocumentType[]>(["documents"], (old) =>
      old
        ? old.map((doc) => updateDocumentTree(doc, data?._id ?? "", newTitle))
        : []
    );

    debouncedUpdateTitle(newTitle);
  };

  const handleBlocksChange = (content: string) => {
    if (isInitialContentSet.current) {
      isInitialContentSet.current = false;
      return;
    }

    debouncedBlocksChange(JSON.stringify(content));
  };

  const handleEmojiClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    setShowEmojiPicker(!showEmojiPicker);
  };

  const onEmojiClick = (event: EmojiClickData) => {
    setEmoji(event?.emoji);
    queryClient.setQueryData<DocumentType[]>(["documents"], (old) =>
      old
        ? old.map((doc) =>
            updateDocumentTree(doc, data?._id ?? "", undefined, event?.emoji)
          )
        : []
    );

    debouncedIconChange(event?.emoji);
    setShowEmojiPicker(false);
  };

  const fetchRandomUnsplashImage = async () => {
    const UNSPLASH_ACCESS_KEY = "32rls_FDCFuQOpD3QSninL4qq6f8pO5BouLnvRwZX8E";
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?client_id=${UNSPLASH_ACCESS_KEY}`
      );
      const data = await response.json();
      return data.urls.regular;
    } catch (error) {
      console.error("Error fetching Unsplash image:", error);
      return null;
    }
  };

  const setBgImage = async () => {
    const url = await fetchRandomUnsplashImage();
    if (url) {
      updateBgImage.mutate(url);
    }
  };

  if (!data) {
    return null;
  }

  const getRandomEmoji = () => {
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setEmoji(randomEmoji);
    queryClient.setQueryData<DocumentType[]>(["documents"], (old) =>
      old
        ? old.map((doc) =>
            updateDocumentTree(doc, data?._id ?? "", undefined, randomEmoji)
          )
        : []
    );
    debouncedIconChange(randomEmoji);
  };

  return (
    
    <div className={cn("mx-auto max-w-4xl z-[10] flex flex-col relative",isOpen && 
      '-z-10'
    )}>

      {<CoverImage data={data} />}
      {emoji && (
        <div
          className="text-6xl mt-14  ml-10 mb-2 cursor-pointer"
          onClick={handleEmojiClick}
        >
          {emoji}
        </div>
      )}
      {showEmojiPicker && (
        <div
          ref={ref}
          className="absolute z-10"
          style={{ top: "100px", left: "50px" }}
        >
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}
      <div className="relative pt-8 pb-1 group">
        <div className="gap-2 w-fit font-medium group-hover:flex absolute hidden left-12 top-1 text-gray-500 text-xs">
          {!emoji && (
            <div
              className="flex gap-2 cursor-pointer items-center bg-white shadow rounded-md p-2"
              onClick={getRandomEmoji}
            >
              <Smile className="w-4 h-4" /> Add Icon
            </div>
          )}
          {!data?.bg_image && (
            <div
              onClick={setBgImage}
              className="flex gap-2 items-center cursor-pointer bg-white shadow rounded-md p-2"
            >
              <Image className="w-4 h-4" /> Add Cover
            </div>
          )}
        </div>

        <input
          className="outline-none bg-transparent border-none ml-[3.2rem] text-5xl placeholder:text-gray-200 font-bold"
          placeholder="Untitled"
          value={title}
          onChange={handleTitleChange}
        />
      </div>
      <BlockEditor
        onChange={handleBlocksChange}
        initialContent={getInitialContent()}
      />
    </div>
  );
};

export default Editor;
