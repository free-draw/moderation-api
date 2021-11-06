import { EventEmitter2, Listener } from "eventemitter2"
import { io, Socket } from "socket.io-client"
import Report, { ReportData } from "./class/Report"

type RealtimeEvents = {
	reportCreate: [ Report ],
	reportDelete: [ Report ],
}

interface Realtime {
	emit<E extends keyof RealtimeEvents>(event: E, ...args: RealtimeEvents[E]): boolean,
	on<E extends keyof RealtimeEvents>(event: E, callback: (...args: RealtimeEvents[E]) => void): this | Listener,
}

class Realtime extends EventEmitter2 {
	private socket: Socket

	constructor(url: string, token: string) {
		super()

		this.socket = io(url, {
			autoConnect: false,
			auth: { token },
		})

		this.socket.on("reportCreate", ({ report: reportData }: { report: ReportData }) => {
			this.emit("reportCreate", new Report(reportData))
		})

		this.socket.on("reportDelete", ({ report: reportData }: { report: ReportData }) => {
			this.emit("reportDelete", new Report(reportData))
		})
	}

	public connect(): Promise<void> {
		return new Promise((resolve) => {
			this.socket.once("connect", resolve)
			this.socket.connect()
		})
	}

	public disconnect() {
		return new Promise((resolve) => {
			this.socket.once("disconnect", resolve)
			this.socket.disconnect()
		})
	}
}

export default Realtime