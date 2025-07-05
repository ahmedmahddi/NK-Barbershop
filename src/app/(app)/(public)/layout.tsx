export const dynamic = "force-dynamic";
import { Navbar } from "@/modules/home/ui/components/navbar";
import { Footer } from "@/modules/home/ui/components/footer";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/trpc/server";

interface Props {
  children: React.ReactNode;
}

const layout = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  return (
    <div className="bg-zinc-900/90">
      <Navbar />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div>{children}</div>
      </HydrationBoundary>
      <Footer />
    </div>
  );
};

export default layout;
