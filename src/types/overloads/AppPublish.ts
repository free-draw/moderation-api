import Action from "../schema/Action"
import Report from "../schema/Report"

type AppPublish = {
	reportCreate: {
		report: Report,
	},

	reportDelete: {
		report: Report,
	},

	actionCreate: {
		userId: number,
		action: Action,
	},

	actionDelete: {
		userId: number,
		action: Action,
	},
}

export default AppPublish