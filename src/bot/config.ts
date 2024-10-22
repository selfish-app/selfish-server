import 'dotenv/config'


// This is called ownersId bcz I used an alt for testing, for now is just one ID
export const ownersId = [Deno.env.get("OWNER_ID")!];
export const prefix = "!";
export const logChannelId = Deno.env.get("LOG_CHANNEL_ID")!