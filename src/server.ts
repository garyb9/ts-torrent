
import express, { Request, Response } from 'express';

const app: express.Application = express();

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

export default app;