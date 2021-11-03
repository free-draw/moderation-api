import API from "../../API"
import Snapshot, { SnapshotData } from "../../class/Snapshot"

type GetSnapshotResponse = {
	snapshot: SnapshotData,
}

async function getSnapshot(api: API, snapshotId: string): Promise<Snapshot> {
	const { data } = await api.request<GetSnapshotResponse>({
		url: `/snapshots/${snapshotId}`,
		method: "GET",
	})

	return new Snapshot(data.snapshot)
}

export default getSnapshot