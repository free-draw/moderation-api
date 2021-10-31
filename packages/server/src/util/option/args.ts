import yargs from "yargs"
import { hideBin } from "yargs/helpers"

type Args = {
	verbose: number,
}

const args = yargs(hideBin(process.argv))
	.option("verbose", {
		alias: "v",
		type: "count",
	})
	.parse()

export default args as Args