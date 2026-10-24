export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "GET") {
    const data = await env.FOMO_STORE?.get("site_content");
    return new Response(
      data || JSON.stringify({ heroText: "FØMØ Studio", projects: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  if (request.method === "POST") {
    const payload = await request.json().catch(() => ({}));
    if (!env.FOMO_STORE) return Response.json({error: "Content storage is not configured"}, {status:503});
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
