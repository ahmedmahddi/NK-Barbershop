import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/trpc/server";
import AdminLayout from "./layout";
import type { ReactNode } from "react";

export default function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminLayout>{children}</AdminLayout>
    </HydrationBoundary>
  );
}