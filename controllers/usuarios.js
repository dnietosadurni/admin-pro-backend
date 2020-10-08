const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');


const { response } = require('express');

const getUsuarios = async(req, res) => {

    const usuarios = await Usuario.find({});

    res.json({
        ok: true,
        usuarios,
    });

};


const crearUsuario = async(req, res = response) => {

    const { password, email, nombre } = req.body;

    try {

        const emailExiste = await Usuario.findOne({ email });

        if (emailExiste) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado'
            });
        }

        const usuario = new Usuario(req.body);
        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        // Crear Token
        const token = await generarJWT(usuario.id);


        // Guardar usuario
        await usuario.save();

        res.json({
            ok: true,
            usuario,
            token
        });

    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado ... revisar logs'
        });

    }


};

const actualizarUsuario = async(req, res = response) => {

    // TODO: Validar token y comprobar  si el usuario es correcto

    const uid = req.params.id;

    try {

        const usuarioDB = await Usuario.findById(uid);

        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un usuario con ese id"
            });
        }

        // Actualización

        const { password, google, ...campos } = req.body;

        if (usuarioDB.email === req.body.email) {
            delete campos.email;
        } else {
            const existeEmail = await Usuario.findOne({ email: req.body.email });
            if (existeEmail) {
                return res.status(400).json({
                    ok: false,
                    msg: "Ya existe un usuario con este email"
                });
            }
        }

        //    delete campos.password;
        //    delete campos.google;

        const usuarioActualizado = await Usuario.findByIdAndUpdate(uid, campos, { new: true });


        res.json({
            ok: true,
            usuario: usuarioActualizado
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        });
    }
}

const borrarUsuario = async(req, res = response) => {

    const uid = req.params.id;

    try {

        const usuarioDB = await Usuario.findById(uid);

        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un usuario con ese id"
            });
        }

        await Usuario.findByIdAndDelete(uid);

        res.json({
            ok: true,
            msg: "Usuario eliminado"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        });
    }
}


module.exports = {
    getUsuarios,
    crearUsuario,
    actualizarUsuario,
    borrarUsuario
};