const { Command } = require('commander');
const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-c, --cache <path>', 'input file path');

program.parse(process.argv);
const options = program.opts();
const cacheDir = options.cache;

function getImagePath(code) {
  return path.join(cacheDir, ${code}.jpg)
}

async function directoryExists() {
  try {
    await fs.access(cacheDir);
  } catch {
    await fs.mkdir(cacheDir, { recursive: true });
  }
}

async function startServer(){
  await directoryExists();
  const server = http.createServer(async (req, res) => {
    const code = req.url.slice(1);
    const filePath = getImagePath(code);

    try {
      switch (req.method) {
        case 'GET': {
          try {
            const data = await fs.readFile(filePath);
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(data);
          } catch (err) {
            if (err.code === 'ENOENT') {
              res.writeHead(404, {'Content-Type': 'text/plain'});
              res.end('Not found');
            } else {
              throw err;
            }
          }
          break;
        }
        default:
          res.writeHead(405, {'Content-Type': 'text/plain'});
          res.end('Method Not Allowed');
      }
    } catch (err) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Internal Server Error');
    }
  });

  server.listen(options.port, options.host, () => {
    console.log(Server working on http://${options.host}:${options.port});
  });
}

startServer();
