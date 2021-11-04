class Vector2 {
	public readonly x: number
	public readonly y: number

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	public add(other: Vector2): Vector2 {
		return new Vector2(
			this.x + other.x,
			this.y + other.y
		)
	}

	public subtract(other: Vector2): Vector2 {
		return new Vector2(
			this.x - other.x,
			this.y - other.y
		)
	}

	public multiply(other: Vector2): Vector2 {
		return new Vector2(
			this.x * other.x,
			this.y * other.y
		)
	}

	public multiplyScalar(value: number): Vector2 {
		return new Vector2(
			this.x * value,
			this.y * value
		)
	}

	public divide(other: Vector2): Vector2 {
		return new Vector2(
			this.x / other.x,
			this.y / other.y
		)
	}

	public divideScalar(value: number): Vector2 {
		return new Vector2(
			this.x / value,
			this.y / value
		)
	}

	public dot(other: Vector2): number {
		return this.x*other.x + this.y*other.y
	}

	public rotate(theta: number): Vector2 {
		const sin = Math.sin(theta)
		const cos = Math.cos(theta)

		return new Vector2(
			this.x * cos + this.y * sin,
			-this.x * sin + this.y * cos
		)
	}

	public lerp(other: Vector2, alpha: number): Vector2 {
		return new Vector2(
			this.x + (other.x - this.x) * alpha,
			this.y + (other.y - this.y) * alpha
		)
	}

	public inverse(): Vector2 {
		return new Vector2(
			-this.x,
			-this.y
		)
	}

	public angle(): number {
		return Math.atan2(this.x, this.y)
	}

	public magnitude(): number {
		return Math.sqrt(this.dot(this))
	}

	public unit() {
		return this.divideScalar(this.magnitude())
	}
}

export default Vector2