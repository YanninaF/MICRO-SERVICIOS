const express = require('express');
const router = express.Router();
const pool = require('../db');
const sendProductMessage = require('../rabbitmqProducer'); 
const { verifyToken } = require('../jwt'); // Importar el middleware

// Protege todas las rutas de este router con el middleware
router.use(verifyToken);

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send('Error al obtener los productos');
    }
});

// Obtener un producto específico (ID)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM productos WHERE id_produ = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Producto no encontrado');
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send('Error al obtener el producto');
    }
});

// Crear un nuevo producto con manejo de transacción y rollback simplificado
router.post('/', async (req, res) => {
    const { nombre_pro, descri_pro, precio_pro } = req.body; 

    try {
        // Inicia la transacción
        await pool.query('BEGIN');

        // Inserta el producto en la base de datos
        const result = await pool.query(
            'INSERT INTO productos (nombre_pro, descri_pro, precio_pro) VALUES ($1, $2, $3) RETURNING *',
            [nombre_pro, descri_pro, precio_pro]
        );

        const newProduct = result.rows[0];

        // Envía el mensaje a RabbitMQ
        await sendProductMessage({
            id: newProduct.id_produ,
            nombre: nombre_pro,
            cantidad: 0
        });

        // Confirma la transacción si todo salió bien
        await pool.query('COMMIT');
        
        res.status(201).json(newProduct); // Responde con el nuevo producto

    } catch (err) {
        // Revertir la transacción en caso de error
        await pool.query('ROLLBACK');
        console.error('Error al crear el producto:', err.message);
        res.status(500).send('Error al crear el producto');
    }
});

// Actualizar un producto
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre_pro, descri_pro, precio_pro } = req.body;
    try {
        const result = await pool.query(
            'UPDATE productos SET nombre_pro = $1, descri_pro = $2, precio_pro = $3 WHERE id_produ = $4 RETURNING *',
            [nombre_pro, descri_pro, precio_pro, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('Producto no encontrado');
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send('Error al actualizar el producto');
    }
});


module.exports = router;
