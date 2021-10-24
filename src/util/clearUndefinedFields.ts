function clearUndefinedFields<T extends { [key: string]: any }>(input: T): T {
	const output = {} as T

	for (const key in input) {
		const value = input[key]

		if (value !== undefined) {
			output[key] = value
		}
	}

	return output
}

export default clearUndefinedFields