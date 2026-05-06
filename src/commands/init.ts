import { existsSync } from 'node:fs';
import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import cliProgress from 'cli-progress';
import { Command } from 'commander';
import { glob } from 'glob';
import ora from 'ora';

import { execCmd } from '../utils/exec-cmd.js';
import { askQuestion } from '../utils/question.js';

const cmd = new Command()
    .command('init')
    .description('Initialize a new Compose project in the current directory.')
    .option('--name <name>', 'Specify the name of the project')
    .action(async () => {
        console.log('Initializing a new Compose project...'.cyan);

        // Step 1/3 : Get the project details
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

        // Step 2/3 : Create the project directory
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

        // Step 3/3 : run install and bootstrap command
        await execCmd('pnpm install', projectDir, false);
        await execCmd('pnpm bootstrap', projectDir);

        // Final message
        console.clear();

        console.log('Project initialized successfully!'.green);
        console.log(`\nNext steps:`);
        console.log(`  1. cd ${name}`);
        console.log(`  2. pnpm dev`);
    });

export default cmd;
