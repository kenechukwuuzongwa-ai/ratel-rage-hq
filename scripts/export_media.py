"""Export small, source-derived website images from the adjacent game project.

Run with the bundled Python runtime (Pillow required). This script only writes
WEB/public/media; the game sources remain untouched.
"""

from pathlib import Path
import json
import shutil

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
GAME = ROOT / "RAGE OF RATELS"
OUT = Path(__file__).resolve().parents[1] / "public" / "media"
OUT.mkdir(parents=True, exist_ok=True)


def save_webp(image: Image.Image, name: str, quality: int = 77):
    image.save(OUT / name, "WEBP", quality=quality, method=6)


def trim_alpha(image: Image.Image, padding: int = 10):
    image = image.convert("RGBA")
    bounds = image.getchannel("A").point(lambda a: 255 if a > 15 else 0).getbbox()
    if bounds is None:
        raise ValueError("image has no visible pixels")
    l, t, r, b = bounds
    return image.crop(
        (max(0, l - padding), max(0, t - padding), min(image.width, r + padding), min(image.height, b + padding))
    )


def sprite_frame(stem: str, index: int):
    path = GAME / "sprites" / f"{stem}.png"
    meta = json.loads(path.with_suffix(".json").read_text(encoding="utf-8"))
    fw, fh = meta["frameWidth"], meta["frameHeight"]
    cols = meta["sheet"]["cols"]
    x, y = (index % cols) * fw, (index // cols) * fh
    with Image.open(path) as sheet:
        frame = sheet.crop((x, y, x + fw, y + fh))
    return trim_alpha(frame)


def level_crop(x: int, width: int = 2000):
    names = ["level-sky.png", "level-background.png", "level-main.png", "level-vehicles.png"]
    canvas = Image.new("RGBA", (width, 1124), "#776b68")
    for name in names:
        with Image.open(GAME / "layers" / name) as layer:
            canvas.alpha_composite(layer.crop((x, 0, x + width, 1124)))
    return canvas.convert("RGB")


# The in-game transparent mark, rather than the opaque concept-sheet logo.
logo = trim_alpha(Image.open(GAME / "frontend" / "ui" / "ratel-logo-title.png"), padding=18)
logo.thumbnail((900, 600), Image.Resampling.LANCZOS)
save_webp(logo, "logo.webp", 88)
shutil.copyfile(GAME / "frontend" / "ui" / "ratel-logo.svg", OUT / "logo.svg")

# Single actual frames from the playable browser game's sprite sheets.
characters = {
    "darki.webp": ("darki-idle", 0, 800),
    "ginger.webp": ("enemy-ginger", 5, 670),
    "olodo.webp": ("boss-olodo-emote", 0, 650),
    "agbero.webp": ("senior-agbero", 4, 620),
}
for name, (stem, index, max_height) in characters.items():
    sprite = sprite_frame(stem, index)
    sprite.thumbnail((800, max_height), Image.Resampling.LANCZOS)
    save_webp(sprite, name, 82)

# Two real regions of the current Level 1 environment.
street = level_crop(0)
world = level_crop(3200)
save_webp(street.resize((1280, 719), Image.Resampling.LANCZOS), "street.webp", 76)
save_webp(world.resize((1280, 719), Image.Resampling.LANCZOS), "world.webp", 76)

# The in-game front end's existing Darki street scene is the hero. It avoids
# later level regions containing specific real-world political wall art.
with Image.open(GAME / "frontend" / "darki-story.png") as hero:
    save_webp(hero.resize((1600, 900), Image.Resampling.LANCZOS), "hero.webp", 78)

# Character story and boss imagery already used by the game's front end.
with Image.open(GAME / "frontend" / "darki-story.png") as story:
    save_webp(story.resize((1200, 676), Image.Resampling.LANCZOS), "story.webp", 75)
with Image.open(GAME / "frontend" / "olodo-dossier.jpg") as boss:
    boss.thumbnail((850, 850), Image.Resampling.LANCZOS)
    save_webp(boss.convert("RGB"), "boss.webp", 78)

print("\n".join(f"{p.name}: {p.stat().st_size // 1024} KB" for p in sorted(OUT.glob("*")) if p.is_file()))
