import API from "../../API"
import Resolvable from "../../type/interface/Resolvable"
import Snapshot from "../Snapshot"
import getSnapshot from "../../method/snapshots/getSnapshot"

class SnapshotResolvable implements Resolvable<Snapshot> {
	public id: string

	constructor(id: string) {
		this.id = id
	}

	public async resolve(api: API, allowCache?: boolean): Promise<Snapshot> {
		const snapshot = await getSnapshot(api, this.id, allowCache)
		if (!snapshot) throw new Error("Snapshot not found")

		return snapshot
	}
}

export default SnapshotResolvable