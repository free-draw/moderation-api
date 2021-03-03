require("make-promises-safe")

const path = require("path")
const dotenv = require("dotenv")

dotenv.config({
	path: path.join(__dirname, ".env"),
})

require("./src")