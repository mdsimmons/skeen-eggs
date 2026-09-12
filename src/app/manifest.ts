import type { MetadataRoute } from "next";
import { getSetting } from "@/lib/queries";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const logo = await getSetting("app_logo");

  return {
    name: "Skeen Eggs",
    short_name: "Skeen Eggs",
    description: "Inventory, invoicing & accounting for Skeen Eggs",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf7",
    theme_color: "#b45309",
    orientation: "any",
    icons: [
      {
        src: logo || "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: logo || "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
