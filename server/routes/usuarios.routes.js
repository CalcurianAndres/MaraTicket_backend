const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../database/models/usuarios.model');
const Ticket = require('../database/models/ticket.model');
const { verificarToken, verificar_Role } = require('../auth/autenticacion');

const app = express();

app.get('/api/usuarios', verificarToken, (req, res)=>{

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5
    limite = Number(limite);

    Usuario.find({estado:true})
            .sort({Role:1})
            .skip(desde)
            .limit(limite)
            .exec((err, usuarios)=>{
                if ( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }

            Usuario.countDocuments({estado:true},(err, total)=>{
                if ( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }

                res.json({
                    ok:true,
                    usuarios,
                    total
                }); 
            });
        });

});

app.post('/api/usuario', [verificarToken, verificar_Role], (req,res)=>{

    let body = req.body;

    let usuario = new Usuario({
        Nombre: body.Nombre,
        Apellido: body.Apellido,
        Correo: body.Correo,
        Password: bcrypt.hashSync(body.Password, 10),
        AnyDesk: body.AnyDesk,
        Rol: body.Rol,
    });

    usuario.save((err, UsuarioDB) => {
        if ( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        res.json({
            ok:true,
            usuario:UsuarioDB
        });

    });

});


app.put('/api/usuario/:id', [verificarToken, verificar_Role], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    delete body.Password;

    Usuario.findByIdAndUpdate(id, body,{new:true, runValidators:true}, (err, UsuarioDB) => {
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
    
        res.json({
            ok:true,
            usuario:UsuarioDB
        });

    });
});

app.delete('/api/usuario/:id', [verificarToken, verificar_Role], (req, res)=>{
    let id = req.params.id;
    let borrar = {
        estado:false
    }

    Usuario.findByIdAndUpdate(id, borrar, (err, usuarioBorrado) => {
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        if(!usuarioBorrado){
            return res.status(400).json({
                ok:false,
                err:{
                    message: 'usuario no encontrado'
                }
            });
        }

        res.json({
            ok:true,
            usuario:usuarioBorrado
        });
    });
});

<<<<<<< HEAD
app.get('/api/perfil/:id', verificarToken, (req, res) => {

    let id = req.params.id;

    Ticket.find({usuario:id}, (err,Total)=>{

        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        Ticket.countDocuments({usuario:id,estado:'ABIERTO'}, (err,Abiertos)=>{
    
            if( err ){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }
            Ticket.countDocuments({usuario:id,estado:'EJECUTANDOSE'}, (err,Ejecutandose)=>{
        
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
                Ticket.countDocuments({usuario:id,estado:'CERRADO'}, (err,Cerrados)=>{
            
                    if( err ){
                        return res.status(400).json({
                            ok:false,
                            err
                        });
                    }
                    res.json({
                        ok:true,
                        Total,
                        Abiertos,
                        Ejecutandose,
                        Cerrados
                    });
                });
            });
        });
    });

})
=======
app.get('api/perfil/:id', verificarToken, (req, res)=>{
    let id = req.params.id;
>>>>>>> 09bde4bf99e641d6f264825a05a4114e1b119fd3

    Ticket.find({usuario:id}, (err, ticketDB)=>{
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        if(!ticketDB){
            return res.status(400).json({
                ok:false,
                err:{
                    message: 'Usuario no ha generado ticket'
                }
            });
        }

        Ticket.countDocuments({estado:'ABIERTO', usuario:id}, (err, abiertos)=>{
            if( err ){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }
            Ticket.countDocuments({estado:'EJECUTANDOSE', usuario:id}, (err, ejecutandose)=>{
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
                Ticket.countDocuments({estado:'CERRADO', usuario:id}, (err, cerrados)=>{
                    if( err ){
                        return res.status(400).json({
                            ok:false,
                            err
                        });
                    }
                    res.json({
                        ok:true,
                        tickets:ticketDB,
                        abiertos,
                        ejecutandose,
                        cerrados
                    })
                })
            })
        })

        
    })
})



module.exports = app;