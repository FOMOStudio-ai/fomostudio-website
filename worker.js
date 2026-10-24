export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. API Routes
    if (path === "/api/me") {
      return new Response(JSON.stringify({ authenticated: true, user: "admin" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (path === "/api/content") {
      if (request.method === "GET") {
        const data = await env.FOMO_STORE?.get("site_content");
        return new Response(
          data || JSON.stringify({ heroText: "FØMØ Studio", projects: [] }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (request.method === "POST") {
        const payload = await request.json().catch(() => ({}));
        if (env.FOMO_STORE) {
          await env.FOMO_STORE.put("site_content", JSON.stringify(payload));
        }
        return new Response(JSON.stringify({ success: true, updated: payload }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    if (path === "/api/upload" && request.method === "POST") {
      const { title } = await request.json().catch(() => ({}));
      if (env.BUNNY_LIBRARY_ID && env.BUNNY_API_KEY) {
        const bunnyRes = await fetch(
          `https://video.bunnycdn.com/library/${env.BUNNY_LIBRARY_ID}/videos`,
          {
            method: "POST",
            headers: {
              "AccessKey": env.BUNNY_API_KEY,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: title || "New Portfolio Video" })
          }
        );
        const videoData = await bunnyRes.json();
        return new Response(
          JSON.stringify({
            videoId: videoData.guid,
            libraryId: env.BUNNY_LIBRARY_ID,
            uploadUrl: `https://video.bunnycdn.com/library/${env.BUNNY_LIBRARY_ID}/videos/${videoData.guid}`,
            apiKey: env.BUNNY_API_KEY,
            pullZone: env.BUNNY_PULL_ZONE
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ success: true, message: "Upload handler ready" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Static Asset Fetching with SPA Fallback to index.html
    try {
      // First attempt to fetch exact static asset requested
      const response = await env.ASSETS.fetch(request);
      if (response.status !== 404) {
        return response;
      }
    } catch (e) {
      // Ignore initial asset fetch error
    }

    // For frontend SPA paths like /admin, serve index.html fallback
    try {
      const indexRequest = new Request(new URL("/index.html", request.url), request);
      return await env.ASSETS.fetch(indexRequest);
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  }
};
