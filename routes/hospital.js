var express = require('express');
var Hospital = require('../models/hospital');
var app = express();
var mdAutenticacion = require('../middlewares/autenticacion');

app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    })
                }
                Hospital.count({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        hospitales,
                        total
                    })
                })
            });
})


app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        })
    })
})

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var id = req.params.id;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar hospital',
                errors: err
            })
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            })
        }
        hospital.nombre = body.nombre;
        //hospital.img = body.img;
        hospital.usuario = req.usuario._id;
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear hospital',
                    errors: err
                })
            }
            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            })
        })

    })
})

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            })
        }

        res.status(201).json({
            ok: true,
            usuario: hospitalBorrado
        })
    })
})

module.exports = app;