# Deployment repair

This repository uses Cloudflare Pages with Pages Functions. Publish the repository root; no build step is required for these static files. Keep the functions directory at the repository root. Deploying only static assets does not run these API handlers.

The original wordmark, round footer logo and favicon are restored. Local assets use root-relative paths. The homepage fallback and forced HTML content type have been removed so missing assets no longer masquerade as HTML. Two existing Bunny embeds are preserved. A small public script enables filters without overwriting videos with placeholder projects.

The existing /admin page is a duplicate homepage, not a functioning dashboard. This repair does not claim to restore a complete editor. Do not use the old unconditional authentication endpoint.

API writes and /api/me now verify a Cloudflare Access RS256 token. Set ACCESS_TEAM_DOMAIN (https://your-team.cloudflareaccess.com), ACCESS_AUD (application audience) and OWNER_EMAIL to your owner sign-in email. Configure Access on /admin and /api/* with a public GET /api/content exception if needed. FOMO_STORE is the existing KV content binding. The code denies writes when owner verification is missing; it does not silently save when KV is absent.

The pre-existing upload handler uses Bunny server credentials and returns its key to the verified owner. Replace this with a signed upload flow before enabling uploads for anyone else. If the prior endpoint was publicly deployed with a BUNNY_API_KEY, rotate that key in Bunny and update Cloudflare's secret.

Verify Cloudflare's production deployment against the repaired commit, check /wordmark.svg and /logo.svg return image/svg+xml, /app.js returns JavaScript, and an unknown asset returns 404. Check desktop and phone layouts. This repair has not changed domain, DNS, email records or video hosting.
