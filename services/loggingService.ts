// services/loggingService.ts

type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';

interface LogPayload {
    event: string;
    level: LogLevel;
    message: string;
    context?: Record<string, any>;
}

/**
 * A centralized logging service to output structured JSON logs.
 * This makes runtime behavior machine-readable, which is ideal for
 * debugging with AI assistants.
 */
const Logger = {
    info: (event: string, message: string, context: Record<string, any> = {}) => {
        log({ event, level: 'INFO', message, context });
    },
    error: (event: string, message: string, context: Record<string, any> = {}) => {
        log({ event, level: 'ERROR', message, context });
    },
    warn: (event: string, message: string, context: Record<string, any> = {}) => {
        log({ event, level: 'WARN', message, context });
    },
    debug: (event: string, message: string, context: Record<string, any> = {}) => {
        // In a real app, this might be filtered out in production builds.
        log({ event, level: 'DEBUG', message, context });
    }
};

function log({ event, level, message, context }: LogPayload) {
    const logObject = {
        timestamp: new Date().toISOString(),
        event,
        level,
        message,
        ...context
    };

    // Outputting to the console based on level for better visibility in DevTools
    switch (level) {
        case 'ERROR':
            console.error(JSON.stringify(logObject, null, 2));
            break;
        case 'WARN':
            console.warn(JSON.stringify(logObject, null, 2));
            break;
        default:
            console.log(JSON.stringify(logObject, null, 2));
            break;
    }
}

export default Logger;
