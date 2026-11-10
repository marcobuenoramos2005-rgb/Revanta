import type { Metadata } from "next";

import { PageHeader } from "@/components/app-shell/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile, requireUser } from "@/lib/auth/dal";
import { DeleteAccountDialog, PasswordForm, ProfileForm } from "./settings-forms";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfile();

  return (
    <>
      <PageHeader title="Ajustes" description="Tu cuenta y los datos de tu negocio." />

      <div className="grid max-w-2xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tu negocio</CardTitle>
            <CardDescription>Aparece en tu panel y en tu menú de usuario.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm businessName={profile.businessName} currency={profile.currency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cuenta</CardTitle>
            <CardDescription>
              Has iniciado sesión como <strong className="text-foreground">{user.email}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>

        <Card className="ring-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de peligro</CardTitle>
            <CardDescription>
              Elimina tu cuenta y todos tus datos de forma permanente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccountDialog />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
