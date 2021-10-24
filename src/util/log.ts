import pino from "pino"
import args from "./option/args"
import env from "./option/env"

export default pino({
	level: args.verbose > 0 ? "debug" : "info",
	prettyPrint: env.env !== "production",
})