### DISCLAIMER / WARNING

> *Self-botting is against the Terms of Service of Discord and many other applications. Using this software may result in your account being banned or other penalties. Use this code at your own risk. The authors of this software are not responsible for any misuse or damage caused by this software.*

# Self-Bot Server

## Overview

This self-bot server is designed to run AFK sessions, register users, and manage session starts. It communicates with a client (to be developed in another repository) to execute commands. Users can program their own patterns and behaviors and add them to the `behaviour` folder.

## Features

- Register users
- Start and manage AFK sessions
- Send commands to a client
- Customizable patterns and behaviors

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm (v10 or higher)
- A Postgresql database
- A Ntfy server

Tutorials will be added in order to create this stuff

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/self-bot-server.git
    cd self-bot-server
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Install development dependencies:
    ```sh
    npm install --only=dev
    ```

### Running the Server

1. Compile the TypeScript files:
    ```sh
    npm run build
    ```

2. Start the server:
    ```sh
    npm start
    ```

### Customizing Behaviors

To add custom patterns and behaviors, create a new file in the `behaviour` folder and define your logic. The server will automatically pick up new behaviors.

## Contributing

Feel free to fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.
