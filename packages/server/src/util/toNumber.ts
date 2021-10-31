type NumberLike = number | string | Date

function toNumber(value: NumberLike): number {
	if (value instanceof Date) {
		return value.getTime()
	} else if (typeof value == "string") {
		return parseInt(value)
	} else {
		return value
	}
}

export default toNumber