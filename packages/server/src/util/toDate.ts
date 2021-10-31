function toDate(value: Date | number | string): Date {
	switch (typeof value) {
		case "object":
			return value
		case "number":
			return new Date(value / 1000)
		case "string":
			return new Date(value)
	}
}

export default toDate