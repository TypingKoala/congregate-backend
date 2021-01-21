import server from './app';

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`🚀 Congregate Backend running on http://localhost:${PORT}`);
});
