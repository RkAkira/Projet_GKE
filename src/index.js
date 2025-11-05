const express = require('express');
const { healthRouter } = require('./routes/health');
const { apiRouter } = require('./routes/api');
const { rootRouter } = require('./routes/root');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const promBundle = require('express-prom-bundle');


const app = express();
const port = 80;

const delay_startup = process.env.DELAY_STARTUP === 'true';
console.log(`Delay startup: ${delay_startup}`);    

const metricsMiddleWare = promBundle({
    includeMethod: true,
    includeStatusCode: true,
    includePath: true,
    includeUp: true
});

app.use(metricsMiddleWare);
app.use('/', rootRouter);
app.use('/', healthRouter);
app.use('/api', apiRouter);
app.use(bodyParser.json());

if(delay_startup){
    const start = Date.now();
    while(Date.now() - start<60000){}
}

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;
const dbUrl = process.env.DB_URL;

// const dbHost = process.env.DB_HOST || "localhost";
// const dbPort = process.env.DB_PORT || "27017";
// const dbName = process.env.DB_NAME || "test";

// ⚠️ encodage du mot de passe (utile si caractères spéciaux)
const encodedPass = encodeURIComponent(dbPass);

// const dbUrl = `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=admin&authMechanism=SCRAM-SHA-1`;
console.log(`Connecting to MongoDB with URL: ${dbUrl}`);

mongoose
    .connect(dbUrl)
    .then(()=>{
        console.log('Connected to MongoDB');

        app.listen(port, () => {
            console.log(`Color API is listening on port : ${port}`);
        });
    })
    .catch((err)=>{
        console.error('Could not connect to MongoDB');
        console.error(err);
    });


