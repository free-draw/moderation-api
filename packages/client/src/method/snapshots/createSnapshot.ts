import { SnapshotData } from "../.."
import API from "../../API"
import SnapshotResolvable from "../../class/resolvable/SnapshotResolvable"

type CreateSnapshotResponse = {
	snapshotId: string,
}

async function createSnapshot(api: API, options: Omit<SnapshotData, "id">): Promise<SnapshotResolvable> {
	const { data } = await api.request<CreateSnapshotResponse>({
		url: "/snapshots",
		method: "POST",
		data: options,
	})

	return new SnapshotResolvable(data.snapshotId)
}

export default createSnapshot