import 'dotenv/config'
import { Bot } from './bot/utils/classes/Bot';
import 'colors';

// Determine which token to use based on command-line arguments
const args = process.argv.slice(2);
const isTesting = args.includes('--test');
const token = isTesting ? process.env.TESTING_TOKEN : process.env.BOT_TOKEN;

// Create a new client instance
const client = Bot.getBaseInstance();

import * as loaders from './bot/loaders/index';

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
