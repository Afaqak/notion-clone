import SelectCoverImage from "@/components/select-cover-image";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { Image, Loader2 } from "lucide-react";

interface Document {
  _id: string;
  title: string;
  content: any;
  icon: string;
  children?: Document[];
  bg_image?: "";
}

const CoverImage = ({ data }: { data: Document }) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const { page } = useParams();
  const [loading, setLoading] = useState(false);
  const updateBgImage = useMutation({
    mutationFn: (url: string) =>
      axios.patch(`/api/documents/${page}/update`, {
        bg_image: url,
      }),
    onSuccess({ data: queryData }) {
      setLoading(false);
      const data = queryClient.getQueryData(["documents", page]) as any;
      queryClient.setQueryData(["documents", page], {
        ...data,
        ...queryData?.data,
      });
    },
    onError(error) {
      setLoading(false);
    },
  });

  const setBgImage = (url: string) => {
    setLoading(true);
    updateBgImage.mutate(url);
  };

  return (
    <div className="h-24 group relative">
      {data?.bg_image && (
        <img
          alt=""
          src={data?.bg_image}
          className="w-full h-32 object-contain"
        />
      )}
      {updateBgImage.isPending && (
        <div className="absolute inset-0 flex items-center bg-white bg-opacity-80 justify-center">
          <Loader2 className="animate-spin stroke-slate-500" />
        </div>
      )}
      <div
        className={cn(
          "flex text-gray-500 gap-4 absolute top-4 transition ease-in-out invisible opacity-0 group-hover:opacity-100 group-hover:visible right-10",
          isOpen && "opacity-100 visible"
        )}
      >
        {data?.bg_image && (
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="border flex gap-2 items-center rounded-md shadow p-1 text-sm"
            >
              <Image className="w-4 h-4 " /> Change Cover
            </button>
            <SelectCoverImage
              setLoading={setLoading}
              setBgImage={setBgImage}
              page={page}
              isOpen={isOpen}
              loading={loading}
              setIsOpen={setIsOpen}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverImage;
