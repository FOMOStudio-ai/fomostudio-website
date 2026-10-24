export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

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
