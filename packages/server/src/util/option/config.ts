import path from "path"
import root from "app-root-path"
import env from "./env"
import Permission from "../../types/Permission"

type Config = {
	permissions: { [name: string]: Permission[] },
}

const file = env.configFile ?? path.resolve(root.path, "config.json")
const config = require(file)

export default config as Config