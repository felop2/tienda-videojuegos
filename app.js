const express = require('express');
const ejs = require('ejs');
const PDFDocument = require('pdfkit');
const path = require('path');
const moment = require('moment');  // Para manejar la fecha
const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Datos de ejemplo de los videojuegos con imágenes
const videojuegos = [
    { id: 1, nombre: "fifa25", precio: 250000, imagen: "/images/fifa25.jpg" },
    { id: 2, nombre: "gallo figther", precio: 400000, imagen: "/images/gallos.png" },
    { id: 3, nombre: "gta 6", precio: 300000, imagen: "/images/gta6.jpg" },
];

// Página de inicio
app.get('/', (req, res) => {
    res.render('index', { videojuegos, juegosSeleccionados: [], total: 0 });
});

// Ruta para procesar la compra y mostrar los juegos seleccionados en la misma página
app.post('/comprar', (req, res) => {
    let juegosSeleccionados = [];
    let total = 0;

    // Procesar los datos enviados del formulario
    Object.keys(req.body).forEach(key => {
        const juegoId = key.replace('cantidad_', '');
        const cantidad = parseInt(req.body[key]);

        if (cantidad > 0) {
            const juego = videojuegos.find(j => j.id == juegoId);
            if (juego) {
                juego.cantidad = cantidad;
                juegosSeleccionados.push(juego);
                total += juego.precio * cantidad;
            }
        }
    });

    res.render('index', { videojuegos, juegosSeleccionados, total });
});

// Ruta para generar la factura en PDF
app.post('/generar-factura', (req, res) => {
    const juegosDetalles = JSON.parse(req.body.juegosDetalles);
    const total = req.body.total;

    // Crear un nuevo documento PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="factura_game_universe.pdf"');
    doc.pipe(res);

    // Título
    doc.fontSize(30).font('Helvetica-Bold').text('Game Universe', { align: 'center' });
    doc.moveDown();

    // Fecha de expedición
    const fechaExpedicion = moment().format('MMMM Do YYYY, h:mm:ss a');
    doc.fontSize(12).font('Helvetica').text(`Fecha de expedición: ${fechaExpedicion}`, { align: 'right' });
    doc.moveDown();

    // Descripción de productos
    doc.fontSize(18).font('Helvetica-Bold').text('Productos Comprados:', { underline: true });
    doc.moveDown();

    // Tabla de productos comprados
    juegosDetalles.forEach(juego => {
        doc.fontSize(12).text(`${juego.nombre} x${juego.cantidad} - $${juego.precio * juego.cantidad}`);
    });

    doc.moveDown();

    // Total
    doc.fontSize(18).font('Helvetica-Bold').text(`Total: $${total}`, { align: 'right' });

    // Finalizar el documento
    doc.end();
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
