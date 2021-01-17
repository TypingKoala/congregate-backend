import server from './app';

const PORT = process.env.PORT || 4200;

server.listen(PORT, () => {
  console.log(`🚀 Congregate Backend running on http://localhost:${PORT}`);
});
