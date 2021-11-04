import Vector2 from "../primitive/Vector2"
import SnapshotLogType from "../enum/SnapshotLogType"
import { parse, ParsedFile } from "../saveFormat"
import { Base64 } from "js-base64"
import getRobloxUser from "../method/roblox/getRobloxUser"
import API from "../API"

type SnapshotPlayerData = {
	userId: number,
	position: {
		x: number,
		y: number,
	},
}

type SnapshotLogData = {
	userId: number,
	type: SnapshotLogType,
	data: any,
}

type SnapshotCanvasData = {
	userId: number,
	data: string,
}

type SnapshotData = {
	id: string,
	players: SnapshotPlayerData[],
	logs: SnapshotLogData[],
	canvas: SnapshotCanvasData[],
}

class SnapshotPlayer {
	public id: number
	public name?: string
	public position: Vector2

	constructor(data: SnapshotPlayerData) {
		this.id = data.userId
		this.position = new Vector2(data.position.x, data.position.y)
	}

	public async fetchName(api: API): Promise<string> {
		if (!this.name) {
			const user = await getRobloxUser(api, this.id)
			this.name = user.name
		}

		return this.name
	}
}

class SnapshotLog {
	public player: SnapshotPlayer
	public type: SnapshotLogType
	public data: any

	constructor(player: SnapshotPlayer, data: SnapshotLogData) {
		this.player = player
		this.type = data.type
		this.data = data.data
	}
}

class SnapshotCanvas {
	public player: SnapshotPlayer
	public data?: ParsedFile
	public rawData: Uint8Array

	constructor(player: SnapshotPlayer, data: SnapshotCanvasData) {
		this.player = player
		this.rawData = Base64.toUint8Array(data.data)
	}

	public parse(): void {
		this.data = parse(this.rawData)
	}
}

class Snapshot {
	public id: string
	public players: Record<number, SnapshotPlayer>
	public logs: SnapshotLog[]
	public canvas: Record<number, SnapshotCanvas>

	constructor(data: SnapshotData) {
		this.id = data.id

		this.players = {}
		data.players.forEach((playerData) => {
			this.players[playerData.userId] = new SnapshotPlayer(playerData)
		})

		this.logs = data.logs.map(logData => new SnapshotLog(this.players[logData.userId], logData))

		this.canvas = {}
		data.canvas.forEach((canvasData) => {
			this.canvas[canvasData.userId] = new SnapshotCanvas(this.players[canvasData.userId], canvasData)
		})
	}

	public async fetchPlayerNames(api: API): Promise<void> {
		await Promise.all(
			Object.values(this.players).map((player) => player.fetchName(api))
		)
	}
}

export default Snapshot
export { SnapshotData }