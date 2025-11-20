import { Injectable, ErrorHandler, Injector, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

/*
 File: src/app/core/http/error-handler.service.ts
 A small, reusable HTTP error handler service for Angular.
*/


/**
 * Use in HTTP pipes:
 *   .pipe(catchError(httpErrorHandler.handleError('getItems')))
 *
 * It also exposes handleUncaughtError for global ErrorHandler integration.
 */
@Injectable({ providedIn: 'root' })
export class HttpErrorHandlerService {
    constructor() {}

    /**
     * Returns an operator function that can be passed to catchError.
     * It logs the error and returns an Observable that errors with a friendly message.
     */
    handleError<T>(operation = 'operation') {
        return (error: unknown): Observable<T> => {
            const message = this.getFriendlyMessage(error);
            this.logError(operation, message, error);
            // propagate a plain Error to callers (can be adapted to return safe fallback value)
            return throwError(() => new Error(message));
        };
    }

    /**
     * Handle non-HTTP uncaught errors (useful for a global ErrorHandler).
     * This will log the error and produce a human readable message.
     */
    handleUncaughtError(error: unknown): void {
        const message = this.getFriendlyMessage(error);
        this.logError('UncaughtError', message, error);
        // You could send the error to remote logging infrastructure here.
    }

    private getFriendlyMessage(error: unknown): string {
        if (error instanceof HttpErrorResponse) {
            // Server or connection error happened
            if (error.error instanceof ErrorEvent) {
                // Client-side / network error
                return `Network error: ${error.error.message || 'connection issue'}`;
            }
            // Backend returned an unsuccessful response code.
            const status = error.status || 'unknown';
            const statusText = error.statusText ? ` ${error.statusText}` : '';
            // Try to extract message from server payload if present
            let serverMessage = '';
            try {
                if (error.error && typeof error.error === 'object') {
                    serverMessage = (error.error.message || error.error.error || '').toString();
                } else if (typeof error.error === 'string') {
                    serverMessage = error.error;
                }
            } catch {
                serverMessage = '';
            }
            return serverMessage
                ? `Server error (${status}): ${serverMessage}`
                : `Server error (${status})${statusText}`;
        }

        if (error instanceof Error) {
            return `Error: ${error.message}`;
        }

        // Fallback for unknown shapes
        try {
            return `Unexpected error: ${JSON.stringify(error)}`;
        } catch {
            return 'Unexpected error';
        }
    }

    private logError(operation: string, message: string, raw?: unknown): void {
        // Central logging point - replace with a real logger if available
        console.error(`[${operation}] ${message}`, raw);
    }
}

/**
 * Optional: Global Angular ErrorHandler that delegates to HttpErrorHandlerService.
 * Provide this class in AppModule providers if you want automatic capture of uncaught errors:
 *   { provide: ErrorHandler, useClass: GlobalErrorHandler }
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private injector: Injector, private zone: NgZone) {}

    handleError(error: unknown): void {
        // Avoid cyclic injection by fetching service via injector
        const handler = this.injector.get(HttpErrorHandlerService);
        // run inside Angular zone to ensure UI updates (if any) happen properly
        this.zone.run(() => handler.handleUncaughtError(error));
        // also print to console as a fallback
        // eslint-disable-next-line no-console
        console.error('GlobalErrorHandler captured an error', error);
    }
}