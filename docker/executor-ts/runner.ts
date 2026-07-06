import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const lines: string[] = [];

rl.on('line', (line) => lines.push(line));

rl.on('close', async () => {
  try {
    const { solution } = await import('./solution.js');
    
    const result = solution(lines);
    
    console.log(String(result));
  } catch (error) {
    console.error(error);
    process.exit(2);
  }
});