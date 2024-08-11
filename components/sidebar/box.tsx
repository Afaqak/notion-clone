import React from "react";
import { User } from "lucia";
import BoxItem from "./box-item";
import {
  ChevronsLeft,
  HomeIcon,
  LucideChevronLeft,
  SettingsIcon,
  SquarePen,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ProfileItem } from "./profile";

const Box = ({ user, setIsFixed }: { user: User; setIsFixed: any }) => {
  const queryClient = useQueryClient();
  const addDocument = useMutation({
    mutationFn: () =>
      axios.post(`/api/documents/create`, {
        doc_id: null,
      }),
    onSuccess(data) {
      queryClient.setQueryData(["documents"], (oldData: Document[]) => {
        if (oldData) {
          return [...oldData, data.data.data];
        }
        return [data.data.data];
      });
    },
  });

  return (
    <div className="bg-white">
      <div className="flex cursor-pointer justify-between rounded-md p-2 hover:bg-stone-100 mb-2 items-center">
        <ProfileItem user={user} />
        <div className="flex items-center gap-2">
          <ChevronsLeft
            onClick={setIsFixed}
            className="w-7 h-7 rounded-md hover:bg-stone-200 p-1"
          />
          <SquarePen
            onClick={() => addDocument.mutate()}
            className="w-7 h-7 rounded-md hover:bg-stone-200 p-1"
          />
        </div>
      </div>
      <BoxItem text={"Home"} icon={<HomeIcon className="w-5 h-5" />} />
      <BoxItem text={"Settings"} icon={<SettingsIcon className="w-5 h-5" />} />
    </div>
  );
};

export default Box;
