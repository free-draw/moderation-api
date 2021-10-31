import pino from "pino"
import args from "./option/args"

export default pino({
	level: args.verbose > 0 ? "debug" : "info",
})