var express = require('express');
var Medico = require('../models/medico');
var app = express();
var mdAutenticacion = require('../middlewares/autenticacion');


app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    })
                }
                Medico.count({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        medicos,
                        total
                    })
                })
            });
})

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        //img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospitalId
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear médico',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        })
    })
})


app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var id = req.params.id;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar medico',
                errors: err
            })
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            })
        }
        medico.nombre = body.nombre;
        //medico.img = body.img;
        medico.hospital = body.hospitalId;
        medico.usuario = req.usuario._id;
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear medico',
                    errors: err
                })
            }
            res.status(201).json({
                ok: true,
                medico: medicoGuardado
            })
        })

    })
})

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            })
        }

        res.status(201).json({
            ok: true,
            usuario: medicoBorrado
        })
    })
})

module.exports = app;