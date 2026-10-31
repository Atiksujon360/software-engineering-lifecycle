const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

async function bootstrap() {
  if (!isProd) {
    // In development, use Vite dev server directly (configured in vite.config.ts)
    const { createServer } = await import('vite');
    const vite = await createServer();
    await vite.listen(PORT);
    console.log(`Frontend Vite dev server running on port ${PORT}`);
  } else {
    // In production, serve static files
    const fs = await import('node:fs');
    const path = await import('node:path');
    const express = await import('express');
    const { createServerApp } = await import('./server/index');

    const app = createServerApp();
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Engineering Lifecycle Playbook server running on port ${PORT} [production]`);
    });
  }
}

bootstrap().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
