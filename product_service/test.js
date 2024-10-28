// Crear en product_service/test-resilience.js

const amqp = require('amqplib');
const { CircuitBreaker, retry } = require('./utils/rabbitResilience');

// Función que simula una conexión fallida
async function failingConnection() {
    throw new Error('Error de conexión simulado');
}

// Función que simula una conexión exitosa
async function successConnection() {
    return await amqp.connect('amqp://localhost');
}

// Test del sistema de retry y circuit breaker
async function testResilience() {
    const circuitBreaker = new CircuitBreaker(3, 5000); // 3 fallos, 5 segundos de timeout
    
    console.log('\n=== Test de Retry y Circuit Breaker ===');
    
    // Test 1: Probar retry con fallos
    console.log('\n🧪 Test 1: Sistema de Retry');
    try {
        await retry(failingConnection, 3, 1000);
    } catch (error) {
        console.log('✅ Test 1 completado: El retry manejó los fallos como se esperaba');
    }

    // Test 2: Circuit Breaker hasta OPEN
    console.log('\n🧪 Test 2: Circuit Breaker hasta OPEN');
    for (let i = 0; i < 4; i++) {
        try {
            await circuitBreaker.execute(failingConnection);
        } catch (error) {
            console.log(`Intento ${i + 1}: ${error.message}`);
        }
    }

    // Test 3: Verificar que Circuit Breaker rechaza en estado OPEN
    console.log('\n🧪 Test 3: Verificar rechazo en estado OPEN');
    try {
        await circuitBreaker.execute(successConnection);
    } catch (error) {
        console.log('✅ Test 3 completado: Circuit Breaker rechazó en estado OPEN');
    }

    // Test 4: Esperar a que el Circuit Breaker se recupere
    console.log('\n🧪 Test 4: Recuperación del Circuit Breaker');
    console.log('Esperando 5 segundos para que el Circuit Breaker se recupere...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
        await circuitBreaker.execute(successConnection);
        console.log('✅ Test 4 completado: Circuit Breaker se recuperó y aceptó la conexión');
    } catch (error) {
        console.log('❌ Test 4 falló: El Circuit Breaker no se recuperó como se esperaba');
    }

    // Test 5: Probar successful retry
    console.log('\n🧪 Test 5: Retry exitoso');
    let count = 0;
    await retry(async () => {
        count++;
        if (count < 2) throw new Error('Error simulado');
        return 'éxito';
    }, 3, 1000);
    console.log('✅ Test 5 completado: Retry exitoso después de un fallo');
}

// Ejecutar los tests
console.log('Iniciando tests de resiliencia...');
testResilience()
    .then(() => console.log('\n✅ Tests completados'))
    .catch(error => console.error('\n❌ Error en los tests:', error))
    .finally(() => console.log('\nFin de los tests'));


    