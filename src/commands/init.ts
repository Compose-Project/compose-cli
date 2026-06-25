import { existsSync } from 'node:fs';
import { appendFile, copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import cliProgress from 'cli-progress';
import { Command } from 'commander';
import { glob } from 'glob';

import { execCmd } from '../utils/exec-cmd.js';
import { askQuestion } from '../utils/question.js';

const cmd = new Command()
    .command('init')
    .description('Initialize a new Compose project in the current directory.')
    .option('--name <name>', 'Specify the name of the project')
    .action(async () => {
        console.log('Initializing a new Compose project...'.cyan);

        // Step 1/5 : Get the project details
        let { name } = cmd.opts();
        if (!name) {
            // Ask the user for the project name if not provided
            try {
                name = await askQuestion('Enter the name of the project: ');
            } catch (err) {
                console.error('Error reading input:', err);
                process.exit(1);
            }
        }

        // Check if the project name is valid
        if (!name || name.trim() === '') {
            console.error('Project name cannot be empty.');
            process.exit(1);
        }

        const projectDir = join(process.cwd(), name);
        if (existsSync(projectDir)) {
            console.error(
                `A directory named "${name}" already exists. Please choose a different name.`,
            );
            process.exit(1);
        }

        // Step 2/5 : Create the project directory
        try {
            await mkdir(projectDir);

            // Then copy the template files
            // TODO: enhance the template system
            const templateDir = join(import.meta.dirname, '../../assets/templates/blank');
            // const files = await glob(['**/*', '**/.*'], { cwd: templateDir, nodir: true });

            // include all files, all hiden files (.*) and all subdirectories (hidden or not)
            const files = await glob('**/*', {
                cwd: templateDir,
                dot: true,
                nodir: true,
            });

            const progressBar = new cliProgress.SingleBar({
                format: 'Copying template files... {bar} {percentage}% | {value}/{total} files',
            }, cliProgress.Presets.shades_classic);

            progressBar.start(files.length, 0);

            await Promise.all(
                files.map(async file => {
                    const src = join(templateDir, file);
                    const dest = join(projectDir, file);

                    await mkdir(join(dest, '..'), { recursive: true });
                    await copyFile(src, dest);

                    progressBar.increment();
                }),
            );

            progressBar.stop();
        } catch (err) {
            console.error('Error creating project directory:', err);
            process.exit(1);
        }

        // Step 3/5 : run install and bootstrap command
        await execCmd('pnpm install', projectDir, false, "Installing dependencies...");
        await execCmd('pnpm bootstrap', projectDir, false, "Bootstrapping project...");

        // Step 4/5 : Generate a random COMPOSE_INTERNAL_SECRET and add it to the .env file
        try {
            const crypto = await import('node:crypto');
            const secret = crypto.randomBytes(32).toString('hex');
            const envPath = join(projectDir, '.env');

            await appendFile(envPath, `\nCOMPOSE_INTERNAL_SECRET=${secret}\n`);
        } catch (err) {
            console.error('Error generating COMPOSE_INTERNAL_SECRET in .env:', err);
        }

        // Step 5/5 : if Git is available, initialize a new Git repository
        try {
            await execCmd('git init && git add .', projectDir);
            await execCmd('git commit -m "core(init): Initial commit"', projectDir);
        } catch {}

        // Final message
        console.clear();

        console.log('Project initialized successfully!'.green);
        console.log(`\nNext steps:`);
        console.log(`  1. cd ${name}`);
        console.log(`  2. pnpm dev`);
    });

export default cmd;
