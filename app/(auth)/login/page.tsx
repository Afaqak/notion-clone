import { LoginForm } from "@/components/login";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  // const { user } = await validateRequest();
  // if (user) {
  //   return redirect("/");
  // }
  return <LoginForm />;
};

export default Page;
