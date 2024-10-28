
class CircuitBreaker {
    constructor(failureThreshold = 5, resetTimeout = 30000) {
        this.failureThreshold = failureThreshold;
        this.resetTimeout = resetTimeout;
        this.failures = 0;
        this.state = 'CLOSED';
        this.lastFailureTime = null;
    }

    async execute(operation) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
                this.state = 'HALF-OPEN';
            } else {
                throw new Error('Circuit Breaker is OPEN');
            }
        }

        try {
            const result = await operation();
            if (this.state === 'HALF-OPEN') {
                this.reset();
            }
            return result;
        } catch (error) {
            this.recordFailure();
            throw error;
        }
    }

    recordFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
            console.log('Circuit Breaker changed to OPEN state');
        }
    }

    reset() {
        this.failures = 0;
        this.state = 'CLOSED';
        this.lastFailureTime = null;
    }
}

async function retry(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            console.error(`Intento ${attempt} fallido:`, error.message);
            
            if (attempt < maxRetries) {
                const waitTime = delay * Math.pow(2, attempt - 1); // Exponential backoff
                console.log(`Esperando ${waitTime}ms antes del siguiente intento...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    
    throw lastError;
}

module.exports = { CircuitBreaker, retry };