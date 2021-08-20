function getObjectId(data) {
	if (data) {
		return data._id ?? data
	}

	return null
}

module.exports = getObjectId