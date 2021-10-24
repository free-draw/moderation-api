type Environment = {
	configFile?: string,
	address?: string,
	port?: number,
	env?: string,

	redisUrl: string,
	mongodbUrl: string,

	discordClientId: string,
	discordClientSecret: string,
	discordRedirectUrl: string,

	jwtSecret: string,
}

function getEnvironmentVariable(name: string, required: true): string | never
function getEnvironmentVariable(name: string, required?: false): string | undefined
function getEnvironmentVariable(name: string, required?: boolean): string | undefined | never {
	const value = process.env[name]
	if (required && !value) throw new Error(`Environment variable "${name}" is required`)
	return value
}

const env = {
	configFile: getEnvironmentVariable("CONFIG_FILE", false),
	address: getEnvironmentVariable("ADDRESS", false),
	port: getEnvironmentVariable("PORT", false),
	env: getEnvironmentVariable("NODE_ENV", false),

	redisUrl: getEnvironmentVariable("REDIS_URL", true),
	mongodbUrl: getEnvironmentVariable("MONGODB_URL", true),

	discordClientId: getEnvironmentVariable("DISCORD_CLIENT_ID", true),
	discordClientSecret: getEnvironmentVariable("DISCORD_CLIENT_SECRET", true),
	discordRedirectUrl: getEnvironmentVariable("DISCORD_REDIRECT_URL", true),

	jwtSecret: getEnvironmentVariable("JWT_SECRET", true),
} as Environment

export default env