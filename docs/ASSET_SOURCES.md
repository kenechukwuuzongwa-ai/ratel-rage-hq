# Ratel Rage website image provenance

These files are optimized exports from the adjacent game project. Run
`scripts/export_media.py` to regenerate them. Originals were not modified.

| Website file | Source | Treatment |
| --- | --- | --- |
| `logo.svg` | `RAGE OF RATELS/frontend/ui/ratel-logo.svg` | Copied official tight logo used by the game front end. |
| `logo.webp` | `RAGE OF RATELS/frontend/ui/ratel-logo-title.png` | Trimmed transparent logo; resized. |
| `hero.webp`, `story.webp` | `RAGE OF RATELS/frontend/darki-story.png` | Resized front-end story art. Promotional art, not a gameplay screenshot. |
| `darki.webp` | `RAGE OF RATELS/sprites/darki-idle.png` + `.json` | Frame 0, alpha trimmed. |
| `ginger.webp` | `RAGE OF RATELS/sprites/enemy-ginger.png` + `.json` | Frame 5, alpha trimmed. Ginger is an enemy, not a playable fighter. |
| `olodo.webp` | `RAGE OF RATELS/sprites/boss-olodo-emote.png` + `.json` | Frame 0, alpha trimmed. |
| `agbero.webp` | `RAGE OF RATELS/sprites/senior-agbero.png` + `.json` | Frame 4, alpha trimmed. |
| `street.webp` | `RAGE OF RATELS/layers/level-sky.png`, `level-background.png`, `level-main.png`, `level-vehicles.png` | Composited aligned Level 1 layers, x=0 to 2000. |
| `world.webp` | Same Level 1 layers | Composited aligned Level 1 layers, x=3200 to 5200. |
| `boss.webp` | `RAGE OF RATELS/frontend/olodo-dossier.jpg` | Resized in-game front-end dossier art. |

`street.webp` and `world.webp` show actual authored level art. The selected
regions avoid the later parts of the level that carry specific political wall
portraits and slogans. A menu screenshot was not exported because the available
UI sample image was a design mockup, not a verified live game capture.
