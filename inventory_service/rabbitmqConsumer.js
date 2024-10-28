// inventory_service/rabbitmqConsumer.js

const amqp = require('amqplib');
const { CircuitBreaker, retry } = require('./utils/rabbitResilience');

const rabbitmqCircuitBreaker = new CircuitBreaker();

async function createConsumerConnection() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        console.log('Consumer: Conexión establecida con RabbitMQ');
        return connection;
    } catch (error) {
        console.error('Consumer: Error al conectar con RabbitMQ:', error.message);
        throw error;
    }
}

async function consumeMessages(updateInventory) {
    let connection;
    let channel;
    let reconnectTimeout;
    
    async function connect() {
        try {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }

            connection = await rabbitmqCircuitBreaker.execute(() => createConsumerConnection());
            
            connection.on('error', handleConnectionError);
            connection.on('close', handleConnectionClose);
            
            channel = await connection.createChannel();
            channel.prefetch(1);
            
            const queue = 'product_queue';
            await channel.assertQueue(queue, { 
                durable: true
            });
            
            console.log("Esperando mensajes en la cola:", queue);
            
            channel.consume(queue, async (msg) => {
                if (msg) {
                    try {
                        const product = JSON.parse(msg.content.toString());
                        console.log("Mensaje recibido:", product);
                        
                        await retry(async () => {
                            await updateInventory(product);
                            channel.ack(msg);
                            console.log("Mensaje procesado correctamente");
                        });
                    } catch (error) {
                        console.error('Error procesando mensaje:', error.message);
                        // rechazamos el mensaje y lo reencolamos
                        channel.nack(msg, false, true);
                    }
                }
            });
            
        } catch (error) {
            console.error('Error en la conexión del consumidor:', error.message);
            handleConnectionError(error);
        }
    }
    
    function handleConnectionError(error) {
        console.error('Error en la conexión de RabbitMQ:', error.message);
        handleConnectionClose();
    }
    
    function handleConnectionClose() {
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
        }
        
        console.log('Conexión cerrada. Intentando reconectar en 5 segundos...');
        reconnectTimeout = setTimeout(() => {
            connect().catch(console.error);
        }, 5000);
    }
    
    await connect();
    
    process.on('SIGINT', async () => {
        try {
            if (channel) await channel.close();
            if (connection) await connection.close();
            console.log('Conexiones cerradas correctamente');
            process.exit(0);
        } catch (error) {
            console.error('Error al cerrar conexiones:', error.message);
            process.exit(1);
        }
    });
}

module.exports = consumeMessages;