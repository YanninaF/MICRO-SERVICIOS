
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'Hello123'; // clave

// Función para generar el JWT
function generateToken() {
    const token = jwt.sign({}, SECRET_KEY, { expiresIn: '1h' }); // Token válido por 1 hora
    console.log("Token generado:", token); // Imprime el token en la consola
    return token;
}

// Middleware para verificar el JWT
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Esperamos el formato "Bearer <token>"
    
    if (!token) {
        return res.status(403).send('Token no proporcionado');
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send('Token inválido');
        }
        next(); // Token válido, continuar
    });
}

module.exports = { generateToken, verifyToken };
