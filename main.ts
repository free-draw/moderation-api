require("make-promises-safe")

if (process.env.NODE_ENV === "development") {
	const path = require("path")
	const dotenv = require("dotenv")

	dotenv.config({
		path: path.resolve(__dirname, ".env"),
	})
}

require("./src")