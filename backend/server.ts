import { Server } from 'http';
import app from './app';

const defaultPort = Number(process.env.VCR_PORT ?? 3345);

const startServer: (port?: number) => Promise<Server> = (port = defaultPort) => {
  return new Promise((res) => {
    const server: Server = app.listen(port, () => {
      res(server);

      console.log('Server listening on port', port);

      if (process.env.FRONTEND_TARGET) {
        console.log('App listening at', process.env.FRONTEND_TARGET);
      }
    });
  });
};

export default startServer;
