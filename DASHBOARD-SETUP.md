# FOMO Studio editor

Open /admin/ to manage page copy, contact information, video titles, categories, order, aspect ratios, and the burgundy background. Save draft stores content in the current browser. Preview opens the actual website in a same-origin iframe, with a 375px phone view. Publish writes to Cloudflare KV. Content backups include text and video IDs, not video bytes.

Upload or download videos using the linked Bunny library. Paste a video's share link into a card to add or replace it. This editor never deletes a Bunny video or returns a Bunny API key. All seven current videos are included in defaults.json; the complete static homepage remains available if the content API is unavailable.

## Cloudflare configuration

1. In the existing Pages project, bind a KV namespace as FOMO_STORE for Production. Preserve any existing binding and records. Redeploy after adding a binding.
2. In Cloudflare Zero Trust, create a self-hosted Access application for the site's canonical hostname and path /admin/login (include /admin/login.html if that URL is used). Allow only the owner's verified sign-in email. Use an email one-time code or the owner's existing identity provider. Do not protect the public homepage or public GET /api/content. The /admin/ editor is a public shell with no privileged data; API writes independently verify the signed Access token.
3. Set Production variables ACCESS_TEAM_DOMAIN to https://TEAM.cloudflareaccess.com, ACCESS_AUD to that application's audience, and OWNER_EMAIL to the exact owner sign-in email. These are configuration values; do not put API keys in source. Redeploy.
4. Open /admin/ on that same canonical hostname, click Sign in to publish, and complete Access. The login page redirects to /admin/; the dashboard enables Publish only after /api/me verifies the owner and the storage binding.
5. Preview a draft and publish an intentional text update. Verify the public page after KV propagation. KV is eventually consistent and is intended for a single-owner editor; don't publish concurrently from multiple browser tabs or devices. The revision check detects observed stale versions but is not an atomic lock.

A legacy site_content record is never silently overwritten. If the dashboard reports migration is needed, export and inspect that record before converting it into the version-1 schema.

The website fetches saved content with no-store and keeps the static default homepage as its fallback. Updates may take up to a minute to propagate between Cloudflare regions. The repo's static defaults should be refreshed periodically from an exported published backup if you want the fallback to match newer edits.

## Validation

Run npm test. Tests cover the content schema, unsafe input rejection, publish/readback, stale revisions, missing storage, legacy preservation, denied unauthenticated writes and removal of the old API-key-returning upload handler. Browser verification covers draft loading and preview. Full owner sign-in and live publishing require the Cloudflare configuration above.
