import fetch from 'node-fetch';
import Express from 'express';
import BodyParser from 'body-parser';
import { randomUUID } from 'crypto';
import { WebSocketServer } from 'ws'
import cors from 'cors';
const events = [];
const clients = [];

const app = Express();
app.use(BodyParser.json());
app.use(cors({ origin: '*' }));

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', function connection(ws, req) {
	const client = req.headers['sec-websocket-key'];
	console.log('Client Connected: ', client);
	clients[0] = ws;
});
  
app.on('upgrade', (req, socket) => {
	socket.write(req.body);
});

app.post('/webhook', (req, res) => {
	
	events.push(req.body);

	setTimeout(() => {
		console.table(events);
		const lastEvent = events.pop();
		clients[0].send(JSON.stringify(lastEvent));
		wss.emit('message', lastEvent);
	}, 3000);
	
	res.send('ok');
});

app.get('/', async (req, res) => {
	
	const UUID = randomUUID();
	const body = {
		eventData: 'Date: [' + new Date().toISOString() + `] - ID: [${UUID}]`,
		postBack: 'http://localhost:4000/webhook'
	};

	const response = await fetch('http://localhost:3000/queue', {
		method: 'post',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	});

	console.log('Request to Gateway: ', response.status);

	res.status(200).json({ status: 'pagamento adicionado à fila' });
});

app.listen(4000, () => console.log('Running on localhost:4000'));
