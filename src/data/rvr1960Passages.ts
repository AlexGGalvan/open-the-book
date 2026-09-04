import type { BiblePassage } from "@/types/bible";

export const RVR1960_TRANSLATION = "Reina-Valera 1960";
export const RVR1960_COPYRIGHT_NOTICE =
  "El texto bíblico ha sido tomado de la versión Reina-Valera (RVR1960) © 1960 Sociedades Bíblicas en América Latina; © renovado 1988 Sociedades Bíblicas Unidas. Utilizado con permiso.";

const rvr1960PassagesByReference: Record<string, BiblePassage> = {
  "1 Corintios 9:16-27": {
    reference: "1 Corintios 9:16-27",
    translation: RVR1960_TRANSLATION,
    copyrightNotice: RVR1960_COPYRIGHT_NOTICE,
    text: `16 Pues si anuncio el evangelio, no tengo por qué gloriarme; porque me es impuesta necesidad; y ¡ay de mí si no anunciare el evangelio!
17 Por lo cual, si lo hago de buena voluntad, recompensa tendré; pero si de mala voluntad, la comisión me ha sido encomendada.
18 ¿Cuál, pues, es mi galardón? Que predicando el evangelio, presente gratuitamente el evangelio de Cristo, para no abusar de mi derecho en el evangelio.
19 Por lo cual, siendo libre de todos, me he hecho siervo de todos para ganar a mayor número.
20 Me he hecho a los judíos como judío, para ganar a los judíos; a los que están sujetos a la ley (aunque yo no esté sujeto a la ley) como sujeto a la ley, para ganar a los que están sujetos a la ley;
21 a los que están sin ley, como si yo estuviera sin ley (no estando yo sin ley de Dios, sino bajo la ley de Cristo), para ganar a los que están sin ley.
22 Me he hecho débil a los débiles, para ganar a los débiles; a todos me he hecho de todo, para que de todos modos salve a algunos.
23 Y esto hago por causa del evangelio, para hacerme copartícipe de él.
24 ¿No sabéis que los que corren en el estadio, todos a la verdad corren, pero uno solo se lleva el premio? Corred de tal manera que lo obtengáis.
25 Todo aquel que lucha, de todo se abstiene; ellos, a la verdad, para recibir una corona corruptible, pero nosotros, una incorruptible.
26 Así que, yo de esta manera corro, no como a la ventura; de esta manera peleo, no como quien golpea el aire,
27 sino que golpeo mi cuerpo, y lo pongo en servidumbre, no sea que habiendo sido heraldo para otros, yo mismo venga a ser eliminado.`,
  },
  "Eclesiastés 11:9": {
    reference: "Eclesiastés 11:9",
    translation: RVR1960_TRANSLATION,
    copyrightNotice: RVR1960_COPYRIGHT_NOTICE,
    text: "Alégrate, joven, en tu juventud, y tome placer tu corazón en los días de tu adolescencia; y anda en los caminos de tu corazón y en la vista de tus ojos; pero sabe, que sobre todas estas cosas te juzgará Dios.",
  },
};

export function getRvr1960Passage(reference: string) {
  return rvr1960PassagesByReference[reference] ?? null;
}
