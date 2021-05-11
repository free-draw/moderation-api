const path = require("path")
const fastify = require("fastify")

const AutoLoad = require("fastify-autoload")
const Helmet = require("fastify-helmet")
const Cookie = require("fastify-cookie")
const JWT = require("fastify-jwt")

async function createApp(port) {
	let app = fastify({
		logger: true,
	})

	// Register plugins
	app.register(Helmet)
	app.register(Cookie)
	app.register(JWT, { secret: process.env.SECRET })

	// Register custom plugins
	app.register(require("./plugins/mongoose"))
	app.register(require("./plugins/auth"))
	app.register(require("./plugins/identity"))

	// Register services
	app.register(AutoLoad, { dir: path.join(__dirname, "services") })

	return app.listen(port)
}

const app = createApp(80)

process.on("SIGINT", async () => {
	await app.close()
	process.exit()
})