import API from "../../API"

interface Page<T> {
	next(api: API): Promise<Page<T>>,
	previous(api: API): Promise<Page<T>>,
}

export default Page