"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  CalendarDays,
  User,
  Users,
  CalendarRange,
  Package,
  ClipboardList,
  PenSquare,
  LogOut,
} from "lucide-react";

/* ───────────────────── helper to style active links ──────────────────── */
function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  active: boolean;
}) {
  return (
    <SidebarMenuItem>
      {/* ONE-child rule respected ↓↓↓ */}
      <SidebarMenuButton asChild>
        <Link
          href={href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-zinc-800 ${
            active
              ? "bg-gold-400/10 text-gold-400"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Icon width={16} height={16} />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/* ───────────────────────────── sidebar itself ────────────────────────── */
export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname?.includes(path);

  return (
    <Sidebar className="w-[280px] border-r border-gold-400/20 bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 shadow-[0_0_20px_rgba(251,191,36,0.15)] text-white">
      {/* ─────────── En-tête ─────────── */}
      <SidebarHeader className="h-[69px] border-b border-gold-400/20 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/LogoNK.png" alt="logo" width={42} height={42} />
          <span className="font-bold text-xl  bg-gradient-to-r from-gold-200 via-gold-400 to-gold-200 bg-clip-text text-transparent">
            NK Barbershop
          </span>
        </Link>
      </SidebarHeader>

      {/* ─────────── Contenu défilant ─────────── */}
      <SidebarContent className="py-4">
        {/* Gestion */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 mb-3 text-xs uppercase tracking-wider text-zinc-500">
            Gestion
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem
                href="/dashboard"
                label="Tableau de bord"
                icon={LayoutDashboard}
                active={pathname === "/dashboard"}
              />
              <NavItem
                href="/appointments"
                label="Rendez-vous"
                icon={CalendarDays}
                active={isActive("/appointments")}
              />
              <NavItem
                href="/customers"
                label="Clients"
                icon={User}
                active={isActive("/customers")}
              />
              <NavItem
                href="/barbers"
                label="Équipe"
                icon={Users}
                active={isActive("/barbers")}
              />
              <NavItem
                href="/schedule"
                label="Planning"
                icon={CalendarRange}
                active={isActive("/schedule")}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Boutique */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 mt-4 mb-3 text-xs uppercase tracking-wider text-zinc-500">
            Boutique
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem
                href="/products"
                label="Produits"
                icon={Package}
                active={isActive("/products")}
              />
              <NavItem
                href="/orders"
                label="Commandes"
                icon={ClipboardList}
                active={isActive("/orders")}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Site Web */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 mt-4 mb-3 text-xs uppercase tracking-wider text-zinc-500">
            Site Web
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem
                href="/content"
                label="Contenu"
                icon={PenSquare}
                active={isActive("/content")}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ─────────── Pied de page / Déconnexion ─────────── */}
      <SidebarFooter className="border-t border-gold-400/20 p-4">
        <button
          onClick={() => {
            localStorage.removeItem("barbershopAdmin");
            router.push("/dashboard");
          }}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gold-400/30 px-4 py-2 text-sm text-gold-400 transition-colors hover:bg-gold-400/10"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
