import {
  ChartColumnIcon,
  LayoutDashboardIcon,
  PackageIcon,
  ReceiptIcon,
  SettingsIcon,
  TagIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Aparece en la barra inferior del móvil (máx. 4; el resto va en "Más"). */
  mobilePrimary?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/panel", label: "Panel", icon: LayoutDashboardIcon, mobilePrimary: true },
  { href: "/inventario", label: "Inventario", icon: PackageIcon, mobilePrimary: true },
  { href: "/ventas", label: "Ventas", icon: TagIcon, mobilePrimary: true },
  { href: "/gastos", label: "Gastos", icon: ReceiptIcon, mobilePrimary: true },
  { href: "/estadisticas", label: "Estadísticas", icon: ChartColumnIcon },
  { href: "/ajustes", label: "Ajustes", icon: SettingsIcon },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
