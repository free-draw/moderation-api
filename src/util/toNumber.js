function toNumber(value) {
	if (value instanceof Date) {
		return value.getTime()
	} else {
		return parseInt(value)
	}
}

module.exports = toNumber