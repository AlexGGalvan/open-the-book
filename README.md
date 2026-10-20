# Iglesia de Torreón - Lectura diaria

Aplicación web pública para organizar el plan mensual de lectura bíblica, las reflexiones compartidas por los hermanos, el historial de participantes, materiales de apoyo y la recitación semanal.

La primera fase funciona con datos de ejemplo y exportación estática para GitHub Pages. El esquema de Supabase y el importador privado de WhatsApp quedan listos para la siguiente fase, sin conectar todavía una fuente de datos en vivo.

## Tecnología

- Next.js 16 con App Router
- TypeScript
- Tailwind CSS 4
- Supabase/PostgreSQL (esquema preparado)
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
SUPABASE_SERVICE_ROLE_KEY=...
```

La llave de servicio nunca debe llevar el prefijo `NEXT_PUBLIC_`, incluirse en el bundle del navegador ni guardarse en Git. El cliente de `src/server/supabase/admin.ts` importa `server-only` para impedir su uso accidental desde componentes públicos.

Las políticas RLS permiten leer únicamente:

- participantes activos;
- calendario y lecturas;
- reflexiones con estado `authorized`;
- recursos con `is_published = true`.

Las tablas de importación no tienen políticas ni permisos públicos. La aprobación y publicación deben realizarse con procesos privados de administración.

## Importación de WhatsApp

El procesador admite formatos comunes de exportación de Android y iPhone, incluyendo mensajes de varias líneas. Para inspeccionar un TXT sin publicar nada:

```bash
npm run import:whatsapp -- "C:\ruta\exportacion.txt"
```

La salida muestra únicamente un resumen y metadatos de revisión. No imprime el texto bíblico, la reflexión completa ni el contenido descartado.

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

La recitación existente se conserva en `src/components/WeeklyRecitationCard.tsx`. Para actualizarla, cambia únicamente el arreglo `recitations`; la navegación principal la expone en `/recitacion`.

## GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` ejecuta el build estático y publica el contenido de `out/` después de cada push a `main` o `master`.

La conexión de lectura en vivo con Supabase requerirá migrar el hosting a un entorno con servidor Next.js o consumir una API pública con acceso de solo lectura. La fase actual no expone credenciales para conservar la seguridad del proyecto.
