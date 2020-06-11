import express from 'express';

import gradesRoute from './routes/grades.js';

const app = express();

app.use(express.json());
app.use('/grades', gradesRoute);

app.listen(3000, () => { console.log('Api funcionando')})
