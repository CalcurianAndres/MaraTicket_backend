const mongoose = require('mongoose');

let estadosValidos = {
    values: ['ABIERTO', 'CERRADO', 'EJECUTANDOSE'],
    message: '{VALUE} no es un estado válido'
}

let Schema = mongoose.Schema;

let TicketSchema = new Schema({
    titulo:{
        type: String,
        required: [true, 'El ticket debe tener un titulo']
    },
    descripcion:{
        type: String,
        required: [true, 'El ticket debe tener una descripción']
    },
    img: {
        type: String,
        required: false
    },
    estado: {
        type: String,
        default: 'ABIERTO',
        enum: estadosValidos
    },
    usuario: [
        {
            type:Schema.Types.ObjectId,
            ref: 'usuario'
        }
    ]


});

module.exports = mongoose.model('ticket', TicketSchema);