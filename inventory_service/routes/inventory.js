// inventory.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const consumeMessages = require('../rabbitmqConsumer'); // Asegúrate de importar el consumidor
const { verifyToken } = require('../jwt'); // Importar el middleware

// Proteger todas las rutas de este router con el middleware
router.use(verifyToken);


// Obtener la cantidad de un producto en el inventario
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT cantidad FROM inventario WHERE producto_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener la cantidad del producto');
    }
});

// Actualizar la cantidad de un producto en el inventario
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { cantidad } = req.body;

    if (cantidad === undefined) {
        return res.status(400).json({ error: 'La cantidad es obligatoria' });
    }

    try {
        const result = await pool.query(
            'UPDATE inventario SET cantidad = $1 WHERE producto_id = $2 RETURNING *',
            [cantidad, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar la cantidad del producto');
    }
});

// Esta función se encargará de escuchar los mensajes de RabbitMQ
async function updateInventoryFromMessage(product) {
    const { id, cantidad } = product; // Extrae el id del producto y la cantidad
    try {
        // Lógica para actualizar el inventario
        const result = await pool.query(
            'INSERT INTO inventario (producto_id, cantidad) VALUES ($1, $2) RETURNING *'
            , [id, cantidad]
        );

        if (result.rows.length === 0) {
            console.error('Producto no encontrado en el inventario para actualizar');
            return;
        }

        console.log('Inventario actualizado:', result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar el inventario:', err);
    }
}


// Inicia el consumidor para escuchar los mensajes
consumeMessages(updateInventoryFromMessage);

module.exports = router;
