import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import useOnClickOutside from "@/hooks/use-outside-click";
import axios from "axios";

const UNSPLASH_ACCESS_KEY = "32rls_FDCFuQOpD3QSninL4qq6f8pO5BouLnvRwZX8E";
const SelectCoverImage = ({
  isOpen,
  setIsOpen,
  setBgImage,
  page,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setBgImage: (url: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  page: any;
}) => {
  const ref = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [unsplashImages, setUnsplashImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleActiveTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (activeTab === "unsplash") {
      if (unsplashImages.length > 0) {
        return;
      }
      fetchUnsplashImages();
    }
  }, [activeTab]);

  const fetchUnsplashImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?client_id=${UNSPLASH_ACCESS_KEY}&count=24`
      );
      const data = await response.json();
      setUnsplashImages(data);
    } catch (error) {
      console.error("Error fetching Unsplash images:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      console.error("Only image files are allowed");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileData = event.target?.result;
      console.log(fileData, "RESULT");
      if (fileData) {
        const presignedURL = new URL("/api/presigned", window.location.href);
        presignedURL.searchParams.set("fileName", file.name);
        presignedURL.searchParams.set("contentType", file.type);
        console.log(presignedURL.toString());
        fetch(presignedURL.toString())
          .then((res) => res.json())
          .then((res) => {
            const body = new Blob([fileData], { type: file.type });
            fetch(res.signedUrl, {
              body,
              method: "PUT",
            }).then((data) => {
              setBgImage(res.signedUrl.split("?")[0]);
            });
          })
          .catch((err) => console.log(err))
          .finally(() => setLoading(false));
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const onInputClick = () =>
    inputRef?.current ? inputRef?.current?.click() : {};

  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed w-[500px] right-32 transform top-16 z-[9999999] bg-white border border-gray-200 shadow-max rounded-md max-h-[80vh] overflow-auto"
        >
          <div className="px-2 sticky top-0 bg-white flex border-b gap-4">
            <h2
              onClick={() => handleActiveTabChange("upload")}
              className={cn(
                "py-2 border-black cursor-pointer",
                activeTab === "upload" && "border-b-2"
              )}
            >
              Upload
            </h2>
            <h2
              onClick={() => handleActiveTabChange("unsplash")}
              className={cn(
                "py-2 border-black cursor-pointer",
                activeTab === "unsplash" && "border-b-2"
              )}
            >
              Unsplash
            </h2>
          </div>
          {activeTab === "upload" && (
            <div className="p-4 gap-2 flex items-center flex-col justify-center">
              <Button
                onClick={onInputClick}
                variant={"outline"}
                className="w-full"
              >
                Upload File
              </Button>
              <input
                accept="image/*"
                onChange={uploadFile}
                ref={inputRef}
                type="file"
                hidden
              />
              <p className="text-gray-500 text-xs">
                Images wider than 1500 pixels work best
              </p>
            </div>
          )}
          {activeTab === "unsplash" && (
            <div className="p-4 gap-2 flex flex-col items-center justify-center">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {unsplashImages.map((image) => (
                    <div
                      key={image.id}
                      className="flex flex-col cursor-pointer"
                    >
                      <img
                        onClick={() => setBgImage(image.urls.regular)}
                        src={image.urls.small}
                        alt={image.alt_description}
                        className="rounded-md w-32 mb-1 h-16 object-cover"
                      />
                      <p className="text-gray-500 line-clamp-2 text-xs">
                        by {image.user.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </>
  );
};

export default SelectCoverImage;
