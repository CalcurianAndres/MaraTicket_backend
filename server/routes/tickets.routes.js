const express = require('express');
var exec = require('child_process').exec;

const Ticket = require('../database/models/ticket.model');
const Comentario = require('../database/models/comentarios.model');
const Notificacion = require('../database/models/notificaciones.model');

const { verificarToken, verificar_Role } = require('../auth/autenticacion');
const { enviarEmail } = require('../middlewares/email');


const app = express();

app.get('/api/tickets', [verificarToken, verificar_Role], (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5
    limite = Number(limite);

    Ticket.find({})
            .populate('usuario', 'Nombre Apellido Correo AnyDesk img')
            .where('estado').ne('CERRADO')
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

    Ticket.findById(id, (err, ticketDB) =>{
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

        if(ticketDB.estado != body.estado){
            body.tipo = `cambió de estado a ${body.estado}`;
        }

        const Noti = ticketDB.notificaciones;
        if(Noti.length <= 0){

            let notificacion = new Notificacion({
                notificacion:[{
                    usuario:body.usuario,
                    tipo:body.tipo,
                    mensaje:body.mensaje
                }]
            });

            notificacion.save(async(err, notificacion)=>{
                if( err ){
                    return res.status(401).json({
                        ok:false,
                        err
                    });
                }

                const update = {estado:body.estado,notificaciones:notificacion._id};

                await Ticket.findByIdAndUpdate(id, update, {new:true, runValidators:true}, (err, ticketDB)=>{
                    if( err ){
                        return res.status(401).json({
                            ok:false,
                            err
                        });
                    }

                    res.json(ticketDB);
                });

            })

        }else{
            Ticket.findByIdAndUpdate(id, {estado:body.estado},{new:true, runValidators:true}, (err,ticketDB)=>{
                if( err ){
                    return res.status(401).json({
                        ok:false,
                        err
                    });
                }

                console.log(ticketDB);
            });
            Notificacion.findByIdAndUpdate(Noti,{
                $push:{notificacion:[{usuario:body.usuario, tipo:body.tipo, mensaje:body.mensaje}]}}
                , {new:true, runValidators:true},
                (err, Noti) =>{
                    if( err ){
                        return res.status(401).json({
                            ok:false,
                            err
                        });
            
                    }

                    res.json(Noti)


            });
        }


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

// [verificarToken, verificar_Role]

app.get('/api/ticket/:id',verificarToken,  (req, res) => {

    let id = req.params.id;

    Ticket.findById(id)
    .populate('usuario', 'Nombre Apellido Correo AnyDesk img')
    .populate({path:'comentarios', populate:{path:'comentarios.usuario', select:'Nombre Apellido img'}})
    .populate({path:'notificaciones', populate:{path: 'notificacion.usuario', select:'Nombre Apellido'}})
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