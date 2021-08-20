const lodash = require("lodash")
const clean = require("../util/clean")

const SortDirection = require("../enum/SortDirection")
const NavigationAction = require("../enum/NavigationAction")

const sortMap = {
	[SortDirection.ASCENDING]: 1,
	[SortDirection.DESCENDING]: -1,
}

function toNumber(value) {
	if (value instanceof Date) {
		return value.getTime()
	} else {
		return parseInt(value)
	}
}

class PaginatedCursor {
	/*
		{
			options: {
				pageSize: number,
				sortProperty: string,
				sortDirection: SortDirection,
				filter: {
					[string]: any,
				},
			},
			state: {
				pageIndex: number,
				initialized: boolean,
				rangeStart: number,
				rangeEnd: number,
			},
		}
	*/

	constructor(model, data) {
		this.model = model
		this.options = data.options
		this.state = data.state
	}

	static create(model, options) {
		return new PaginatedCursor(model, {
			options,
			state: {
				pageIndex: 0,
				rangeStart: null,
				rangeEnd: null,
				initialized: false,
			}
		})
	}

	// Pages

	async navigate(action) {
		const { model, options, state } = this

		const existingPropertyFilter = options.filter[options.sortProperty]

		let propertyFilter
		if (state.initialized) {
			propertyFilter = existingPropertyFilter ? { ...existingPropertyFilter } : {}

			const invertAction = options.sortDirection === SortDirection.DESCENDING
			if (invertAction ? action === NavigationAction.PREVIOUS : action === NavigationAction.NEXT) {
				propertyFilter.$gt = propertyFilter.$gt ? Math.min(rangeValue, propertyFilter.$gt) : rangeValue
			} else if (invertAction ? action === NavigationAction.NEXT : action === NavigationAction.PREVIOUS) {
				propertyFilter.$lt = propertyFilter.$lt ? Math.max(state.rangeStart, propertyFilter.$lt) : state.rangeStart
			}
		}

		const results = await model
			.find(clean({ ...options.filter, [options.sortProperty]: propertyFilter }))
			.sort({ [options.sortProperty]: sortMap[options.sortDirection] })
			.limit(options.pageSize)

		if (results.length > 0) {
			const values = results.map(result => toNumber(result[options.sortProperty]))
			state.rangeStart = lodash.min(values)
			state.rangeEnd = lodash.max(values)
			state.initialized = true
		} else {
			if (action === NavigationAction.NEXT) {
				state.rangeStart = state.rangeEnd
			} else if (action === NavigationAction.PREVIOUS) {
				state.rangeEnd = state.rangeStart
			}
		}

		if (action === NavigationAction.NEXT) {
			state.pageIndex += 1
		} else if (action === NavigationAction.PREVIOUS) {
			state.pageIndex -= 1
		}

		return results
	}

	next() {
		return this.navigate(NavigationAction.NEXT)
	}

	previous() {
		return this.navigate(NavigationAction.PREVIOUS)
	}

	// Serialization

	serialize() {
		return {
			options: this.options,
			state: this.state,
		}
	}
}

module.exports = PaginatedCursor