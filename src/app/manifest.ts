import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Revanta",
    short_name: "Revanta",
    description: "Gestiona tu negocio de reventa de segunda mano.",
    lang: "es",
    start_url: "/panel",
    display: "standalone",
    background_color: "#f9fbfa",
    theme_color: "#1fa37a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
