"use client";

import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";
import { ChangeEvent } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: PartialBlock[] | string;
  editable?: boolean;
}

const BlockEditor = ({ onChange, initialContent, editable }: EditorProps) => {
  const params = useParams();

  const uploadFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      console.error("Only image files are allowed");
      return;
    }

    try {
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as Buffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });

      if (fileData) {
        const presignedURL = new URL("/api/presigned", window.location.href);
        presignedURL.searchParams.set("fileName", file.name);
        presignedURL.searchParams.set("contentType", file.type);
        console.log(presignedURL.toString());

        const response = await fetch(presignedURL.toString());
        const res = await response.json();

        const body = new Blob([fileData as Buffer], { type: file.type });
        await fetch(res.signedUrl, {
          body,
          method: "PUT",
        });

        const signedUrl = res.signedUrl.split("?")[0];
        return signedUrl;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent:
      typeof initialContent === "string"
        ? JSON.parse(initialContent)
        : initialContent && initialContent.length > 0
        ? initialContent
        : [
            {
              id: "initial-paragraph",
              type: "paragraph",
              props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
              },
              content: [
                {
                  type: "text",
                  text: "Welcome type something to get started...",
                },
              ],
              children: [],
            },
          ],
    uploadFile,
  });

  const handleEditorChange = () => {
    if (onChange) {
      const documentSnapshot = editor?.document;
      const documentString = JSON.stringify(documentSnapshot);
      onChange(documentString);
    }
  };

  return (
    <div>
      <BlockNoteView editor={editor} className="" data-theming-css-demo onChange={handleEditorChange} />
    </div>
  );
};

export default BlockEditor;
