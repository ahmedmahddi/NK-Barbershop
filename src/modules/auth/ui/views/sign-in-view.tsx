"use client";
import { Poppins } from "next/font/google";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { loginSchema } from "../../schemas";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export const SignInView = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const login = useMutation(
    trpc.auth.login.mutationOptions({
      onError: error => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.auth.session.queryFilter());
        router.push("/");
      },
    })
  );

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login.mutate(values);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5">
      <div
        className="h-screen w-full lg:col-span-2 hidden lg:block"
        style={{
          backgroundImage: "url('/images/bg-pattern.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="bg-zinc-900/90 h-screen w-full pt-24 lg:col-span-3 overflow-y-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8 p-4 lg:p-16"
          >
            <div className="flex items-center justify-between mb-8">
              <Link href="/">
                <span
                  className={cn(
                    "text-3xl font-bold tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent ",
                    poppins.className
                  )}
                >
                  Naim Kchao Barbershop
                </span>
              </Link>
              <Button
                asChild
                variant="default"
                size="sm"
                className="text-base underline border-none tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent"
              >
                <Link prefetch href="/register">
                  S&apos;inscrire
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent ">
              Bienvenue chez Naim Kchao Barbershop
            </h1>
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="rounded-2xl border border-gold-200 text-white"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                    Mot de passe
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="rounded-2xl border border-gold-200 text-white"
                      {...field}
                      type="password"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={login.isPending}
              type="submit"
              size="lg"
              variant="default"
              className="bg-gold-400 text-white rounded-2xl hover:bg-gold-500 hover:text-primary cursor-pointer"
            >
              Se connecter
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
