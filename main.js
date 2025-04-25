const { Command } = require('commander');
const fs = require('fs/promises');
const http = require('http');
const path = require('path');
const superagent = require('superagent');
const fsSync = require('fs');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-c, --cache <path>', 'input file path');

program.parse(process.argv);
const options = program.opts();
const cacheDir = path.resolve(options.cache);

function getImagePath(code) {
  return path.join(cacheDir, `${code}.jpg`);
}

async function directoryExists() {
  try {
    await fs.access(cacheDir);
  } catch {
    await fs.mkdir(cacheDir, { recursive: true });
  }
}

async function fileExists(path){
    try{
        await fs.access(path);
        return true;
    } catch{
        return false;
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
                    if(await fileExists(filePath)) {
                        const data = await fs.readFile(filePath);
                        res.writeHead(200, {'Content-Type': 'image/jpeg'});
                        res.end(data);
                    }
                    else{
                        const url = `https://http.cat/${code}`
                        const writeStream = fsSync.createWriteStream(filePath);
                        superagent
                            .get(url)
                            .on('error', (err) => {
                                res.writeHead(404, {'Content-Type': 'text/plain'});
                                res.end('Not Found');
                            })
                            .pipe(writeStream)
                            .on('finish', async () => {
                                const data = await fs.readFile(filePath);
                                res.writeHead(200, {'Content-Type': 'image/jpeg'});
                                res.end(data);
                            })
                    }
                    break;
                }
                case 'PUT': {
                    const url = `https://http.cat/${code}`
                    const writeStream = fsSync.createWriteStream(filePath);
                    superagent
                        .get(url)
                        .on('error', (err) => {
                            res.writeHead(404, {'Content-Type': 'text/plain'});
                            res.end('Not Found');
                        })
                        .pipe(writeStream)
                        .on('finish', () => {
                        res.writeHead(201, { 'Content-Type': 'text/plain' });
                        res.end('Created');
    });
                    break;
                }

                case 'DELETE': {
                    await fs.unlink(filePath);
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end('Deleted');
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
        console.log(`Server working on http://${options.host}:${options.port}`);
    })
}
startServer();

