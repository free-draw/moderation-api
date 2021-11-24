import { Schema, model, EnforceDocument, Model, Types } from "mongoose"
import ActionType from "../types/enum/ActionType"
import { ActionData, ActionOptions } from "../types/schema/Action"
import UserData from "../types/schema/User"
import ObjectId from "../types/ObjectId"
import { RefOptional } from "../types/util/Ref"
import getDocumentId from "../util/getDocumentId"
import toDate from "../util/toDate"

type ActionDocumentData = RefOptional<Omit<ActionData, "id">, "snapshot" | "report" | "moderator">
type ActionDocument = EnforceDocument<ActionDocumentData, {
	serialize(this: ActionDocument): ActionData,
}, {}>

const ActionSchema = new Schema<ActionDocumentData>({
	type: { type: String, enum: Object.keys(ActionType), required: true },
	active: { type: Boolean, default: true },
	created: { type: Date, default: () => new Date() },
	expiry: { type: Date },
	reason: { type: String, required: true },
	notes: { type: String },
	snapshot: { type: Schema.Types.ObjectId, ref: "Snapshot" },
	report: { type: Schema.Types.ObjectId, ref: "Report" },
	moderator: { type: Schema.Types.ObjectId, ref: "Moderator" },
})

ActionSchema.post("init", function(this: ActionDocument): void {
	if (this.active && this.expiry && Date.now() > this.expiry.getTime()) {
		this.active = false
	}
})

ActionSchema.method("serialize", function(this: ActionDocument): ActionData {
	return {
		id: this._id.toString(),
		active: this.active,
		type: this.type,
		created: this.created,
		expiry: this.expiry,
		reason: this.reason,
		notes: this.notes,
		snapshot: getDocumentId<Types.ObjectId | undefined>(this.snapshot)?.toString(),
		report: getDocumentId<Types.ObjectId | undefined>(this.report)?.toString(),
		moderator: getDocumentId<Types.ObjectId | undefined>(this.moderator)?.toString(),
	}
})

type UserDocumentData = Omit<UserData, "id" | "actions"> & { _id: number, actions: Types.DocumentArray<ActionDocument> }
type UserDocument = EnforceDocument<UserDocumentData, {
	createAction(this: UserDocument, options: ActionOptions, identity?: ObjectId): ActionDocument,
	serialize(this: UserDocument): UserData,
}, {}>

const UserSchema = new Schema<UserDocumentData>({
	_id: Number,
	actions: { type: [ ActionSchema ], required: true },
}, {
	collection: "users",
})

UserSchema.static("get", async function(id: number | string): Promise<UserDocument> {
	if (typeof id === "string") id = parseInt(id)

	let user = await this.findById(id) as UserDocument | undefined

	if (!user) {
		user = new this({
			_id: id,
			actions: [],
		}) as UserDocument
	}

	return user
})

UserSchema.static("ensure", function(id: number | string, user?: UserDocument): UserDocument {
	if (!user) {
		user = new this({
			_id: id,
			actions: [],
		}) as UserDocument
	}

	return user
})

UserSchema.method("createAction", function(this: UserDocument, options: ActionOptions, identity?: ObjectId): ActionDocument {
	let expiry: Date | undefined

	if (options.expiry) {
		expiry = toDate(options.expiry)
	} else if (options.duration) {
		expiry = new Date(Date.now() + options.duration * 1000)
	}

	const action = this.actions.create({
		type: options.type,
		active: true,
		expiry: expiry,
		reason: options.reason,
		notes: options.notes,
		snapshot: options.snapshot,
		report: options.report,
		moderator: identity,
	})

	this.actions.push(action)

	return action
})

UserSchema.method("serialize", function(this: UserDocument): UserData {
	return {
		id: this._id.toString(),
		actions: this.actions.map((action: ActionDocument) => action.serialize()),
	}
})

interface UserModel extends Model<UserDocument> {
	get(id: number | string): Promise<UserDocument>,
	ensure(id: number | string, user?: UserDocument): UserDocument,
}

export default model("User", UserSchema) as UserModel
export { ActionDocument, UserDocument }