import { createClient } from "@supabase/supabase-js";

function requireEnvironmentVariable(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta ${name} en .env.local.`);
  }

  return value;
}

const supabaseUrl = requireEnvironmentVariable("SUPABASE_URL");
const publishableKey = requireEnvironmentVariable("SUPABASE_PUBLISHABLE_KEY");
const secretKey = process.env.SUPABASE_SECRET_KEY
  ?? requireEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY");

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

async function main() {
  const publicClient = createClient(supabaseUrl, publishableKey, clientOptions);
  const adminClient = createClient(supabaseUrl, secretKey, clientOptions);

  const publicParticipants = await publicClient
    .from("participants")
    .select("id", { count: "exact", head: true });

  if (publicParticipants.error) {
    throw new Error(`La lectura pública falló: ${publicParticipants.error.message}`);
  }

  const privateAsAdmin = await adminClient
    .from("import_batches")
    .select("id", { count: "exact", head: true });

  if (privateAsAdmin.error) {
    throw new Error(`La lectura administrativa falló: ${privateAsAdmin.error.message}`);
  }

  const privateAsPublic = await publicClient.from("import_batches").select("id").limit(1);

  if (!privateAsPublic.error) {
    throw new Error("La tabla import_batches quedó accesible con la clave publicable.");
  }

  console.log(
    [
      `Supabase conectado: ${new URL(supabaseUrl).host}`,
      `Participantes visibles públicamente: ${publicParticipants.count ?? 0}`,
      `Lotes de importación visibles como administrador: ${privateAsAdmin.count ?? 0}`,
      "Privacidad verificada: import_batches está bloqueada para acceso público.",
    ].join("\n"),
  );
}

void main();
