export type ReleaseCard = { id: string; number: string; platform: string; name: string; title: [string,string]; description: string; version: string; size: string; releaseDate: string; status: string; href?: string };

export function getReleaseCards(): ReleaseCard[] {
  const publicUrl = process.env.PUBLIC_GAME_URL?.startsWith("https://") ? process.env.PUBLIC_GAME_URL : undefined;
  const localUrl = process.env.NODE_ENV === "development" ? process.env.GAME_PREVIEW_URL : undefined;
  const browserUrl = publicUrl || localUrl;
  return [
    { id: "browser", number: "01", platform: "DESKTOP BROWSER", name: "Browser prototype", title: ["BROWSER","PROTOTYPE."], description: "Level 01: The Street Tax. Keyboard and mouse controls. No account required.", version: "Development prototype", size: "Runs in browser", releaseDate: "Not publicly released", status: browserUrl ? (publicUrl ? "Available" : "Available locally") : "Distribution pending", href: browserUrl },
    { id: "android", number: "02", platform: "ANDROID", name: "Mobile playtest", title: ["MOBILE","PLAYTEST."], description: "An offline Android debug APK exists, with a customizable touch HUD. Phone validation and release signing are still pending.", version: "Debug / investor demo", size: "176.4 MiB", releaseDate: "Not publicly released", status: "In validation" },
  ];
}
