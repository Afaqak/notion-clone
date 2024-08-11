import Sidebar from "@/components/sidebar";

import { validateRequest } from "@/lib/auth";
import { User } from "lucia";
import { redirect } from "next/navigation";
import React from "react";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const user = (await validateRequest()).user as User;

  if(!user) redirect('/login')

  return (
    <div className="flex">
      <Sidebar user={user} />
      {/* </ResizablePanel> */}
      {/* <div className="w-full mx-auto">{children}</div> */}
    </div>
  );
};

export default Layout;
