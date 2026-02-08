export class SharedService {
	isValidNumber(value: any, defaultValue = 0): number {
		const num = Number(value)
		return isNaN(num) ? defaultValue : num
	}

	checkDirtyProperty(
		propertyName: string,
		fieldColorsList: Record<string, any>
	): boolean {
		if (!fieldColorsList) return false
		return (
			fieldColorsList[propertyName] === 'dirty' ||
			fieldColorsList[propertyName] === true
		)
	}

	safeDivide(numerator: number, denominator: number, defaultValue = 0): number {
		return denominator === 0 ? defaultValue : numerator / denominator
	}
}
