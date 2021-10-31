import { Document } from "mongoose"

function getDocumentId<T>(value: Document | T): T {
	if (value instanceof Document) {
		return value._id
	} else {
		return value
	}
}

export default getDocumentId