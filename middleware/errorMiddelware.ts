import type { Request, Response } from 'express';

export const errorMiddleware = (err: any, req: Request, res: Response, next: any) => {
    try {
        let error = { ...err };
        error.message = err.message;
        console.log(err.stack);
        console.log(err);
        console.log(err.message);

        if (err.name === 'CastError') {
            const message = `Resource not found. Invalid: ${err.path}`;
            error = new Error(message);
            error.statusCode = 404;
        }
        if (err.code === 11000) {
            const message = `Duplicate field value entered: ${err.keyValue.name}`;
            error = new Error(message);
            error.statusCode = 400;
        }
        if (err.name === 'ValidationError') {
            const message: any = Object.values(err.errors).map((val: any) => val.message);
            error = new Error(message);
            error.statusCode = 400;
        }
        if (err.name === 'JsonWebTokenError') {
            const message = 'Invalid token';
            error = new Error(message);
            error.statusCode = 401;
        }
        if (err.name === 'TokenExpiredError') {
            const message = 'Token expired';
            error = new Error(message);
            error.statusCode = 401;
        }
        if (err.name === 'MulterError') {
            const message = err.message;
            error = new Error(message);
            error.statusCode = 400;
        }
        if (err.name === 'TypeError') {
            const message = 'Type error';
            error = new Error(message);
            error.statusCode = 400;
        }
        if (err.name === 'ReferenceError') {
            const message = 'Reference error';
            error = new Error(message);
            error.statusCode = 400;
        }
        if (err.name === 'SyntaxError') {
            const message = 'Syntax error';
            error = new Error(message);
            error.statusCode = 400;
        }
        if (err.name === 'Error') {
            const message = 'Error';
            error = new Error(message);
            error.statusCode = 400;
        }
        if (err.name === 'RangeError') {
            const message = 'Range error';
            error = new Error(message);
            error.statusCode = 400;
        }
        if (err.name === 'EvalError') {
            const message = 'Eval error';
            error = new Error(message);
            error.statusCode = 400;
        }
        if (err.name === 'URIError') {
            const message = 'URI error';
            error = new Error(message);
            error.statusCode = 400;
        }
        if (err.name === 'InternalServerError') {
            const message = 'Internal server error';
            error = new Error(message);
            error.statusCode = 500;
        }
        if (err.name === 'NotFoundError') {
            const message = 'Not found error';
            error = new Error(message);
            error.statusCode = 404;
        }
        if (err.name === 'BadRequestError') {
            const message = 'Bad request error';
            error = new Error(message);
            error.statusCode = 400;
        }
        if (err.name === 'UnauthorizedError') {
            const message = 'Unauthorized error';
            error = new Error(message);
            error.statusCode = 401;
        }
        if (err.name === 'ForbiddenError') {
            const message = 'Forbidden error';
            error = new Error(message);
            error.statusCode = 403;
        }
        if (err.name === 'MethodNotAllowedError') {
            const message = 'Method not allowed error';
            error = new Error(message);
            error.statusCode = 405;
        }
        if (err.name === 'NotAcceptableError') {
            const message = 'Not acceptable error';
            error = new Error(message);
            error.statusCode = 406;
        }
        if (err.name === 'ConflictError') {
            const message = 'Conflict error';
            error = new Error(message);
            error.statusCode = 409;
        }
        if (err.name === 'GoneError') {
            const message = 'Gone error';
            error = new Error(message);
            error.statusCode = 410;
        }
        if (err.name === 'LengthRequiredError') {
            const message = 'Length required error';
            error = new Error(message);
            error.statusCode = 411;
        }
        if (err.name === 'PreconditionFailedError') {
            const message = 'Precondition failed error';
            error = new Error(message);
            error.statusCode = 412;
        }
        if (err.name === 'PayloadTooLargeError') {
            const message = 'Payload too large error';
            error = new Error(message);
            error.statusCode = 413;
        }
        if (err.name === 'UnsupportedMediaTypeError') {
            const message = 'Unsupported media type error';
            error = new Error(message);
            error.statusCode = 415;
        }
        if (err.name === 'UnprocessableEntityError') {
            const message = 'Unprocessable entity error';
            error = new Error(message);
            error.statusCode = 422;
        }
        if (err.name === 'LockedError') {
            const message = 'Locked error';
            error = new Error(message);
            error.statusCode = 423;
        }
        if (err.name === 'FailedDependencyError') {
            const message = 'Failed dependency error';
            error = new Error(message);
            error.statusCode = 424;
        }

        error.statusCode = error.statusCode || 500;

        res.status(error.statusCode).json({
            success: false,
            message: error.message || 'Server Error',
        });
    } catch (error) {
        
    }
}