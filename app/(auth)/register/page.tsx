import { RegisterForm } from "@/components/register-form";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  // const { user } = await validateRequest();

  // if (user) {
  //   return redirect("/");
  // }
  return <RegisterForm />;
};

export default Page;
