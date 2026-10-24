export async function onRequest(context) {
  return new Response(JSON.stringify({ authenticated: true, user: "admin" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
