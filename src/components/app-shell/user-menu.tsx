import { getCurrentUser, getProfile } from "@/lib/auth/dal";
import { UserMenuDropdown } from "./user-menu-dropdown";

/** Lee la sesión en el servidor y pasa solo lo necesario al menú (cliente). */
export async function UserMenu({ variant }: { variant: "sidebar" | "header" }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await getProfile();
  return (
    <UserMenuDropdown
      variant={variant}
      email={user.email}
      businessName={profile.businessName}
    />
  );
}
