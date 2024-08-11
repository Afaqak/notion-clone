"use server";

import { lucia } from "@/lib/auth";
import connectDB from "@/lib/connect-db";
import { User } from "@/models/model";

import { ActionResult } from "next/dist/server/app-render/types";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verify } from "@node-rs/argon2";

export async function login(data: any): Promise<ActionResult> {
  await connectDB();
  const username = data?.username;

  const password = data?.password;

  const existingUser = await User.findOne({ username: username });
  if (!existingUser) {
    return {
      error: "Incorrect username or password",
    };
  }

  const validPassword = await verify(existingUser.password, password as string);
  if (!validPassword) {
    return {
      error: "Incorrect username or password",
    };
  }

  const session = await lucia.createSession(existingUser._id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return {
    success: "Signed In",
  };
}
