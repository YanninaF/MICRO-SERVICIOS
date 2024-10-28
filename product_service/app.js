const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3001;
const productRoutes = require('./routes/product');

app.use(express.json());
app.use('/products', productRoutes);

// Ruta para obtener el token
app.post('/token', (req, res) => {
    // Puedes definir aquí la carga útil (payload) del token
    const payload = {
        // Cualquier dato que desees incluir en el token
        data: 'Token de acceso'
    };

    // Generar el token
    const token = jwt.sign(payload, 'Hello123', { expiresIn: '1h' }); 
    res.json({ token });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
