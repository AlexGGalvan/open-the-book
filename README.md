# Iglesia de Torreón - Lectura diaria

Aplicación web pública para organizar el plan mensual de lectura bíblica, las reflexiones compartidas por los hermanos, el historial de participantes, materiales de apoyo y la recitación semanal.

La aplicación se exporta estáticamente a GitHub Pages y consulta en vivo los datos públicos de Supabase mediante una clave publicable y políticas RLS. La importación de WhatsApp permanece en scripts privados.

## Tecnología

- Next.js 16 con App Router
- TypeScript
- Tailwind CSS 4
- Supabase/PostgreSQL con lectura pública protegida por RLS
- Pruebas con `node:test` mediante `tsx`

## Secciones públicas

- `/`: calendario mensual, lectura seleccionada y reflexiones del día.
- `/reflexiones`: búsqueda por texto, participante, libro o referencia.
- `/participantes`: resumen de participaciones e historial individual.
- `/recursos`: materiales del plan y descargas de ejemplo.
- `/recitacion`: recitación de esta semana y la próxima, con práctica de memoria.

No existe inicio de sesión, formulario público de carga ni sistema de notificaciones. Todos los visitantes ven la misma información autorizada.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://127.0.0.1:3000`.

## Validación

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Para reproducir la exportación estática usada por GitHub Pages en PowerShell:

```powershell
$env:GITHUB_PAGES = "true"
npm run build
```

## Organización

```text
src/
  app/                         Rutas públicas
  components/                  Componentes por funcionalidad
  data/churchData.ts           Datos de demostración
  domain/church.ts             Tipos del dominio
  server/supabase/admin.ts     Cliente privado de Supabase
  server/whatsapp-import/      Parser y normalizador de WhatsApp
supabase/schema.sql            Tablas, índices y políticas RLS
scripts/import-whatsapp.ts     Entrada de línea de comandos privada
```

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en el editor SQL.
3. Define las variables de `.env.example` únicamente en un entorno privado:

```text
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
WHATSAPP_SELF_NAME=...
```

La llave secreta nunca debe llevar el prefijo `NEXT_PUBLIC_`, incluirse en el bundle del navegador ni guardarse en Git. Las variables públicas contienen exclusivamente la URL y la clave publicable, cuyos resultados están limitados por RLS. El cliente de `src/server/supabase/admin.ts` importa `server-only` para impedir su uso accidental desde componentes públicos. La variable heredada `SUPABASE_SERVICE_ROLE_KEY` sigue aceptándose como respaldo.

Comprueba las credenciales y las políticas con:

```bash
npm run supabase:check
```

Las políticas RLS permiten leer únicamente:

- participantes activos;
- calendario y lecturas;
- reflexiones con estado `authorized`;
- recursos con `is_published = true`.
- recitaciones semanales con `is_published = true`.

Las tablas de importación no tienen políticas ni permisos públicos. La aprobación y publicación deben realizarse con procesos privados de administración.

## Importación de WhatsApp

El procesador admite formatos comunes de exportación de Android y iPhone, incluyendo mensajes de varias líneas. Para inspeccionar un TXT sin publicar nada:

```bash
npm run import:whatsapp -- "C:\ruta\exportacion.txt"
```

La salida muestra únicamente un resumen y metadatos de revisión. No imprime el texto bíblico, la reflexión completa ni el contenido descartado.

Para importar el TXT a Supabase de forma idempotente:

```bash
npm run import:whatsapp:supabase -- "C:\ruta\exportacion.txt"
```

El comando publica las reflexiones que coinciden con el calendario, conserva los casos ambiguos para revisión privada, extrae las recitaciones semanales y evita duplicados mediante el hash del mensaje.

El módulo:

- extrae autor, fecha, hora y contenido;
- reconoce nombres y abreviaturas de los 66 libros;
- normaliza citas como `Lam 2:21` y `EFESIOS 4:11-12`;
- separa texto bíblico y reflexión mediante etiquetas o párrafos;
- conserva el texto bíblico tal como fue compartido;
- valida libro y capítulo contra el plan de lectura;
- asigna al día anterior mensajes enviados antes de las 03:00 cuando la cita coincide;
- deduplica mediante SHA-256;
- oculta autores que sean números telefónicos;
- guarda por separado `sentAt` y `readingDate`;
- marca casos ambiguos y deja `published: false`;
- descarta conversaciones sin referencia sin conservar su contenido en el resultado.

Los archivos TXT se procesan únicamente desde el entorno privado. No existe una pantalla pública de importación.

## Recitación semanal

Las recitaciones publicadas se leen desde `weekly_recitations`. La navegación principal las expone en `/recitacion` y muestra la correspondiente a la semana actual según `America/Monterrey`.

## GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` ejecuta el build estático y publica el contenido de `out/` después de cada push a `main` o `master`. La URL y la clave publicable llegan mediante variables del repositorio; la clave secreta no participa en el build.
