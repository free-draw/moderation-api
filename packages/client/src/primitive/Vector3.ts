class Vector3 {
	public readonly x: number
	public readonly y: number
	public readonly z: number

	constructor(x: number, y: number, z: number) {
		this.x = x
		this.y = y
		this.z = z
	}

	public add(other: Vector3): Vector3 {
		return new Vector3(
			this.x + other.x,
			this.y + other.y,
			this.z + other.z
		)
	}

	public subtract(other: Vector3): Vector3 {
		return new Vector3(
			this.x - other.x,
			this.y - other.y,
			this.z - other.z
		)
	}

	public multiply(other: Vector3): Vector3 {
		return new Vector3(
			this.x * other.x,
			this.y * other.y,
			this.z * other.z
		)
	}

	public multiplyScalar(value: number): Vector3 {
		return new Vector3(
			this.x * value,
			this.y * value,
			this.z * value
		)
	}

	public divide(other: Vector3): Vector3 {
		return new Vector3(
			this.x / other.x,
			this.y / other.y,
			this.z / other.z
		)
	}

	public divideScalar(value: number): Vector3 {
		return new Vector3(
			this.x / value,
			this.y / value,
			this.z / value
		)
	}

	public dot(other: Vector3): number {
		return this.x*other.x + this.y*other.y + this.z*other.z
	}

	public lerp(other: Vector3, alpha: number): Vector3 {
		return new Vector3(
			this.x + (other.x - this.x) * alpha,
			this.y + (other.y - this.y) * alpha,
			this.z + (other.z - this.z) * alpha
		)
	}

	public invert(): Vector3 {
		return new Vector3(
			-this.x,
			-this.y,
			-this.z
		)
	}

	public magnitude(): number {
		return Math.sqrt(this.dot(this))
	}

	public unit() {
		return this.divideScalar(this.magnitude())
	}
}

export default Vector3