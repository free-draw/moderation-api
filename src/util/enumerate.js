function toEnum(name, values) {
	// TODO: Do something with name

	const newEnum = {}

	if (Array.isArray(values)) {
		values.forEach(value => newEnum[value] = value)
	} else {
		Object.assign(newEnum, values)
	}

	return newEnum
}

module.exports = toEnum