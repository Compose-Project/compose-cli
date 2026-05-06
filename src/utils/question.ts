import { createInterface } from 'readline';

export function askQuestion(question: string, timeout: number = 10e3): Promise<string> {
    const ac = new AbortController();
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const { signal } = ac;

    return new Promise((resolve, reject) => {
        rl.question(question, { signal }, answer => {
            rl.close();
            resolve(answer);
        });

        signal.addEventListener('abort', () => {
            rl.close();
            reject(new Error('Question timed out'));
        });

        setTimeout(() => ac.abort(), timeout);
    });
}
