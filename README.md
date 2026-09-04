# Daily Manna

Aplicación cristiana mobile-first con una palabra diaria y un pasaje semanal de memorización.

## Correr el proyecto

```bash
npm install
npm run dev
```

Abre `http://127.0.0.1:3000`.

## Validación

```bash
npm run lint
npm run typecheck
npm run build
```

Para validar el export estático usado por GitHub Pages:

```bash
$env:GITHUB_PAGES = "true"
npm run build
```

En macOS/Linux:

```bash
GITHUB_PAGES=true npm run build
```

## Today's Manna

Los datos demo viven en `src/data/manna.json`.

Cada registro puede usar:

```ts
type Manna = {
  id: string;
  date?: string;
  reference: string;
  text: string;
  title?: string;
  reflection?: string;
  translation?: string;
  isDemo?: boolean;
};
```

`src/services/mannaProvider.ts` contiene `getMannaForDate(date)` como fallback local y `getBibleHabitMannaForDate(date)` como provider remoto.

El provider remoto consulta:

```text
https://api--bible-habit-server--26zn8kx8mjzy.code.run/api/daily-manna/today
```

El APK confirma esta ruta dentro del módulo `everyday_manna`. La respuesta actual de Bible Habit trae la referencia diaria y textos desde `source: jbch`; si el texto llega en coreano, la web busca un override permitido en `src/data/rvr1960Passages.ts`. Si no existe override, solo usa la referencia y deja el texto pendiente hasta conectar una traducción bíblica autorizada.

RVR1960 tiene copyright. No se usa como una Biblia completa local; solo se incluyen citas puntuales con aviso de derechos.

Si existe un registro local con la fecha exacta, `getMannaForDate` lo usa. Si no existe, rota los datos demo de forma diaria desde `MANNA_CONFIG.anchorDate`.

Cuando exista una fuente real, cambia el provider para leer desde JSON completo, API, base de datos o contenido extraído de Bible Habit sin tocar los componentes visuales.

## Weekly Memorization

Las referencias cargadas viven en `src/data/memorizationVerses.json`. Actualmente solo incluye:

- el punto de calibración confirmado: `Eclesiastés 11:9`;
- las referencias de ejemplo proporcionadas para `Segunda venida`;
- las referencias de ejemplo proporcionadas para `Obediencia`.

No se agregaron referencias inventadas para completar las 244.

La configuración semanal está en `src/config/memorization.ts`:

```ts
export const MEMORIZATION_CONFIG = {
  anchorDate: "2026-08-31",
  anchorReference: "Eclesiastés 11:9",
  weekStartsOn: 1,
  timezone: "America/Monterrey",
  expectedTotalReferences: 244,
  showWeekCounter: false,
} as const;
```

La semana del 31 de agosto de 2026 al 6 de septiembre de 2026 queda sincronizada con `Eclesiastés 11:9`.

## Algoritmo provisional

Todavía no conocemos con certeza el algoritmo interno de Bible Habit. Sabemos que en el APK existen nombres como `MemorizationVerseRef`, `getVerseRefForWeekOffset()`, `memorization_start_offset`, `memorization_change_order`, `memorization_reset_order` y `memorization_topic`, pero no se debe asumir su comportamiento.

La implementación actual usa:

1. buscar `anchorReference` dentro de `memorizationVerses`;
2. calcular semanas transcurridas desde `anchorDate`;
3. aplicar módulo matemático seguro para soportar fechas anteriores;
4. devolver el elemento correspondiente.

Cuando tengamos las 244 referencias en el orden correcto, coloca la lista completa en `src/data/memorizationVerses.json`. El cálculo usará automáticamente el índice de `Eclesiastés 11:9` como `anchorIndex`.

## Cambiar la fecha base

Edita `anchorDate` en `src/config/memorization.ts`. Debe representar el inicio de la semana de calibración según `weekStartsOn`.

## Cambiar la zona horaria

Edita `timezone` en `src/config/memorization.ts`. El valor actual es `America/Monterrey`, pensado para Coahuila, México.

## Cambiar la traducción bíblica

La referencia y el texto están separados. Los textos actuales que existen en JSON están marcados con `translation`.

Para integrar traducciones en el futuro:

1. agrega el texto autorizado dentro del JSON; o
2. reemplaza `getBibleText(reference, translation)` en `src/services/memorizationProvider.ts` por una consulta a una API bíblica licenciada; o
3. crea un servicio dedicado, por ejemplo `src/services/bibleTextProvider.ts`.

No agregues una traducción completa sin confirmar licencia y permiso de uso.

## Cache y PWA

La app ya no registra un service worker ni guarda el estado actual en `localStorage`. Al abrirse, borra las claves antiguas del sitio y desregistra cualquier service worker previo para evitar que el celular conserve versiones viejas.

`public/sw.js` se conserva solo como limpiador de transición para usuarios que ya tenían una versión cacheada instalada.

Las llamadas a Bible Habit agregan un parámetro temporal de cache-bust para que un service worker antiguo no reutilice respuestas viejas de `daily-manna/today`.

## GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` exporta el sitio con Next.js y lo publica en GitHub Pages cuando se hace push a `main` o `master`.
