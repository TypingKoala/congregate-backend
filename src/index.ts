import server from './app';

const PORT = parseInt(process.env.PORT!);

server.listen(PORT, () => {
  console.log(`🚀 Street Skipper Backend running on http://localhost:${PORT}`);
});
