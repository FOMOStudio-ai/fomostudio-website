export async function onRequest(context) {
  const { request, env } = context;

  // GET: Fetch current website text & project metadata
  if (request.method === "GET") {
    const data = await env.FOMO_STORE?.get("site_content");
    return new Response(
      data || JSON.stringify({ heroText: "FØMØ Studio", projects: [] }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // POST: Update website text and publish live
  if (request.method === "POST") {
    const payload = await request.json();
    if (env.FOMO_STORE) {
      await env.FOMO_STORE.put("site_content", JSON.stringify(payload));
    }

    return new Response(JSON.stringify({ success: true, updated: payload }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
}
