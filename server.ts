import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory click tracking for analytics demonstration
  let affiliateClicks = 42;
  const clickLogs: Array<{ timestamp: string; tag: string; referrer: string }> = [];

  // 1. Product state endpoint
  app.get('/api/product', (req, res) => {
    res.json({
      success: true,
      product: {
        id: 'ergo-cushion-pro',
        asin: 'B08ERGOFOAM',
        name: 'ErgoRelief™ Ergonomic Memory Foam Seat Cushion',
        badge: "#1 Best Seller in Back & Lumbar Supports",
        rating: 4.8,
        totalReviews: 14280,
        price: 39.99,
        listPrice: 49.99,
        discountPercentage: 20,
        availability: 'In Stock',
        shipsFrom: 'Amazon',
        soldBy: 'ErgoRelief Official Store',
        primeEligible: true,
        fastestDelivery: 'Tomorrow, by 10:00 PM',
        defaultAffiliateUrl: 'https://www.amazon.com/dp/B08ERGOFOAM?tag=ergocushion-20',
      },
    });
  });

  // 2. Track affiliate click
  app.post('/api/track-click', (req, res) => {
    const { tag = 'ergocushion-20', referrer = 'landing_hero' } = req.body;
    affiliateClicks += 1;
    clickLogs.unshift({
      timestamp: new Date().toISOString(),
      tag,
      referrer,
    });
    if (clickLogs.length > 50) clickLogs.pop();

    res.json({
      success: true,
      totalClicks: affiliateClicks,
      targetUrl: `https://www.amazon.com/dp/B08ERGOFOAM?tag=${encodeURIComponent(tag)}`,
    });
  });

  // 3. Get click statistics
  app.get('/api/analytics', (req, res) => {
    res.json({
      success: true,
      totalClicks: affiliateClicks,
      recentClicks: clickLogs.slice(0, 10),
    });
  });

  // 4. Vite Dev Server / Static Build
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ErgoRelief Server] Ready on http://0.0.0.0:${PORT}`);
  });
}

startServer();
