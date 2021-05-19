const mongoose = require("mongoose")
const plugin = require("fastify-plugin")

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
	const connection = await connectMongoose(process.env.DATABASE)
	fastify.decorate("mongoose", connection)
}

module.exports = plugin(MongoosePlugin, {
	name: "plugin-mongoose",
})