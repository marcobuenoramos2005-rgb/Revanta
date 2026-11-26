// Comprueba la conexión con Anthropic SIN generar texto y SIN coste:
// solo consulta la ficha del modelo (endpoint de modelos, gratuito).
// Uso: npm run ai:check   (lee ANTHROPIC_API_KEY de .env.local o del entorno)
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-5-5";

if (!process.env.ANTHROPIC_API_KEY?.trim()) {
  console.error("✗ Falta ANTHROPIC_API_KEY. Añádela a .env.local (nunca la subas a GitHub).");
  process.exit(1);
}

try {
  const client = new Anthropic({ timeout: 15_000, maxRetries: 0 });
  const model = await client.models.retrieve(MODEL);
  console.log(`✓ Clave válida. Modelo disponible: ${model.display_name} (${model.id})`);
  console.log("  No se ha generado texto ni se ha consumido crédito.");
} catch (error) {
  if (error instanceof Anthropic.AuthenticationError) {
    console.error("✗ La clave no es válida o está revocada.");
  } else if (error instanceof Anthropic.NotFoundError || error instanceof Anthropic.PermissionDeniedError) {
    console.error(`✗ La clave funciona, pero esta cuenta no tiene acceso al modelo ${MODEL}.`);
  } else if (error instanceof Anthropic.APIError) {
    console.error(`✗ Error de la API (${error.status ?? "sin conexión"}).`);
  } else {
    console.error("✗ Error inesperado al conectar.");
  }
  process.exit(1);
}
