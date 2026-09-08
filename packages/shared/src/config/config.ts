import { configSchema, Env } from '../schemas/config/config.schemas';

function parseEnv(): Env {
    const result = configSchema.safeParse(process.env)
  
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
        .join('\n')
      throw new Error(`Variables d'environnement invalides :\n${issues}`)
    }
  
    return result.data
  }
  
export const env: Env = parseEnv()