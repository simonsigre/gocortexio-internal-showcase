import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
    <html>
      <head><title>GoCortex API Server</title></head>
      <body style="font-family: system-ui; padding: 2rem;">
        <h1>GoCortex API Server</h1>
        <p>This is the backend API server running on port ${port}.</p>
        <p>To view the web application, visit: <a href="http://localhost:5173">http://localhost:5173</a></p>
        <p><em>(Make sure you are running 'npm run dev:client' in another terminal)</em></p>
      </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
