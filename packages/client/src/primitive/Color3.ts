class Color3 {
	public readonly r: number
	public readonly g: number
	public readonly b: number

	constructor(r: number, g: number, b: number) {
		this.r = r
		this.g = g
		this.b = b
	}

	public static fromDecimal(decimal: number): Color3 {
		return new Color3(
			(decimal >> 16) & 0b11111111,
			(decimal >> 8) & 0b11111111,
			decimal & 0b11111111
		)
	}

	public toDecimal(): number {
		return (this.r << 16) + (this.g << 8) + this.b
	}
}

export default Color3