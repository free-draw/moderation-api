function clean(object) {
	const newObject = {}

	for (const key in object) {
		const value = object[key]
		if (value !== undefined) {
			newObject[key] = value
		}
	}

	return newObject
}

module.exports = clean