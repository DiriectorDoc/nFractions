interface MixedFraction extends Fraction {
	whole: bigint
}
class Fraction {

	#nNumerator: bigint;
	#nDenominator: bigint;

	static #NaN: Fraction;
	static get NaN(): Fraction {
		return Fraction.#NaN;
	}

	get [Symbol.toStringTag](){
		return "Fraction"
	}

	constructor(numerator: Fraction | bigint | number | string = 0n, denominator: Fraction | bigint | number | string = 1n, quick?: symbol){
		if(typeof quick == "symbol" && quick.toString() == "Symbol(#Quick)"){
			this.#nNumerator = numerator as bigint
			this.#nDenominator = denominator as bigint
			return
		}
		Fraction.#typeCheck(numerator, true)
		Fraction.#typeCheck(denominator, true)
		if(denominator === ""){
			denominator = 1n
		}
		if(denominator == 0){
			throw new Fraction.ZeroDivisionError
		}
		let numExp: number | bigint = 0,
			denExp: number | bigint = 0;
		switch(typeof numerator){
			case "number":
				numerator = numerator.toString();
			case "string":
				if(numerator){
					let match = Fraction.#parseNum(numerator.trim());
					if(match){
						numerator = BigInt(`${match[1]}${match[2]}`)
						if(match[0]){
							numerator *= -1n
						}
						numExp = match[2].length
					} else if(numerator.includes("/")){
						numerator = Fraction.parseFraction(numerator);
						if(numerator.isNaN){
							throw new TypeError(`Cannot parse "${numerator}" as a fraction`)
						}
					} else {
						throw new TypeError(`Cannot use value "${numerator}" as a numerator`)
					}
				} else {
					numerator = 0n
				}
			case "bigint":
			case "object":
				break;
			default:
				throw new TypeError(`Cannot use value ${numerator} as a numerator`)
		}
		switch(typeof denominator){
			case "number":
				denominator = denominator.toString();
			case "string":
				let match = Fraction.#parseNum(denominator.trim());
				if(match){
					denominator = BigInt(`${match[1]}${match[2]}`)
					if(match[0]){
						denominator *= -1n
					}
					denExp = match[2].length
				} else if(denominator.includes("/")){
					denominator = Fraction.parseFraction(denominator);
					if(denominator.isNaN){
						throw new TypeError(`Cannot parse "${denominator}" as a fraction`)
					}
				} else {
					throw new TypeError(`Cannot use value "${denominator}" as a denominator`)
				}
			case "bigint":
			case "object":
				break;
			default:
				throw new TypeError(`Cannot use value ${denominator} as a denominator`)
		}
		[numExp, denExp] = [(numExp > denExp ? 1n : 10n**BigInt(denExp - numExp)), (denExp > numExp ? 1n : 10n**BigInt(numExp - denExp))];
		if(numerator instanceof Fraction){
			if(denominator instanceof Fraction){
				this.#nNumerator = numerator.#nNumerator * denominator.#nDenominator;
				this.#nDenominator = numerator.#nDenominator * denominator.#nNumerator
			} else {
				this.#nNumerator = numerator.#nNumerator * numExp;
				this.#nDenominator = numerator.#nDenominator * denominator
			}
		} else if(denominator instanceof Fraction){
			this.#nNumerator = denominator.#nDenominator * numerator;
			this.#nDenominator = denominator.#nNumerator * denExp
		} else {
			this.#nNumerator = numerator * numExp;
			this.#nDenominator = denominator * denExp
		}
	}

	get numerator(){return this.#nNumerator}
	get denominator(){return this.#nDenominator}

	get isNaN(){return typeof this.#nNumerator != "bigint" || typeof this.#nDenominator != "bigint"}
	get isNegative(){return this.#nNumerator != 0n || this.#nNumerator < 0 != this.#nDenominator < 0}

	get negative(){return new Fraction(-this.#nNumerator, this.#nDenominator, Symbol("#Quick"))}

	eq(frac: Fraction | bigint | number | string): boolean {
		if(Fraction.#typeCheck(frac)){
			let f1 = this.clone().reduce(),
				f2 = frac instanceof Fraction ? frac.clone().reduce() : new Fraction(frac).reduce();
			return f1.#nNumerator == f2.#nNumerator && f1.#nDenominator == f2.#nDenominator
		} else {
			return false
		}
	}

	seq(frac: Fraction | bigint | number | string): boolean {
		return frac instanceof Fraction && this.eq(frac)
	}

	lt(frac: Fraction | bigint | number | string): boolean {
		if(!Fraction.#typeCheck(frac)) return false;
		if(frac == 0){
			return this.isNegative
		}
		return this.minus(frac).lt(0)
	}

	lteq(frac: Fraction | bigint | number | string): boolean {
		if(!Fraction.#typeCheck(frac)) return false;
		if(frac == 0){
			return this.isNegative || this.#nNumerator == 0n
		}
		return this.minus(frac).lteq(0)
	}

	gt(frac: Fraction | bigint | number | string): boolean {
		if(!Fraction.#typeCheck(frac)) return false;
		if(!(frac instanceof Fraction)){
			frac = new Fraction(frac)
		}
		return frac.minus(this).lt(0)
	}

	gteq(frac: Fraction | bigint | number | string): boolean {
		if(!Fraction.#typeCheck(frac)) return false;
		if(!(frac instanceof Fraction)){
			frac = new Fraction(frac)
		}
		return frac.minus(this).lteq(0)
	}

	reduce(): this {
		let gcd = Fraction.#gcd(this.#nNumerator, this.#nDenominator);
		this.fixNegative()
		while(gcd > 1){
			this.#nNumerator /= gcd;
			this.#nDenominator /= gcd;
			gcd = Fraction.#gcd(this.#nNumerator, this.#nDenominator);
		}
		return this
	}

	fixNegative(): this {
		if(this.isNegative && this.#nDenominator < 0){
			this.#nDenominator *= -1n
			this.#nNumerator *= -1n
		}
		return this
	}

	get reciprocal(): Fraction {
		return new Fraction(this.#nDenominator, this.#nNumerator, Symbol("#Quick"))
	}
	reciprocate(): this {
		if(this.#nNumerator == 0n) throw new Fraction.ZeroDivisionError;
		[this.#nNumerator, this.#nDenominator] = [this.#nDenominator, this.#nNumerator]
		return this
	}

	clone(): Fraction {
		return new Fraction(this.#nNumerator, this.#nDenominator, Symbol("#Quick"))
	}

	/*get mixed(): MixedFraction {
		let mixed: MixedFraction = Fraction.abs(this) as MixedFraction;
		mixed.whole = 0n;
		while(mixed.#nNumerator > mixed.#nDenominator){
			mixed.#nNumerator -= mixed.#nDenominator;
			if(this.isNegative){
				mixed.whole--
			} else {
				mixed.whole++
			}
		}
		if(!mixed.whole && this.isNegative){
			mixed.#nNumerator *= -1n
		}
		return mixed
	}*/

	scaleTo(factor: bigint | number): this {
		this.#nNumerator *= BigInt(factor);
		this.#nDenominator *= BigInt(factor);
		return this
	}

	plus(addend: Fraction | bigint | number | string): Fraction {
		Fraction.#typeCheck(addend, true)
		if(typeof addend != "object") addend = new Fraction(addend, 1n, Symbol("#Quick"));
		let lcmRatio = (this.#nDenominator * addend.#nDenominator) / Fraction.#lcm(this.#nDenominator, addend.#nDenominator);
		return new Fraction(
			(this.#nNumerator * addend.#nDenominator + addend.#nNumerator * this.#nDenominator) / lcmRatio,
			this.#nDenominator * addend.#nDenominator / lcmRatio,
			Symbol("#Quick")
			)
	}

	minus(subtrahend: Fraction | bigint | number | string): Fraction {
		Fraction.#typeCheck(subtrahend, true)
		if(typeof subtrahend == "string") subtrahend = Fraction.parseFraction(subtrahend);
		return this.plus(subtrahend instanceof Fraction ? subtrahend.negative : -subtrahend)
	}

	times(multiplicand: Fraction | bigint | number | string): Fraction {
		Fraction.#typeCheck(multiplicand, true)
		let multiplier = multiplicand instanceof Fraction ? multiplicand : new Fraction(multiplicand);
		return new Fraction(this.#nNumerator*multiplier.#nNumerator, this.#nDenominator*multiplier.#nDenominator, Symbol("#Quick")).reduce()
	}

	divide(divisor: Fraction | bigint | number | string): Fraction {
		Fraction.#typeCheck(divisor, true)
		if(divisor == 0) throw new Fraction.ZeroDivisionError;
		if(!(divisor instanceof Fraction)) divisor = new Fraction(divisor);
		return this.times(divisor.reciprocal)
	}

	toString(type?: string): string {
		switch(type){
			case "latex":
				return `\\frac{${this.#nNumerator}}{${this.#nDenominator}}`;
			default:
				return `${this.#nNumerator}/${this.#nDenominator}`
		}
	}

	valueOf(): number {
		// temporary
		return Number(this.#nNumerator) / Number(this.#nDenominator)
	}

	static #gcd(a: bigint, b: bigint): bigint {
		a = a > 0 ? a : -a;
		b = b > 0 ? b : -b;
		if(b > a){
			[a, b] = [b, a]
		}
		while(true){
			if(b == 0n) return a;
			a %= b;
			if(a == 0n) return b;
			b %= a;
		}
	}

	static #lcm(a: bigint, b: bigint): bigint {
		return (a * b) / Fraction.#gcd(a, b)
	}

	static #typeCheck(inp: any, thro?: boolean): boolean {
		switch (typeof inp) {
			case "undefined":
				return false
			case "object":
				return inp instanceof Fraction
			case "number":
			case "bigint":
			case "string":
				return true
			default:
				if(thro)
				throw new TypeError(`Cannot accept ${inp} as an input`)
				return false
		}
	}

	static #parseNum(str: string): [boolean, string, string] | undefined {
		let match = /^(?<sign>[+-])?((?<b>0b[01]+)|(?<o>0o[0-7]+)|(?<x>0x[0-9a-f]+)|(((?<whole>\d+)(?<decimal>\.\d*)?)|(?<jdecimal>\.\d+)))$/gi.exec(str)
		if(match){
			if(match.groups?.b || match.groups?.o || match.groups?.x){
				return [match.groups.sign == "-", match.groups.b || match.groups.o || match.groups.x, ""]
			} else if(match.groups?.whole || match.groups?.jdecimal){
				return [match.groups.sign == "-", match.groups.whole ?? "", (match.groups.decimal || match.groups.jdecimal)?.replace(".", "") ?? ""]
			}
			return undefined
		}
		return undefined
	}

	static #randomBigInt(max?: bigint): bigint {
		let i = 30,
			bin = "0b1",
			result;
		do {
			bin += Math.round(Math.random())
		} while(Math.round(Math.random()*30) && i--)
		result = BigInt(bin)
		if(max) result %= max;
		return result
	}

	static ZeroDivisionError = class extends Error {
		constructor(){
			super("Cannot devide by 0")
			this.name = "ZeroDivisionError"
		}
	}

	static RationalExponentError = class extends Error {
		constructor(value: any){
			super(`Cannot exponentiate a fraction by ${value}`)
			this.name = "RationalExponentError"
		}
	}

	static abs(frac: Fraction): Fraction {
		let abs = (a: bigint) => a<0 ? -a : a;
		return frac instanceof Fraction ? new Fraction(abs(frac.#nNumerator), abs(frac.#nDenominator)) : Fraction.NaN
	}

	static pow(frac: Fraction, exponent: bigint | number): Fraction {
		if(frac instanceof Fraction){
			if(typeof exponent == "number"){
				if(exponent % 1 != 0){
					throw new Fraction.RationalExponentError(exponent)
				}
				exponent = BigInt(exponent)
			} else if(typeof exponent != "bigint"){
				throw new TypeError("Fractions can only be exponentiated by integers")
			}
			if(exponent < 0n){
				exponent *= -1n
				frac.reciprocate()
			}
			return new Fraction(frac.#nNumerator ** BigInt(exponent), frac.#nDenominator ** BigInt(exponent))
		}
		throw new TypeError(`${frac} is not a fraction`)
	};

	static parseFraction(str: string): Fraction {
		if(typeof str == "string"){
			let parts = str.split("/");
			return parts[1] ? new Fraction(parts[0], parts[1]) : Fraction.NaN
		}
		return Fraction.NaN
	}

	static random(): Fraction {
		let den = Fraction.#randomBigInt();
		return new Fraction(Fraction.#randomBigInt(den), den, Symbol("#Quick"))
	}

	static {
		Fraction.#NaN = (a => (
			// @ts-ignore
			a.#nDenominator = a.#nNumerator = NaN
			, a
		))(new Fraction)
	}
}