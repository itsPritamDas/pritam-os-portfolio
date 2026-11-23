# LinkedIn preview fix — Pritam OS

The existing Vite entry HTML contained a page title and description, but it did not contain the Open Graph properties LinkedIn reads. The project now has those tags in the root `index.html`, so they are present in the first HTML response and do not depend on React running.

## Files changed

- `index.html` — added canonical URL, Open Graph metadata, image metadata and large-card metadata for social platforms.
- `public/pritam-os-preview.png` — created a branded 1200 × 627 PNG preview image (under 5 MB).
- `dist/index.html` and `dist/pritam-os-preview.png` — updated the included production output so it can also be inspected or deployed as-is.

No React components, styles, profile data, animations or app interactions were changed.

## Rebuild on Windows PowerShell

Open PowerShell in the project folder (the folder containing `package.json`) and run:

```powershell
npm install
npm run build
```

For a local production preview, run:

```powershell
npm run preview
```

Open the local address printed by Vite. Stop the preview server with `Ctrl + C` when finished.

After the build, these files should exist:

```text
dist/index.html
dist/pritam-os-preview.png
dist/assets/...
```

The Vite build copies files from `public/` into `dist/` automatically. Deploy the **contents of the updated `dist` folder** to the same Cloudflare Worker/static-assets deployment you already use. Do not upload only `src/` or only the root `index.html`.

## Verify the deployed files

After redeploying, open both of these URLs in a normal browser:

- `https://pritam-os-portfolio.iampritamdas04.workers.dev/`
- `https://pritam-os-portfolio.iampritamdas04.workers.dev/pritam-os-preview.png`

The first must show the live portfolio, and the second must display the PNG image directly. The image should be publicly reachable without signing in.

Then open [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/), enter `https://pritam-os-portfolio.iampritamdas04.workers.dev/`, and select **Inspect**. Check that LinkedIn detects the title, description and preview image. Inspecting the URL refreshes LinkedIn's cached preview for future shares.

If Post Inspector still reports that it cannot fetch the page or image, inspect the error before changing the app. At that point check the Cloudflare Worker security/WAF rules and make sure LinkedIn's crawler is not being challenged or blocked. The source archive did not contain Cloudflare security settings, so those cannot be changed from this project.

## Important

The preview image URL and canonical URL are intentionally set to the current `workers.dev` address. If you later move to a custom domain, update `og:url`, `link rel="canonical"`, `og:image`, `og:image:secure_url` and `twitter:image` in `index.html` to the new public origin, then rebuild and redeploy.
