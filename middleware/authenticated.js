'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'clave_secreta_1234';

exports.ensureAuth = (req, res, next) =>{
    if(!req.headers.authorization){
        return res.status(403).send({mensaje: "La peticion no tiene la cabecera de autenticacion"});
    }else{
        var token = req.headers.authorization.replace(/['"]+/g,'');
        try{
            var payload = jwt.decode(token,key)
            if(payload.exp <= moment().unix()){
                return res.status(401).send({mensaje:"El token ya expiro"});
            }else if(payload.role != 'USER'){
                return res.status(401).send({mensaje:"No tiene permisos para esta ruta"});
            }
        }catch(Exception){
            return  res.status(404).send({mensaje:"El token no es valido"});
        }

        req.user = payload;
        next();
    }
}

exports.ensureAuthAdmin = (req, res, next) =>{
    if(!req.headers.authorization){
        return res.status(403).send({mensaje: "La peticion no tiene la cabecera de autenticacion"});
    }else{
        var token = req.headers.authorization.replace(/['"]+/g,'');
        try{
            var payload = jwt.decode(token,key)
            if(payload.exp <= moment().unix()){
                return res.status(401).send({mensaje:"El token ya expiro"});
            }else if(payload.role != 'USER'){
                return res.status(401).send({mensaje:"No tiene permisos para esta ruta"});
            }
        }catch(Exception){
            return  res.status(404).send({mensaje:"El token no es valido"});
        }

        req.user = payload;
        next();
    }
}