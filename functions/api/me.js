export async function onRequest() { return Response.json({authenticated:true, canEdit:true}, {headers:{'Cache-Control':'no-store'}}); }
