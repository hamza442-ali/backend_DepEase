function listen(app, port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve(server));
    server.once('error', reject);
  });
}

function registerShutdown(server, disconnect) {
  let stopping = false;

  function shutdown() {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => process.exit(1), 10000);
    deadline.unref();

    server.close(async () => {
      try {
        await disconnect();
      } catch {
        process.exitCode = 1;
      } finally {
        clearTimeout(deadline);
      }
    });
  }

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  return shutdown;
}

module.exports = { listen, registerShutdown };
