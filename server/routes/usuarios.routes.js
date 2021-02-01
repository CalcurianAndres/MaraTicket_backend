const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../database/models/usuarios.model');
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





module.exports = app;