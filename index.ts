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

	constructor(numerator: Fraction | bigint | number | string = 0n, denominator: Fraction | bigint | number | string = 1n){
		Fraction.#typeCheck(numerator, true)
		Fraction.#typeCheck(denominator, true)
		let numExp = 0n,
			denExp = 0n;
		switch(typeof numerator){
			case "number":
				numerator = numerator.toString();
			case "string":
				if(numerator){
					let numberMatch = /^(-?\d*)(\.(\d+))?$/,
						match = numberMatch.exec(numerator.trim());
					if(match){
						numerator = BigInt(`${match[1]}${match[3] ?? ""}`);
						numExp = BigInt(match[3]?.length ?? 0)
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
				break;
			default:
				throw new TypeError(`Cannot use value ${numerator} as a numerator`)
		}
		if(denominator == 0){
			throw new Fraction.ZeroDivisionError
		}
		switch(typeof denominator){
			case "number":
				denominator = denominator.toString();
			case "string":
				let numberMatch = /^(-?\d*)(\.(\d+))?$/,
					match = numberMatch.exec(denominator.trim());
				if(match){
					denominator = BigInt(`${match[1]}${match[3] ?? ""}`);
					denExp = BigInt(match[3]?.length ?? 0)
				} else {
					try {
						denominator = new Fraction(denominator)
					} catch(err){
						console.error(err)
						throw new TypeError(`Cannot use value "${denominator}" as a denominator`)
					}
				}
			case "bigint":
				break;
			default:
				throw new TypeError(`Cannot use value ${denominator} as a denominator`)
		}
		if(numerator instanceof Fraction){
			if(denominator instanceof Fraction){
				let newFrac = new Fraction(numerator).divide(denominator)
				this.#nNumerator = newFrac.#nNumerator * denominator.#nDenominator;
				this.#nDenominator = newFrac.#nDenominator * denominator.#nNumerator
			} else {
				this.#nNumerator = numerator.#nNumerator;
				this.#nDenominator = numerator.#nDenominator * denominator;
			}
		} else if(denominator instanceof Fraction){
			let newFrac = new Fraction(numerator).divide(denominator)
			this.#nNumerator = newFrac.#nNumerator;
			this.#nDenominator = newFrac.#nDenominator
		} else {
			this.#nNumerator = numerator * (numExp > denExp ? 1n : 10n**(denExp - numExp));
			this.#nDenominator = denominator * (denExp > numExp ? 1n : 10n**(numExp - denExp));
		}
	}

	get numerator(){return this.#nNumerator}
	get denominator(){return this.#nDenominator}

	get isNaN(){return typeof this.#nNumerator != "bigint" || typeof this.#nDenominator != "bigint"}
	get isNegative(){return this.#nNumerator != 0n || this.#nNumerator < 0 != this.#nDenominator < 0}

	get negative(){return new Fraction(-this.#nNumerator, this.#nDenominator)}

	eq(frac: Fraction | bigint | number | string): boolean {
		try{
			Fraction.#typeCheck(frac, true)
			let f1 = this.clone().reduce(),
				f2 = frac instanceof Fraction ? frac.clone().reduce() : new Fraction(frac).reduce();
			return f1.#nNumerator == f2.numerator && f1.#nDenominator == f2.denominator
		} catch {
			return false
		}
	}

	lt(frac: Fraction | bigint | number | string): boolean {
		if(Fraction.#typeCheck(frac)) return false;
		if(frac == 0){
			return this.isNegative
		}
		return this.minus(frac).lt(0)
	}

	lteq(frac: Fraction | bigint | number | string): boolean {
		if(Fraction.#typeCheck(frac)) return false;
		if(frac == 0){
			return this.isNegative || this.#nNumerator == 0n
		}
		return this.minus(frac).lteq(0)
	}

	gt(frac: Fraction | bigint | number | string): boolean {
		if(Fraction.#typeCheck(frac)) return false;
		if(!(frac instanceof Fraction)){
			frac = new Fraction(frac)
		}
		return frac.minus(this).lt(0)
	}

	gteq(frac: Fraction | bigint | number | string): boolean {
		if(Fraction.#typeCheck(frac)) return false;
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
		return new Fraction(this.#nDenominator, this.#nNumerator)
	}
	reciprocate(): this {
		if(this.#nNumerator == 0n) throw new Fraction.ZeroDivisionError;
		[this.#nNumerator, this.#nDenominator] = [this.#nDenominator, this.#nNumerator]
		return this
	}

	clone(): Fraction {
		return new Fraction(this)
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
		if(typeof addend != "object") addend = new Fraction(addend);
		let lcmRatio = (this.#nDenominator * addend.#nDenominator) / Fraction.#lcm(this.#nDenominator, addend.#nDenominator);
		return new Fraction(
			(this.#nNumerator * addend.#nDenominator + addend.#nNumerator * this.#nDenominator) / lcmRatio,
			this.#nDenominator * addend.#nDenominator / lcmRatio)
	}

	minus(subtrahend: Fraction | bigint | number | string): Fraction {
		Fraction.#typeCheck(subtrahend, true)
		if(typeof subtrahend == "string") subtrahend = Fraction.parseFraction(subtrahend);
		return this.plus(subtrahend instanceof Fraction ? subtrahend.negative : -subtrahend)
	}

	times(multiplicand: Fraction | bigint | number | string): Fraction {
		Fraction.#typeCheck(multiplicand, true)
		let multiplier = multiplicand instanceof Fraction ? multiplicand : new Fraction(multiplicand);
		return (new Fraction(this.#nNumerator*multiplier.#nNumerator, this.#nDenominator*multiplier.#nDenominator)).reduce()
	}

	divide(divisor: Fraction | bigint | number | string): Fraction {
		Fraction.#typeCheck(divisor, true)
		if(divisor == 0) throw new Fraction.ZeroDivisionError;
		if(!(divisor instanceof Fraction)) divisor = new Fraction(divisor);
		return this.times(divisor.reciprocal)
	}

	toString(type?: string): string {
		switch(type){
			case "regex":
				return `\\frac{${this.#nNumerator}}{${this.#nDenominator}}`;
			default:
				return `${this.#nNumerator}/${this.#nDenominator}`
		}
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
			let numberMatch = /^(-?\d*)(\.(\d+))?$/,
				parts = str.split("/"),
				match0 = numberMatch.exec(parts[0].trim()),
				match1 = numberMatch.exec(parts[1]?.trim());
			return match0 && match1 ? new Fraction(match0[0], match1[0]) : Fraction.NaN
		}
		return Fraction.NaN
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

	static random(): Fraction {
		let den = Fraction.#randomBigInt();
		return new Fraction(Fraction.#randomBigInt(den), den)
	}

	static {
		Fraction.#NaN = (a => (
			// @ts-ignore
			a.#nDenominator = a.#nNumerator = NaN
			, a
		))(new Fraction)
	}
}