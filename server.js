import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port must be dynamic for Render
const PORT = process.env.PORT || 10000;

// Serve the 'dist' folder created by 'vite build'
app.use(express.static(path.join(__dirname, 'dist')));

// Start listener on 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});