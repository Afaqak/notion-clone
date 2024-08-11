"use server";
import { lucia } from "@/lib/auth";
import connectDB from "@/lib/connect-db";
import { User } from "@/models/model";

import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";

export async function signup(data: any) {
  await connectDB();

  const username = data?.username;
  const password = data?.password;

  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const userId = generateIdFromEntropySize(10);
  const user = await User.create({
    _id: userId,
    username: username,
    password: passwordHash,
  });

  const session = await lucia.createSession(user?.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return {
    success: "Signed Up",
  };
}
