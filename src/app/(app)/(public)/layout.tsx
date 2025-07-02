import { Navbar } from "@/modules/home/ui/components/navbar";
import { Footer } from "@/modules/home/ui/components/footer";

interface Props {
  children: React.ReactNode;
}

const layout = async ({ children }: Props) => {
  return (
    <div className="bg-zinc-900/90">
      <Navbar />
      <div>{children}</div>
      <Footer />
    </div>
  );
};

export default layout;
