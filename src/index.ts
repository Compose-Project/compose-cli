#!/usr/bin/env node

import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { program } from 'commander';

import 'colors';

import * as constants from './constants.js';

// Initialize the CLI by determining the directory of the current file and the commands directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const commandsDir = join(__dirname, 'commands');

// Set up the CLI program with its name, version, and description
program
    .name(constants.CLI_NAME)
    .version(constants.CLI_VERSION)
    .description('A CLI tool for managing your Compose projects.');

// Import and register the commands from the 'commands' directory
const files = await readdir(commandsDir);
const commandFiles = files.filter(f => /\.(js|ts)$/.test(f) && !f.endsWith('.d.ts'));

const commands = await Promise.all(
    commandFiles.map(file =>
        import(pathToFileURL(join(commandsDir, file)).href)
    )
);

for (const cmdModule of commands) {
    if (cmdModule.default) {
        program.addCommand(cmdModule.default);
    }

    // Ignore any modules that do not have a default export, as they are not valid commands
}

// Parse the command-line arguments and execute the appropriate command
// If no command is provided, display the help message
console.clear();

const cmd = program.parse();
if (!cmd.args.length) program.help();
