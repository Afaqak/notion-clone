"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useEffect, useState, useTransition } from "react";
import { login } from "@/actions/login";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),

  password: z.string().min(4, "Password must be atleast 4 characters"),
});
export function LoginForm() {
  const [isClient, setIsClient] = useState(false);
  let [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",

      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    startTransition(() => {
      login(values).then((data: any) => {
        console.log(data.error);
        if (data.error) {
          setIsLoading(false);
          toast.error(data.error);
        }
        if (data.success) {
          router.push("/");
        }
      });
    });
  }

  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-[300px]">
        <h1 className="font-semibold text-2xl mb-4">Think it. Make it</h1>
        <p className="text-gray-400 mb-4">Lets get right into it</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={isPending}
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-500/90"
            >
              Submit
            </Button>
          </form>
        </Form>
        <div className="mt-4">
          Don't have an account ?{" "}
          <Link className="text-gray-400" href={"/register"}>
            register
          </Link>
        </div>
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-md text-center">
            <div className="flex gap-2 items-center text-gray-500">
              <p className="text-sm">Signing in...</p>
              <Loader2 className="animate-spin" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
