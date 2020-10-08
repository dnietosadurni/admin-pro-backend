/*
     Ruta: /api/login
*/


const { Router } = require('express');
const router = Router();
const { check } = require('express-validator');
const { validarCampos } = require('../Middlewares/validar-campos');


const { login } = require('../controllers/auth');

router.post('/', [
        check('email', 'El correo es oblilgatorio').isEmail(),
        check('password', 'El password es obligatorio').not().isEmpty(),
        validarCampos
    ],
    login
)

module.exports = router;