const mongoose = require("mongoose")
const plugin = require("fastify-plugin")

const host = process.env.MONGODB_HOST
const database = process.env.MONGODB_DATABASE
const user = process.env.MONGODB_USER
const password = process.env.MONGODB_PASSWORD

function connectMongoose(url) {
	return new Promise((resolve, reject) => {
		mongoose.connect(url, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		})

		mongoose.connection.once("open", resolve)
		mongoose.connection.on("error", reject)

		return mongoose.connection
	})
}

async function MongoosePlugin(fastify) {
	const url = `mongodb://${user}:${password}@${host}/${database}?authSource=admin&tls=false&ssl=false`
	const connection = await connectMongoose(url)
	fastify.decorate("mongoose", connection)
}

module.exports = plugin(MongoosePlugin, {
	name: "plugin-mongoose",
})