import type { Metadata } from "next";

import { PageHeader } from "@/components/app-shell/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetOnNavigate } from "@/components/reset-on-navigate";
import { formatUsd } from "@/lib/ai/cost";
import { getAiUsage } from "@/lib/ai/service";
import { getProfile, requireUser } from "@/lib/auth/dal";
import { DeleteAccountDialog, PasswordForm, ProfileForm } from "./settings-forms";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const user = await requireUser();
  const [profile, ai] = await Promise.all([getProfile(), getAiUsage()]);

  return (
    <>
      <PageHeader title="Ajustes" description="Tu cuenta y los datos de tu negocio." />

      <ResetOnNavigate>
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

        <Card>
          <CardHeader>
            <CardTitle>Anuncios con IA</CardTitle>
            <CardDescription>
              {ai.mode === "live"
                ? "Tu consumo de generación de anuncios."
                : ai.mode === "mock"
                  ? "Modo de prueba: los textos son simulados y no tienen coste."
                  : "La generación con IA todavía no está activada."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Últimas 24 horas</dt>
                <dd className="font-medium tabular-nums">
                  {ai.usedToday} de {ai.limit} anuncios
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Este mes</dt>
                <dd className="font-medium tabular-nums">
                  {ai.monthCount === 1 ? "1 anuncio" : `${ai.monthCount} anuncios`}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Coste estimado del mes</dt>
                <dd className="font-medium tabular-nums">{formatUsd(ai.monthCostUsd)}</dd>
              </div>
            </dl>
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
      </ResetOnNavigate>
    </>
  );
}
