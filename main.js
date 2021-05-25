require("make-promises-safe")

if (process.env.NODE_ENV === "development") {
	const path = require("path")
	const dotenv = require("dotenv")

	dotenv.config({
		path: path.join(__dirname, ".env"),
	})
}

require("./src")