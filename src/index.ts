import 'dotenv/config'
import { Bot } from './bot/utils/classes/Bot.ts';
import 'colors';

// Determine which token to use based on command-line arguments
const args = Deno.args;
const isTesting = args.includes('--test');
const token = isTesting ? Deno.env.get("TESTING_TOKEN") : Deno.env.get("BOT_TOKEN")

// Create a new client instance
const client = Bot.getBaseInstance();
import * as loaders from './bot/loaders/index.ts';


(async () => {
    await loaders.loadCommands(client);
    await loaders.loadEvents(client);
    await loaders.loadTriggers(client);
})();

try {
    // Log in to Discord with your client's token
    client.login(token);
} catch (err) {
    console.error("Failed to log into the bot".red);
    console.error("Received token: ", token?.blue);
    console.error(err);
}
