"use client";

import * as React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "lucia";
import { ChevronsUpDown, User2 } from "lucide-react";
import { logout } from "@/actions/logout";
import { useQueryClient } from "@tanstack/react-query";

export function ProfileItem({ user }: { user: User }) {
  const [open, setOpen] = React.useState(false);
  const client = useQueryClient();
  const onClick = () => {
    client.removeQueries();
    logout();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex gap-7 items-center">
        {user?.username}
        <ChevronsUpDown className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] bg-white p-0" align="start">
        {/* <StatusList user={user} /> */}
        <ul className="p-2 text-gray-500 divide-y-2 divide-gray-100 text-sm flex flex-col">
          <li className="flex p-2 hover:bg-stone-200 items-center cursor-pointer rounded-md gap-2">
            <User2 className="h-4 w-4" />
            {user?.username}
          </li>
          <li
            onClick={onClick}
            className="cursor-pointer rounded-md p-2 hover:bg-stone-200"
          >
            Log out
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );

  // return (
  //   <Drawer open={open} onOpenChange={setOpen}>
  //     <DrawerTrigger asChild>
  //       <Button variant="outline" className="w-[150px] justify-start">
  //         {selectedStatus ? <>{selectedStatus.label}</> : <>+ Set status</>}
  //       </Button>
  //     </DrawerTrigger>
  //     <DrawerContent>
  //       <div className="mt-4 border-t">
  //         <StatusList setOpen={setOpen} setSelectedStatus={setSelectedStatus} />
  //       </div>
  //     </DrawerContent>
  //   </Drawer>
  // )
}
