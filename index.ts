import homepage from './static/index.html';

const port = 3000;

const server = Bun.serve({
    port,
    routes: {
        '/': homepage,
    },
    fetch(req) {
        const filePath = './public' + new URL(req.url).pathname;
        const file = Bun.file(filePath);
        return new Response(file);
    },
    error() {
        return new Response(null, { status: 404 });
    }
});

console.log(`Listening on ${server.url}`);