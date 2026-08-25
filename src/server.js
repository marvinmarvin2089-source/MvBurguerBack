import 'dotenv/config';
import app from './app.js';
import './database/index.js';

const port = Number(process.env.PORT || 3001);

app.listen(port, () => console.log(`Server is running at port ${port}`));
