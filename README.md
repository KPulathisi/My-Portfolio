# Kavinda Pulathisi — Portfolio

Static site (no build step): HTML + CSS + JS with GSAP/ScrollTrigger, Lenis smooth scroll and a live WebGL shader hero (drag the core, click to send a pulse). All libraries are bundled in `assets/vendor`, so it also works when you open `index.html` straight from your computer.

## Deploy free on GitHub Pages

Repo: **https://github.com/KPulathisi/My-Portfolio** → site: **https://kpulathisi.github.io/My-Portfolio/**

1. Upload this folder's contents (not the folder itself) to the repo:
   - **Easy way:** open the repo on GitHub → **"uploading an existing file"** → drag in everything in this folder → **Commit changes**.
   - **Git way** (run inside this folder):
     ```bash
     git init -b main
     git add .
     git commit -m "Portfolio"
     git remote add origin https://github.com/KPulathisi/My-Portfolio.git
     git push -u origin main
     ```
2. Repo **Settings → Pages → Build and deployment**: Source = **Deploy from a branch**, Branch = **main / (root)** → **Save**.
3. Wait 1–2 minutes, then open **https://kpulathisi.github.io/My-Portfolio/**.

Every later push to `main` updates the site automatically.

## Things to update

| What | Where |
|---|---|
| Project screenshots | Put files in `assets/projects/<project-id>/`, then list them in `projects.js` (`screenshots: [...]`) |
| Hero energy core (position, colours, effects) | `hero3d.js` — colours come from `--c1/--c2/--c3` in `style.css` |
| Add / remove / reorder projects | `projects.js` (`PROJECTS` = big cards, `MORE_PROJECTS` = contributions list) |
| Journey (jobs & education) | `index.html` → the `JOURNEY` section |
| CV file | Replace `assets/Kavinda_Pulathisi_CV.pdf` (keep the same name) |
| Use a Spline 3D scene instead of the shader hero | `hero3d.js` → set `SPLINE_SCENE` to your Spline `.splinecode` URL |
| Photos | `assets/img/` |

Tip: export screenshots as `.webp` (~1600px wide).
