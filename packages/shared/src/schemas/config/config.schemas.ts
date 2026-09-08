import { z } from 'zod';

export const configSchema = z.object({
    env: z.enum(['development', 'production', 'test']),
    port: z.number().default(3000),
    postgresqlUrl: z.string().url(),
    postgresqlUrlTest: z.string().url(),
    mongodbUrl: z.string().url(),
    jwtSecret: z.string().min(32),
    jwtAccessTokenExpiresIn: z.string().default('15m'),
    jwtRefreshTokenExpiresIn: z.string().default('7d'),
    jwtResetPasswordTokenExpiresIn: z.string().default('15m'),
    smtpHost: z.string().url(),
    smtpPort: z.number().default(587),
    smtpUsername: z.string(),
    smtpPassword: z.string(),
});

export type Env = z.infer<typeof configSchema>
