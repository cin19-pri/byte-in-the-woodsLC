import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/game/Game";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Byte in the Woods — En Busca del Código Perdido" },
    { name: "description", content: "Acompaña a Ada en una aventura de plataformas por dos bosques mágicos. Resuelve retos de programación y recupera los fragmentos del código perdido." },
    { property: "og:title", content: "Byte in the Woods — La aventura de Ada" },
    { property: "og:description", content: "Explora, salta y descubre la magia de la programación en el bosque encantado." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Game,
});
