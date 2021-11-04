import { Parser } from "binary-parser"

import Vector2 from "./primitive/Vector2"
import Color3 from "./primitive/Color3"

type LineData = {
	type: number,
	color: number,
	thickness: number,
	transparency: number,
	pointCount: number,
	initialX: number,
	initialY: number,
	offsets: {
		x: number,
		y: number,
	}[],
}

type ParsedLine = {
	type: number,
	options: {
		color: Color3,
		thickness: number,
		transparency: number,
	},
	points: Vector2[],
}

const Line = new Parser()
	.endianess("little")
	.uint8("type")
	.bit24("color")
	.uint8("thickness")
	.uint8("transparency")
	.uint16("pointCount")
	.doublele("initialX")
	.doublele("initialY")
	.array("offsets", {
		type: new Parser().floatle("x").floatle("y"),
		length: function(this: LineData) {
			return this.pointCount - 1
		},
	})

type LayerData = {
	nameLength: number,
	name: string,
	visible: number,
	lineCount: number,
	lines: LineData[],
}

type ParsedLayer = {
	name: string,
	visible: boolean,
	lines: ParsedLine[],
}

const Layer = new Parser()
	.endianess("little")
	.uint8("nameLength")
	.string("name", {
		length: "nameLength",
	})
	.uint8("visible")
	.uint64("lineCount")
	.array("lines", {
		type: Line,
		length: "lineCount",
	})

type FileData = {
	header: string,
	version: number,
	layerCount: number,
	layers: LayerData[],
}

type ParsedFile = {
	layers: ParsedLayer[],
}

const File = new Parser()
	.endianess("little")
	.string("header", {
		length: 8,
	})
	.uint8("version")
	.uint8("layerCount").array("layers", {
		type: Layer,
		length: "layerCount",
	})

export function parse(buffer: Buffer | Uint8Array): ParsedFile {
	const data = parseRaw(buffer)

	const layers = data.layers.map((layerData, index) => {
		return {
			index,
			name: layerData.name,
			visible: layerData.visible === 1 ? true : false,
			lines: layerData.lines.map((lineData) => {
				const points = []

				let currentPoint = new Vector2(lineData.initialX, lineData.initialY)
				points.push(currentPoint)

				for (let index = 0; index < lineData.offsets.length; index++) {
					const offset = lineData.offsets[index]
					currentPoint = currentPoint.add(new Vector2(offset.x, offset.y))
					points.push(currentPoint)
				}

				return {
					points: points,
					options: {
						color: Color3.fromDecimal(lineData.color),
						thickness: lineData.thickness / 100,
						transparency: lineData.transparency / 100,
					},
				} as ParsedLine
			}),
		} as ParsedLayer
	})

	return {
		layers: layers,
	}
}

export function parseRaw(buffer: Buffer | Uint8Array): FileData {
	return File.parse(buffer)
}

export {
	ParsedLine,
	ParsedLayer,
	ParsedFile,
}