# Consortium repo: notes for Claude

JS/CSS for the Consortium Webflow site (`fwd-consortium.webflow.io`, Webflow site ID `6ae3477020ce21cac01b48a7`), served from jsDelivr at a **pinned commit**. See README.md → "Pinned commit (Webflow)" for the full picture.

## Rule: re-pin Webflow after every commit to `main`

Every time a commit lands on `main` (merges and docs-only commits included), update every pinned hash in Webflow to that commit's **full** hash (`git rev-parse HEAD`, never the short one, never a branch name like `@main`). All five places, every time:

1. Site custom code, head: `cdnHref` (`css/styles.css`)
2. Site custom code, footer: `cdnSrc` (`js/script-loader.js`)
3. Home page hero loop video embed (`.video-loop_embed`): both mp4 `<source>`s and both poster images
4. Home page scroll video embed (`.video_embed`): both mp4 `<source>`s and both poster images
5. Home page `.video_background_container_outer`: attribute `data-frame-base` (`video/frames`)

Steps:

- After pushing to `main`, if the push touched `js/` or `css/`, wait for the README bot's `docs: auto-update README features [skip readme]` commit (`gh run list --workflow update-readme.yml`), then `git pull`. Pin `main`'s HEAD after that.
- Before saving the new hash, warm every file the site loads at it on jsDelivr and retry 403s until all return 200 (`curl -s -f --retry 8 --retry-delay 65 --retry-all-errors`): CSS (`styles`, `menu`, `faqs`, `process`, `services`), every module in `js/script-loader.js` plus `js/services-hero-pattern.js`, the 4 mp4s and 2 posters above, and `video/frames/frame-0001.webp` … `frame-0427.webp`. The repo is over jsDelivr's 50 MB package limit, so first fetches at a new commit randomly fail with "Package size exceeded"; retries succeed and are then cached for a year.
- Never put the current hash in a committed file: committing it creates a newer commit that would need pinning again.
- Don't publish the site unless the user says so: pinning saves drafts; publishing makes them (and anything else staged in Webflow) live.
- Tell the user the new hash and what was updated.

How, with the Webflow MCP:

| Place | Tool / action | Target |
|---|---|---|
| 1, 2 | `data_scripts_tool` → `get_site_freeform_code` / `set_site_freeform_code` (`head`, `footer`) | site `6ae3477020ce21cac01b48a7` |
| 3 | `data_element_settings_tool` → `get_settings` / `set_settings`, key `code` | page `6ae3477020ce21cac01b4878`, element `1c48deab-df70-492b-2ff5-bb2d4ca45bdf` |
| 4 | `data_element_settings_tool` → `get_settings` / `set_settings`, key `code` | page `6ae3477020ce21cac01b4878`, element `7cabafad-b3e9-de2b-08e3-cc5ca84cee54` |
| 5 | `data_element_tool` → `set_attributes`, `data-frame-base` | page `6ae3477020ce21cac01b4878`, element `d189927d-69f8-c6af-a448-ade23c074468` |

Read each block first and replace only the hash; leave everything else as it is. If an element ID no longer resolves, find it again by class (`video-loop_embed`, `video_embed`, `video_background_container_outer`). After publishing, check no `Consortium@` URL on the live home page uses anything but the new hash: `curl -s https://fwd-consortium.webflow.io/ | grep -o 'Consortium@[^/]*' | sort | uniq -c`.

## Branches

Work happens on feature branches (e.g. `services`), then gets merged into `main`. Bring the branch up to date with `main` before committing to it.

## Testing locally

`?dev=true` on any page loads the repo from VS Code Live Server at `http://127.0.0.1:5500` (needs Live Server CORS on and Chrome's local network permission). See README.md → "Testing locally".
