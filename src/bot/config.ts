import 'dotenv/config'


// This is called ownersId bcz I used an alt for testing, for now is just one ID
export const ownersId = [process.env.OWNER_ID!];
export const prefix = "!";
export const logChannelId = process.env.LOG_CHANNEL_ID!