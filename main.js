const { Command } = require('commander');
const http = require('http');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-c, --cache <path>', 'input file path');

program.parse(process.argv);
const options = program.opts();

function requestListener(req, res){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("Server is working");
}

const server = http.createServer(requestListener);
server.listen(options.port, options.hort);
