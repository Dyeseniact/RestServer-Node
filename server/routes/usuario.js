const express = require('express');

const Usuario = require('../models/usuario');

const bcrypt = require('bcrypt');

const _ = require('underscore');

const app = express();

app.get('/usuario', function (req, res) {
    let desde = req.query.desde || 0;
    desde = Number(desde); // tranformamos a numero

    let limite = req.query.limite || 5;
    limite = Number(limite);

    //Usuario.find({google:true}) ejemplo para saber cuantos tengo
    //Usuario.find({}, 'nombre email role estado google') // mostrar solo nombre e email
    Usuario.find({})
        .skip(desde) // salta los primeros 5 
        .limit(5) // muestra 5 regustros 
        .exec((err, usuarios) => {
            if( err ) {
                return res.status(400).json({
                    ok: false,
                    err
                });
                
            }
            //Usuario.count({google: true}, (err, conteo) => {
            Usuario.count({}, (err, conteo) => {
                res.json({
                    ok: true,
    
                    usuarios,
                    cuantos: conteo
                });
            })
            
        });

  });
  
// Post para crear nuevos registros
app.post('/usuario', function (req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role


    });



    usuario.save((err, usuarioDB) => {

        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
            
        }

        //usuarioDB.password = null;  // cambiamos valor a null de nuestro parametro

        res.json({
            ok:true,
            usuario: usuarioDB
        });

    });

      
});
  
//Put para actualizar data/ registros
app.put('/usuario/:id', function (req, res) {
    let id = req.params.id;
    let body = _.pick(req.body,['nombre', 'email', 'img', 'role', 'estado']);
    
    

    Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true},  (err, usuarioDB) => {

        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
            
        }
       
        res.json({
            ok: true,
            usuario: usuarioDB
        });
        
    });
  });

app.delete('/usuario/:id', function (req, res) {
    
    let id = req.params.id;

    let cambiaEstado = {
        estado: false
    };
    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => { //borrar usuario

    Usuario.findByIdAndUpdate(id, cambiaEstado,  {new: true},(err, usuarioBorrado) => { //cambiar estado
        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
            
        };
        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario No encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        })
    });
    

  });

module.exports = app;
  