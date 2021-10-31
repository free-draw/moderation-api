import API from "../../API"

interface Resolvable<T> {
	resolve(api: API): Promise<T | null>,
}

export default Resolvable