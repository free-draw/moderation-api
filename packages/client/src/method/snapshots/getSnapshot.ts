import API from "../../API"
import Snapshot, { SnapshotData } from "../../class/Snapshot"

type GetSnapshotResponse = {
	snapshot: SnapshotData,
}

async function getSnapshot(api: API, id: string): Promise<Snapshot | null> {
	const { data } = await api.request<GetSnapshotResponse>({
		url: `/snapshots/${id}`,
		method: "GET",
	})

	return new Snapshot(data.snapshot)
}

export default getSnapshot