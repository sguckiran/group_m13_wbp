const http = require('http');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const port = parseInt(process.env.PORT, 10) || 8080;

const mimeTypes = {
	"html": "text/html; charset=UTF-8",
	"js": "application/javascript; charset=UTF-8",
	"css": "text/css; charset=UTF-8",
	"json": "application/json; charset=UTF-8",
	"png": "image/png",
	"jpg": "image/jpeg",
	"jpeg": "image/jpeg",
	"gif": "image/gif",
	"svg": "image/svg+xml",
	"ico": "image/x-icon",
	"txt": "text/plain; charset=UTF-8"
};

function send404(res) {
	res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
	res.end('404 Not Found');
}

function send500(res, err) {
	res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
	res.end('500 Internal Server Error\n' + String(err));
}

const server = http.createServer((req, res) => {
	try {
		let reqPath = decodeURIComponent(req.url.split('?')[0] || '/');
		if (reqPath === '/') reqPath = '/index.html';
		const filePath = path.join(publicDir, reqPath);

		if (!filePath.startsWith(publicDir)) {
			res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
			return res.end('403 Forbidden');
		}

		fs.stat(filePath, (err, stats) => {
			if (err) return send404(res);
			if (stats.isDirectory()) {
				const index = path.join(filePath, 'index.html');
				fs.access(index, fs.constants.R_OK, (e) => {
					if (e) return send404(res);
					res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
					fs.createReadStream(index).pipe(res);
				});
				return;
			}

			const ext = path.extname(filePath).slice(1).toLowerCase();
			const contentType = mimeTypes[ext] || 'application/octet-stream';
			res.writeHead(200, { 'Content-Type': contentType });
			fs.createReadStream(filePath).on('error', (e) => send500(res, e)).pipe(res);
		});
	} catch (e) {
		send500(res, e);
	}
});

server.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});
