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
    
    const result = solution(lines);
    
    console.log(String(result));
  } catch (error) {
    console.error(error);
    process.exit(2);
  }
});