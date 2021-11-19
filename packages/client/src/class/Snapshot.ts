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

class SnapshotPlayerPartial {
	public id: number
	public name?: string

	constructor(id: number) {
		this.id = id
	}

	public async fetchData(api: API): Promise<string> {
		if (!this.name) {
			const user = await getRobloxUser(api, this.id)
			this.name = user.name
		}

		return this.name
	}

	public applyDataFrom(player: SnapshotPlayerPartial): void {
		this.name = player.name
	}

	public asPlayer(position: Vector2): SnapshotPlayer {
		return new SnapshotPlayer({
			userId: this.id,
			position,
		})
	}
}

class SnapshotPlayer extends SnapshotPlayerPartial {
	public position: Vector2

	constructor(data: SnapshotPlayerData) {
		super(data.userId)
		this.position = new Vector2(data.position.x, data.position.y)
	}
}

class SnapshotLog {
	public player: SnapshotPlayer | SnapshotPlayerPartial
	public type: SnapshotLogType
	public data: any

	constructor(player: SnapshotPlayer | SnapshotPlayerPartial, data: SnapshotLogData) {
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

function collectUserIds(data: SnapshotData): number[] {
	const userIds = new Set<number>()

	for (const player of data.players) {
		userIds.add(player.userId)
	}

	for (const log of data.logs) {
		userIds.add(log.userId)
	}

	for (const canvas of data.canvas) {
		userIds.add(canvas.userId)
	}

	return [ ...userIds ]
}

class Snapshot {
	public id: string

	public players: Record<number, SnapshotPlayer>
	public logs: SnapshotLog[]
	public canvas: Record<number, SnapshotCanvas>

	private partialPlayers: Record<number, SnapshotPlayerPartial> = {}

	constructor(data: SnapshotData) {
		this.id = data.id

		collectUserIds(data).forEach((userId) => {
			this.partialPlayers[userId] = new SnapshotPlayerPartial(userId)
		})

		this.players = {}
		data.players.forEach((playerData) => {
			this.players[playerData.userId] = new SnapshotPlayer(playerData)
		})

		this.logs = data.logs.map(logData => new SnapshotLog(this.players[logData.userId] ?? this.partialPlayers[logData.userId], logData))

		this.canvas = {}
		data.canvas.forEach((canvasData) => {
			this.canvas[canvasData.userId] = new SnapshotCanvas(this.players[canvasData.userId], canvasData)
		})
	}

	public async fetchPlayerData(api: API): Promise<void> {
		await Promise.all(
			Object.values(this.partialPlayers).map((player) => player.fetchData(api))
		)

		for (const userId in this.players) {
			this.players[userId].applyDataFrom(this.partialPlayers[userId])
		}
	}
}

export default Snapshot
export {
	SnapshotPlayer,
	SnapshotLog,
	SnapshotCanvas,

	SnapshotPlayerPartial,

	SnapshotData,
	SnapshotPlayerData,
	SnapshotLogData,
	SnapshotCanvasData,
}