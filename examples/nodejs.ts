import lz from 'lz-string'

const wrtc = require('wrtc')
const readline = require('readline')

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, (ans: string) => {
      rl.close();
      resolve(ans);
  }))
}

export { lz, wrtc, askQuestion }
