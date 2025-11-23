import fs from "node:fs";
import path from "node:path";
import morgan from "morgan";

const __dirname = path.resolve();

function createMultiStream(streams) {
  return {
    write: (message) => {
      streams.forEach((s) => s.write(message));
    },
  };
}

export function attachRouterWithLogger(app, routerPath, router, logFileName) {
  const logFileStream = fs.createWriteStream(
    path.join(__dirname, "./src/logs", logFileName),
    { flags: "a" }
  );

  const consoleStream = {
    write: (msg) => process.stdout.write(msg),
  };

  const multiStream = createMultiStream([logFileStream, consoleStream]);

  app.use(routerPath, morgan("combined", { stream: multiStream }));

  app.use(routerPath, router);
}
