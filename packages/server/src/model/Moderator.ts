import { Schema, model, EnforceDocument, Model } from "mongoose"
import AccountPlatform from "../types/enum/AccountPlatform"
import ModeratorData from "../types/schema/Moderator"

type ModeratorDocumentData = Omit<ModeratorData, "id">
type ModeratorDocument = EnforceDocument<ModeratorDocumentData, {
	serialize(this: ModeratorDocument): ModeratorData,
}, {}>

const ModeratorSchema = new Schema<ModeratorDocumentData>({
	name: { type: String, required: true },
	active: { type: Boolean, default: true },
	accounts: {
		type: [
			{
				platform: { type: String, enum: Object.keys(AccountPlatform), required: true },
				id: { type: Schema.Types.Mixed, required: true },
			}
		],
		required: true,
	},
	permissions: { type: [ String ], required: true },
}, {
	collection: "moderators",
})

ModeratorSchema.index({ name: 1 })
ModeratorSchema.index({ "accounts.platform": 1, "accounts.id": 1 })

ModeratorSchema.static("findByAccount", async function(platform: AccountPlatform, id: any): Promise<ModeratorDocument | null> {
	return await this.findOne({
		accounts: {
			$elemMatch: { platform, id },
		},
	}) ?? null
})

ModeratorSchema.method("serialize", function(this: ModeratorDocument): ModeratorData {
	return {
		id: this._id.toString(),
		name: this.name,
		active: this.active,
		accounts: this.accounts,
		permissions: this.permissions,
	}
})

interface ModeratorModel extends Model<ModeratorDocument> {
	findByAccount(platform: AccountPlatform, id: any): Promise<ModeratorDocument | null>,
}

export default model("Moderator", ModeratorSchema) as ModeratorModel
export { ModeratorDocument }