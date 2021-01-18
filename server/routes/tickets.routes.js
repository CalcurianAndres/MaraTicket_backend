const express = require('express');
const Ticket = require('../database/models/ticket.model');
const { verificarToken, verificar_Role } = require('../auth/autenticacion');
const { enviarEmail } = require('../middlewares/email');

const app = express();

app.get('/api/tickets', [verificarToken, verificar_Role], (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Ticket.find({})
            .populate('usuario', 'Nombre Apellido Correo AnyDesk img')
            .skip(desde)
            .limit(10)
            .exec((err, ticket) =>{
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
        
            Ticket.countDocuments({}, (err,conteo)=>{

                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }

                res.json({
                    ok:true,
                    ticket,
                    total:conteo
                })
            });

            })
});

app.post('/api/ticket', verificarToken, (req, res) => {

    let body = req.body;

    let ticket = new Ticket({
        titulo: body.Titulo,
        descripcion: body.Descripcion,
        estado: body.estado,
        usuario: req.usuario._id
    });

    ticket.save((err, ticketDB) => {

        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        enviarEmail(ticketDB.titulo, req.usuario.Correo);

        res.json({
            ok:true,
            ticket: ticketDB
        })

    });

});

app.put('/api/ticket/:id', [verificarToken, verificar_Role], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Ticket.findByIdAndUpdate(id, body,{new:true, runValidators:true}, (err, ticketDB) => {
        if( err ){
            return res.status(401).json({
                ok:false,
                err
            });
        }
    
        if(!ticketDB){
            return res.status(400).json({
                ok:false,
                err:{
                    message:'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok:true,
            ticket:ticketDB
        });

    });
});



module.exports = app;