import { EventEmitter2, Listener } from "eventemitter2"
import { io, Socket } from "socket.io-client"
import Report, { ReportData } from "./class/Report"
import Action, { ActionData } from "./class/Action"
import UserResolvable from "./class/resolvable/UserResolvable"

type RealtimeEvents = {
	reportCreate: [ Report ],
	reportDelete: [ Report ],
	actionCreate: [ UserResolvable, Action ],
	actionDelete: [ UserResolvable, Action ],
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

		const reportEventHandler = (emitEvent: keyof RealtimeEvents) => {
			return ({ report: reportData }: { report: ReportData }) => {
				this.emit(emitEvent, new Report(reportData))
			}
		}

		const actionEventHandler = (emitEvent: keyof RealtimeEvents) => {
			return ({ userId, action: actionData }: { userId: number, action: ActionData }) => {
				const user = new UserResolvable(userId)
				this.emit(emitEvent, user, new Action(user, actionData))
			}
		}

		this.socket.on("reportCreate", reportEventHandler("reportCreate"))
		this.socket.on("reportDelete", reportEventHandler("reportDelete"))
		this.socket.on("actionCreate", actionEventHandler("actionCreate"))
		this.socket.on("actionDelete", actionEventHandler("actionDelete"))
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