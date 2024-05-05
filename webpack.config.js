import { fileURLToPath } from 'url';
let output_path = fileURLToPath(new URL("./example/dist", import.meta.url));
export default {
  entry: './example/index.js',
  output: {
    path: output_path,
    filename: 'index.bundle.js',
  },
};