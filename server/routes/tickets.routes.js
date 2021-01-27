const express = require('express');
var exec = require('child_process').exec;

const Ticket = require('../database/models/ticket.model');
const Comentario = require('../database/models/comentarios.model');
const usuario = require('../database/models/usuarios.model');

const { verificarToken, verificar_Role } = require('../auth/autenticacion');
const { enviarEmail } = require('../middlewares/email');


const app = express();

app.get('/api/tickets', [verificarToken, verificar_Role], (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5
    limite = Number(limite);

    Ticket.find({})
            // .populate('usuario', 'Nombre Apellido Correo AnyDesk img')
            .populate({path:'usuario',})
            .skip(desde)
            .limit(limite)
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
            Ticket.countDocuments({estado:'ABIERTO'}, (err,abierto)=>{
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
            Ticket.countDocuments({estado:'EJECUTANDOSE'}, (err, ejecutandose)=>{
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
            Ticket.countDocuments({estado:'CERRADO'}, (err, cerrado)=>{
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
                res.json({
                    ok:true,
                    ticket,
                    total:conteo,
                    abierto,
                    ejecutandose,
                    cerrado
                })
            })
            })
            })
        });
    });
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

    if(body.estado){
        console.log('se cambio el estado')
    }
    if(body.departamento){
        console.log('Se cambio departamento')
    }
    if(body.tomado){
        console.log('el ticket fue tomado por:')
    }

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
                    message:'Ticket no encontrado'
                }
            });
        }

        res.json({
            ok:true,
            ticket:ticketDB
        });

    });
});

app.post('/api/ticket/:id', async (req,res)=>{

    let id = req.params.id;
    let body = req.body;

    Ticket.findById(id, (err, ticket)=>{
        if( err ){
            return res.status(401).json({
                ok:false,
                err
            });

        }
        
        const comentary = ticket.comentarios;
        
        if(comentary.length <= 0){
            
            let comentarios = new Comentario({
                comentarios:[{
                    usuario:body.dueno,
                    mensaje:body.mensaje
                }]
            });

            comentarios.save(async(err, comentario)=>{
                if( err ){
                    return res.status(401).json({
                        ok:false,
                        err
                    });
                }

                const update = {comentarios:comentario._id};
                await Ticket.findByIdAndUpdate(id, update, {new:true, runValidators:true}, (err, ticketDB)=>{
                    if( err ){
                        return res.status(401).json({
                            ok:false,
                            err
                        });
                    }

                    res.json(ticketDB);
                });
            });
        }else{
            Comentario.findByIdAndUpdate(comentary, {$push:{comentarios:[{usuario:body.dueno, mensaje:body.mensaje}]}}, {new:true, runValidators:true},
                (err, coment)=>{
                if( err ){
                    return res.status(401).json({
                        ok:false,
                        err
                    });
                }

                res.json(coment)
            })
        }
    });

});

app.get('/api/ticket/:id', [verificarToken, verificar_Role], (req, res) => {

    let id = req.params.id;

    Ticket.findById(id)
    .populate('usuario', 'Nombre Apellido Correo AnyDesk img')
    .populate({path:'comentarios', populate:{path:'comentarios.usuario'}})
    .exec((err, ticketDB) => {
        if( err ){
            return res.status(401).json({
                ok:false,
                err
            });
        }

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
                message:'ticket no encontrado'
            }
        });
    }

    res.json({
        ok:true,
        ticket:ticketDB
    });
    });
});

app.get('/api/ping', async(req, res)=>{
    
    var pingCmd = "ping 192.168.0.250";
    var result = '';

    function puts(error, stdout, stderr) {
    if (error) {
    res.json(stdout)
    console.log("error", "Error connecting");
    result = "Failed";
    console.log(result)
    }
    else {
    res.json(stdout)
    result = "Success"
    console.log(result)
    }

    
}
exec(pingCmd, puts);

});

module.exports = app;