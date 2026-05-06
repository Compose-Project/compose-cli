import { exec } from 'node:child_process';

import ora from 'ora';

let procIds = 0;

export function execCmd(cmd: string, cwd?: string, pipe: boolean = true, spinnerMsg?: string) {
    return new Promise((resolve, reject) => {
        const proc = exec(cmd, { cwd });

        if (pipe) {
            proc.stdout?.pipe(process.stdout);
            proc.stderr?.pipe(process.stderr);

            proc.on('close', code => {
                if (code === 0) resolve(null);
                else reject(new Error(`Command "${cmd}" exited with code ${code}`));
            });
        } else {
            const msg = spinnerMsg || `Running proc: ${procIds++}`;
            const spinner = ora(msg).start();

            proc.on('close', code => {
                spinner.stop();

                if (code === 0) resolve(null);
                else reject(new Error(`Command "${cmd}" exited with code ${code}`));
            });
        }
    });
}
