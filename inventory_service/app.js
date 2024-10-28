const express = require('express');
const app = express();
const port = 3002;
const inventoryRoutes = require('./routes/inventory');
// const { generateToken } = require('./jwt'); // Importar función para generar el token

app.use(express.json());
app.use('/inventory', inventoryRoutes);

// // Generar el token al iniciar el servicio
// const token = generateToken();

console.log(`Servidor escuchando en http://localhost:${port}`);
// console.log(`Token: ${token}`); // Mostrar el token generado
app.listen(port);
