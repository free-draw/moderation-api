const enumerate = require("../util/enumerate")

const NavigationAction = enumerate("NavigationAction", [
	"NEXT",
	"PREVIOUS",
])

module.exports = NavigationAction