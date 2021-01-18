require('./config/.env');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')

//server
const app = express();

//Middlewares
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(cors())

//rutas
app.use ( require('./routes/index.routes'));

//Base de datos
require('./database/connection');

//correr app
app.listen(process.env.PORT, ()=>{
    console.log('Escuchando Puerto:', process.env.PORT)
});