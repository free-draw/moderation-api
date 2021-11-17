import API from "../../API"
import Snapshot, { SnapshotData } from "../../class/Snapshot"
import Resource from "../../Resource"

type GetSnapshotsBulkResponse = {
	snapshots: SnapshotData[],
}

const SnapshotResource = new Resource<string, Snapshot, API>(async (snapshotIds, api) => {
	const { data } = await api.request<GetSnapshotsBulkResponse>({
		url: "/bulk/snapshots",
		method: "POST",
		data: {
			snapshotIds: Object.values(snapshotIds),
		},
	})

	const snapshots = {} as Record<string, Snapshot>
	for (const snapshotData of data.snapshots) {
		snapshots[snapshotData.id] = new Snapshot(snapshotData)
	}
	return snapshots
})

async function getSnapshot(api: API, snapshotId: string, allowCache?: boolean): Promise<Snapshot | null> {
	return await SnapshotResource.request(api, snapshotId, snapshotId, !allowCache) ?? null
}

export default getSnapshot