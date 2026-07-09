/// <reference types="node" />
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const lines: string[] = [];

rl.on('line', (line: string) => lines.push(line));

rl.on('close', async () => {
  try {
    const modulePath = './solution.js';
    const { solution } = await import(modulePath);
    
    // Fix: We must await the solution in case it is an async function.
    // This ensures we get the actual value, not a Promise object,
    // and that any async errors are caught by the try/catch block.
    const result = await solution(lines);
    
    console.log(String(result));
  } catch (error) {
    // Crucial for mapping runtime errors later
    console.error(error);
    process.exit(2);
  }
});