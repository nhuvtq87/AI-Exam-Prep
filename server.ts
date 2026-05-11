import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  
  // CRITICAL: Port must be 3000 for the AI Studio environment
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API routes go here
  app.get('/api/status', (req, res) => {
    res.json({ 
      status: "Spartan AI is online",
      environment: process.env.NODE_ENV || 'development',
      campus: "San Jose State University",
      version: "1.2.0"
    });
  });

  // SJSU Academic Resources Endpoint
  app.get('/api/resources', (req, res) => {
    res.json({
      links: [
        { name: "SJSU King Library", url: "https://library.sjsu.edu/", description: "Research databases and academic journals." },
        { name: "SJSU Writing Center", url: "https://www.sjsu.edu/writingcenter/", description: "Help with academic writing and citations." },
        { name: "SJSU Peer Connections", url: "https://www.sjsu.edu/peerconnections/", description: "Tutoring and mentoring services." },
        { name: "SJSU Canvas", url: "https://sjsu.instructure.com/", description: "Official SJSU learning management system." },
        { name: "Spartan Study Room Booking", url: "https://sjsu.libcal.com/", description: "Book study spaces in the King Library." }
      ]
    });
  });

  // Placeholder for Study Analytics (Front-end currently handles state)
  app.get('/api/analytics/summary', (req, res) => {
    res.json({
      message: "Analytics are currently stored locally. Connect Firestore for cloud syncing.",
      features: ["Flashcard Mastery", "Quiz Performance", "Study Duration", "Topic Concentration"]
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    // Development mode: Use Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve static files and handle SPA routing
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
