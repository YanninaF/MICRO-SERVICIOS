
const amqp = require('amqplib');
const { CircuitBreaker, retry } = require('./utils/rabbitResilience');

const rabbitmqCircuitBreaker = new CircuitBreaker();

async function createConnection() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        console.log('Conexión establecida con RabbitMQ');
        return connection;
    } catch (error) {
        console.error('Error al conectar con RabbitMQ:', error.message);
        throw error;
    }
}

async function sendProductMessage(product) {
    let connection;
    let channel;
    
    try {
        connection = await rabbitmqCircuitBreaker.execute(() => createConnection());
        channel = await connection.createChannel();
        
        const queue = 'product_queue';
        await channel.assertQueue(queue, { 
            durable: true
        });
        
        await retry(async () => {
            const result = channel.sendToQueue(
                queue,
                Buffer.from(JSON.stringify(product)),
                { persistent: true }
            );
            if (!result) {
                throw new Error('No se pudo encolar el mensaje');
            }
            return result;
        });
        
        console.log("Mensaje enviado a RabbitMQ:", product);
    } catch (error) {
        console.error('Error en sendProductMessage:', error.message);
        throw error;
    } finally {
        try {
            if (channel) await channel.close();
            if (connection) await connection.close();
            console.log('Conexiones cerradas correctamente');
        } catch (error) {
            console.error('Error al cerrar conexiones:', error.message);
        }
    }
}

module.exports = sendProductMessage;