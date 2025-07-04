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

import { registerSchema } from "../../schemas";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export const SignUpView = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const register = useMutation(
    trpc.auth.register.mutationOptions({
      onError: error => {
        toast.error(error.message);
        console.log(error.message);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.auth.session.queryFilter());
        router.push("/dashboard");
      },
    })
  );

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
      username: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    register.mutate(values);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 ">
      <div className="bg-zinc-900/90 h-full w-full lg:col-span-3 overflow-y-auto pt-24">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8 p-4 lg:p-16"
          >
            <div className="flex items-center justify-between mb-8">
              <Link href="/">
                <span
                  className={cn(
                    "text-3xl font-bold tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent",
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
                <Link prefetch href="/login">
                  Se connecter
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
              Rejoignez plus de 1 500 clients satisfaits chez Naim Kchao
              Barbershop
            </h1>
            <FormField
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                    Nom d&apos;utilisateur
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
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                    Prénom
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
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                    Nom
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                    Téléphone
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
              disabled={register.isPending}
              type="submit"
              size="lg"
              variant="default"
              className="bg-gold-400 text-white rounded-2xl hover:bg-gold-500 hover:text-primary cursor-pointer"
            >
              Créer un compte
            </Button>
          </form>
        </Form>
      </div>
      <div
        className="h-full w-full lg:col-span-2 hidden lg:block"
        style={{
          backgroundImage: "url('/images/bg-pattern.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
};
