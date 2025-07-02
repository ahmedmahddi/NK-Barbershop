import Link from "next/link";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import SectionHeader from "./SectionHeader";

const Cta = () => {
  return (
    <section
      className="w-full py-12 md:py-24 bg-zinc-800 relative overflow-hidden"
      style={{
        backgroundImage: `
    linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)),
    url('/images/bg-pattern.png')
  `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(251,146,60,0.1),_transparent_70%)] opacity-50"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-br from-transparent via-gold-400 to-transparent opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-br from-transparent via-gold-400 to-transparent opacity-30"></div>
      <div className="container relative px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <SectionHeader title="PRÊT À DÉCOUVRIR NOS SERVICES ?" />
            <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Prenez rendez-vous dès aujourd&apos;hui et laissez nos barbiers
              experts transformer votre look.
            </p>
          </div>
          <div className="mt-8">
            <Link href="/booking">
              <Button
                size="lg"
                className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white !rounded-button shadow-gold px-8 py-6 text-lg"
              >
                <CalendarIcon className="mr-2" />
                Prendre rendez-vous
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cta;
