import { Schema } from "mongoose"

type Replace<T, K extends keyof any, V> = Omit<T, K> & { [P in K]: V }

type Ref<T, K extends keyof any> = Replace<T, K, Schema.Types.ObjectId>
type RefOptional<T, K extends keyof any> = Replace<T, K, Schema.Types.ObjectId | undefined>

export default Ref
export { Ref, RefOptional }