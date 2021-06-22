'use strict'

var User = require("../model/user.model");
var Product = require('../model/product.model');
var Cartshopping = require('../model/cartshopping.model');
var SalesCheck = require('../model/salescheck.model');
var jwt = require('../services/jwt');
var bcrypt = require('bcrypt-nodejs');


// ADMINISTRADOR
function Admin(req, res) {
    var userModel = new User();
  
    userModel.name = 'ADMIN';
    userModel.password = '123456';
    userModel.nickname = 'ADMIN'
    userModel.role = 'ADMIN'
  
    User.find({
      $or: [
        { nombre: userModel.name }
      ]
    }).exec((err, adminEncontrado) => {
      if (err) return console.log('Error al crear el Admin');
      if (adminEncontrado.length >= 1) {
        return console.log("El administrador ya se creo")
  
      } else {
        bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {
          userModel.password = passwordEncriptada;
          userModel.save((err, adminGuardado) => {
  
            if (err) return console.log('error en la peticion del Admin')
            if (adminGuardado) {
              console.log('Administrador Creado xD')
  
            } else {
              console.log('Error al crear el Administrador')
              }
            })
         })
       }
    })
  }


function createUser(req,res){
    var body = req.body;
    var user = new User();

    if(body.name && body.nickname && body.password ){
        User.findOne({nickname: body.nickname},(err,userRepeat)=>{
            if(err){
                res.status(500).send({mensaje:"Error general del servidor", err});
            }else if(userRepeat){
                res.status(400).send({mensaje:"Este nickname ya esta en uso"});
            }else{
                user.name = body.name;
                user.nickname = body.nickname;
                user.salescheck = body.salescheck;
                user.role = "USER";

                bcrypt.hash(body.password, null,null, (err, passwordEncrypt)=>{
                    if(err){
                        res.status(500).send({mensaje:"Error general del servidor", err});
                    }else if(passwordEncrypt){
                        user.password = passwordEncrypt;
                        
                        user.save((err, userSave)=>{
                            if(err){
                                res.status(500).send({mensaje:"Error general en el servidor"});
                            }else if(userSave){
                                res.send({Usuario: userSave});
                            }else{
                                res.status(404).send({mensaje:"No se logro registrar al usuario"});
                            }
                        });
                    }else{
                        res.status(404).send({mensaje:"No se pudo encriptar la contraseña del usuario"});
                    }
                });
            }
        });
    }else{
        res.status(404).send({mensaje: "Ingrese todos los parametros"});
    }

    
}

function updateUser(req,res){
    var idUser = req.params.id;
    var body = req.body; 

        if(req.user.role == "USER" ){
            User.findOne({nickname: body.nickname},(err,userRepeat)=>{
                if(err){
                    res.status(500).send({mensaje:"Error general del servidor", err});
                }else if(userRepeat){
                    res.status(404).send({mensaje:"Las actualizaciones de usuario que desea realizar no son posibles por razones de uso"});
                }else{
                    if(body.password){
                        bcrypt.hash(body.password,null,null,(err, passwordEncrypt)=>{
                            if(err){
                                res.status(500).send({mensaje:"Error general del servidor", err});
                            }else if(passwordEncrypt){
                                body.password = passwordEncrypt;
                                User.findByIdAndUpdate(idUser,body,{new:true},(err,userUpdate)=>{
                                    if(err){
                                        res.status(500).send({mensaje:"Error general del servidor", err});
                                    }else if(userUpdate){
                                        res.send({Usuario_Actualizado: userUpdate});
                                    }else{
                                        res.status(404).send({mensaje:"No se encontro el usuario al que decea actualizar"});
                                    }
                                });    
                            }else{
                                res.status(404).send({mensaje:"No se logro encriptar la contraseña nueva"});
                            }
                        });
                    }
                }
            });
        }else{
            res.send({mensaje:"No tienes permisos para esta ruta"});
        }   
    }


function listUser(req,res){
    var idUser = req.params.id;

    if(req.user.role == "ADMIN"){
        User.find({},(err,listusers)=>{
            if(err){
                res.status(500).send({mensaje:"Error general del servidor", err});
            }else if(listusers){
                res.send({Usuarios: listusers});
            }else{
                res.status(404).send({mensaje:"No se encontraron usuarios en la base de datos"});
            }
        });
    }else{
        res.send({mensaje:"No tienes permisos para esta ruta"});        
    }
    
}

function deleteUser(req,res){
    var idUser = req.params.id;

    if(req.user.role == "USER" && req.user.sub == idUser){
        User.findByIdAndRemove(idUser,(err,userdelete)=>{
            if(err){
                res.status(500).send({mensaje:"Error general del servidor", err});
            }else if(userdelete){
                Cartshopping.deleteMany({_id:userdelete.cartshopping}, (err,deletecart)=>{
                    if(err){
                        res.status(500).send({mensaje:"Error general en el sistema ", err});
                    }else if(deletecart){
                        res.send({mensaje:"Se ha eliminado al usuario exitosamente"});
                    }else{
                        res.status(400).send({mensaje:"No se logro eliminar los carritos asignados al usuario"});
                    }
                })
            }else{
                res.status(400).send({mensaje:"No se logro eliminar al usuario"});
            }
        });
    }else{
        res.send({mensaje:"No tienes permisos para esta ruta"});
    }
}

function login(req, res){
    var body = req.body;

    if(body.nickname && body.password){
        User.findOne({nickname: body.nickname}, (err,userfind)=>{
            if(err){
                res.status(500).send({mensaje:"Error general del servidor", err});
            }else if(userfind){
                bcrypt.compare(body.password, userfind.password, (err, passwordcheak)=>{
                    if(err){
                        res.status(500).send({mensaje:"Error general del servidor", err});
                    }else if(passwordcheak){
                        if(userfind.role =="USER"){
                            if(userfind.salescheck.length <= 0){
                                res.send({Bienvenido: userfind.name,token: jwt.createToken(userfind)});
                            }else if(userfind.userfind.length > 0){
                                res.send({Bienvenido: userfind.salescheck,token: jwt.createToken(userfind)});
                            }
                        }else{
                            res.send({Bienvenido: userfind.name, token: jwt.createToken(userfind)});
                        }
                    }else{
                        res.status(404).send({mensaje:"La contraseña es incorrecta"});
                    }
                });
            }else{
                res.status(404).send({mensaje:"No se encontro el usuario al que desea logear"});
            }
        });
    }
}



module.exports = {
    Admin,
    createUser,
    updateUser,
    deleteUser,
    listUser,
    login
}