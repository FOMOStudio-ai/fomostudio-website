import {isOwner} from './_middleware.js';
export async function onRequest({request,env}){
 if(request.method!=='GET')return new Response(null,{status:405});
 const canEdit=await isOwner(request,env);
 return Response.json({canEdit,authenticated:canEdit,accessConfigured:!!(env.ACCESS_TEAM_DOMAIN&&env.ACCESS_AUD&&env.OWNER_EMAIL),storageReady:canEdit?!!env.FOMO_STORE:false},{headers:{'Cache-Control':'no-store'}});
}
