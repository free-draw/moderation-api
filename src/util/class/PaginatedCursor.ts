import { Document, EnforceDocument, Model, QuerySelector } from "mongoose"
import NavigationDirection from "../../types/enum/NavigationDirection"
import SortDirection from "../../types/enum/SortDirection"
import clearUndefinedFields from "../clearUndefinedFields"
import toNumber from "../toNumber"

const sortMap = {
	[SortDirection.ASCENDING]: "ascending",
	[SortDirection.DESCENDING]: "descending",
}

type PaginatedCursorFilter = {
	[property: string]: any,
}

type PaginatedCursorOptions = {
	sortProperty: string,
	sortDirection: SortDirection,
	pageSize: number,
	filter: PaginatedCursorFilter,
}

type PaginatedCursorState = {
	pageIndex: number,
	rangeStart: number | null,
	rangeEnd: number | null,
	initialized: boolean,
}

type PaginatedCursorData = {
	options: PaginatedCursorOptions,
	state: PaginatedCursorState,
}

class PaginatedCursor<M extends Model<any>, D extends Document<any>> {
	public model: M
	public options: PaginatedCursorOptions
	public state: PaginatedCursorState

	constructor(model: M, options: PaginatedCursorOptions, state?: PaginatedCursorState) {
		this.model = model
		this.options = options
		this.state = state ?? {
			pageIndex: 0,
			rangeStart: null,
			rangeEnd: null,
			initialized: false,
		}
	}

	static from<M extends Model<any>, D extends Document<any>>(model: M, data: PaginatedCursorData): PaginatedCursor<M, D> {
		return new PaginatedCursor(model, data.options, data.state)
	}

	public serialize(): PaginatedCursorData {
		return {
			options: this.options,
			state: this.state,
		}
	}

	// Navigation

	private async navigate(direction: NavigationDirection): Promise<D[]> {
		const { model, options, state } = this

		let propertyFilter = {} as QuerySelector<any>
		if (this.state.initialized) {
			// If there's an existing filter for the sort property, apply it to propertyFilter
			const existingPropertyFilter = options.filter[options.sortProperty]
			if (existingPropertyFilter) propertyFilter = { ...existingPropertyFilter }

			const inverted = options.sortDirection === SortDirection.DESCENDING
			const rangeStart = state.rangeStart as number
			const rangeEnd = state.rangeEnd as number

			if (inverted ? direction === NavigationDirection.PREVIOUS : direction === NavigationDirection.NEXT) {
				propertyFilter.$gt = propertyFilter.$gt ? Math.min(rangeEnd, propertyFilter.$gt) : rangeEnd
			} else if (inverted ? direction === NavigationDirection.NEXT : direction === NavigationDirection.PREVIOUS) {
				propertyFilter.$lt = propertyFilter.$lt ? Math.max(rangeStart, propertyFilter.$lt) : rangeStart
			}
		}

		const filter = clearUndefinedFields<PaginatedCursorFilter>({
			...options.filter,
			[options.sortProperty]: propertyFilter,
		})
		const sort = {
			[options.sortProperty]: sortMap[options.sortDirection],
		}
		const results = await model.find(filter).sort(sort).limit(options.pageSize)

		if (results.length > 0) {
			const values = results.map(result => toNumber(result[options.sortProperty]))
			state.rangeStart = Math.min(...values)
			state.rangeEnd = Math.max(...values)
			state.initialized = true
		} else {
			if (direction === NavigationDirection.NEXT) {
				state.rangeStart = state.rangeEnd
			} else if (direction === NavigationDirection.PREVIOUS) {
				state.rangeEnd = state.rangeStart
			}
		}

		if (direction === NavigationDirection.NEXT) {
			state.pageIndex += 1
		} else if (direction === NavigationDirection.PREVIOUS) {
			state.pageIndex -= 1
		}

		return results
	}

	public next(): Promise<D[]> {
		return this.navigate(NavigationDirection.NEXT)
	}

	public previous(): Promise<D[]> {
		return this.navigate(NavigationDirection.PREVIOUS)
	}
}

export default PaginatedCursor
export {
	PaginatedCursorOptions,
	PaginatedCursorData,
	PaginatedCursorFilter,
}