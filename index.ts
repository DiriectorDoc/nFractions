type AnyNumber = Fraction | bigint | number | string;
type AnyInteger = bigint | number | string;

export default class Fraction {

	#numerator: bigint;
	#denominator: bigint;

	static get NaN(): Fraction {
		let nan = new Fraction();
		// @ts-ignore
		[nan.#denominator, nan.#numerator] = [NaN, NaN];
		return nan
	}

	static get ONE(){
		return new Fraction(1n)
	}

	get [Symbol.toStringTag](){
		return "Fraction"
	}

	constructor(numerator: AnyNumber = 0n, denominator: AnyNumber = 1n){
		switch(typeof denominator){
			case "bigint":
				this.#denominator = denominator;
				break
			case "number":
				if(denominator % 1 === 0){
					this.#denominator = BigInt(denominator)
					break
				}
				denominator = denominator.toString();
			case "string":
				if(denominator === ""){
					this.#denominator = 1n;
					break
				}
				denominator = Fraction.#parseNumber(denominator);
				if("bigint" === typeof denominator){
					this.#denominator = denominator;
					break
				}
			case "object":
				if(denominator instanceof Fraction){
					if(denominator.#denominator === 0n) throw new Fraction.ZeroDivisionError;
					let temp = denominator.reciprocal.times(numerator);
					this.#numerator = temp.#numerator;
					this.#denominator = temp.#denominator;
					return
				}
			default:
				throw new TypeError(`Cannot use value ${denominator} as a denominator`)
		}
		if(this.#denominator === 0n) throw new Fraction.ZeroDivisionError;
		switch(typeof numerator){
			case "bigint":
				this.#numerator = numerator;
				break
			case "number":
				if(numerator % 1 == 0){
					this.#numerator = BigInt(numerator)
					break
				}
				numerator = numerator.toString();
			case "string":
				if(numerator === ""){
					this.#numerator = 0n;
					break
				}
				numerator = Fraction.#parseNumber(numerator);
				if("bigint" === typeof numerator){
					this.#numerator = numerator;
					break
				}
			case "object":
				if(numerator instanceof Fraction){
					this.#numerator = numerator.#numerator;
					this.#denominator *= numerator.#denominator;
					return
				}
			default:
				throw new TypeError(`Cannot use value ${numerator} as a numerator`)
		}
	}

	get numerator(): bigint {return this.#numerator}
	get denominator(): bigint {return this.#denominator}
	set numerator(num: AnyInteger){
		try {
			this.numerator = Fraction.#toInt(num);
		} catch(err){
			console.error(new TypeError("When setting the numerator manually, the input must be an integer"))
			throw err
		}
	}
	set denominator(num: AnyInteger){
		try {
			num = Fraction.#toInt(num);
		} catch(err){
			console.error(new TypeError("When setting the denominator manually, the input must be an integer"))
			throw err
		}
		if(num === 0n){
			throw new Fraction.ZeroDivisionError;
		}
		this.denominator = num;
	}

	get isNaN(){return typeof this.#numerator !== "bigint" || typeof this.#denominator !== "bigint"}
	get isNegative(){return this.#numerator !== 0n && (this.#numerator < 0n) !== (this.#denominator < 0n)}

	get negative(){return new Fraction(-this.#numerator, this.#denominator)}

	get whole(){return this.#numerator/this.#denominator}

	eq(frac: AnyNumber): boolean {
		if(Fraction.#typeCheck(frac)){
			let f1 = this.clone().reduce(),
				f2 = frac instanceof Fraction ? frac.clone().reduce() : new Fraction(frac).reduce();
			return f1.#numerator === f2.#numerator && f1.#denominator === f2.#denominator
		} else {
			return false
		}
	}

	seq(frac: Fraction): boolean {
		if(frac instanceof Fraction){
			let f1 = this.clone().reduce(),
				f2 = frac.clone().reduce();
			return f1.#numerator === f2.#numerator && f1.#denominator === f2.#denominator
		} else {
			return false
		}
	}

	lt(frac: AnyNumber): boolean {
		if(!Fraction.#typeCheck(frac)) return false;
		if(Fraction.#isZero(frac)){
			return this.isNegative
		}
		return this.minus(frac).lt(0)
	}

	lteq(frac: AnyNumber): boolean {
		if(!Fraction.#typeCheck(frac)) return false;
		if(Fraction.#isZero(frac)){
			return this.isNegative || this.#numerator === 0n
		}
		return this.minus(frac).lteq(0)
	}

	gt(frac: AnyNumber): boolean {
		if(!Fraction.#typeCheck(frac)) return false;
		if(!(frac instanceof Fraction)){
			frac = new Fraction(frac)
		}
		return frac.minus(this).lt(0)
	}

	gteq(frac: AnyNumber): boolean {
		if(!Fraction.#typeCheck(frac)) return false;
		if(!(frac instanceof Fraction)){
			frac = new Fraction(frac)
		}
		return frac.minus(this).lteq(0)
	}

	reduce(): this {
		let gcd = Fraction.#gcd(this.#numerator, this.#denominator);
		this.fixNegative()
		while(gcd > 1){
			this.#numerator /= gcd;
			this.#denominator /= gcd;
			gcd = Fraction.#gcd(this.#numerator, this.#denominator);
		}
		return this
	}

	fixNegative(): this {
		if(this.#denominator < 0n){
			this.#denominator *= -1n
			this.#numerator *= -1n
		}
		return this
	}

	get reciprocal(): Fraction {
		if(this.#numerator === 0n) throw new Fraction.ZeroDivisionError;
		return new Fraction(this.#denominator, this.#numerator)
	}
	reciprocate(): this {
		if(this.#numerator === 0n) throw new Fraction.ZeroDivisionError;
		[this.#numerator, this.#denominator] = [this.#denominator, this.#numerator]
		return this
	}

	get remainder(): bigint {
		return this.#numerator % this.#denominator
	}

	clone(): Fraction {
		return new Fraction(this.#numerator, this.#denominator)
	}

	scaleTo(factor: AnyInteger): this {
		let d = Fraction.#toInt(factor)
		this.#numerator *= d;
		this.#denominator *= d;
		return this
	}

	plus(addend: AnyNumber): Fraction {
		Fraction.#assertNumber(addend)
		if(!(addend instanceof Fraction)) addend = new Fraction(addend, 1n);
		let gcd = Fraction.#gcd(this.#denominator, addend.#denominator);
		return new Fraction(
			(this.#numerator * addend.#denominator + addend.#numerator * this.#denominator) / gcd,
			this.#denominator * addend.#denominator / gcd
		)
	}

	minus(subtrahend: AnyNumber): Fraction {
		Fraction.#assertNumber(subtrahend)
		return this.negative.plus(subtrahend).negative.fixNegative()
	}

	times(multiplicand: AnyNumber): Fraction {
		switch(typeof multiplicand){
			case "number":
			case "string":
				multiplicand = Fraction.#parseNumber(multiplicand);
		}
		switch(typeof multiplicand){
			case "bigint":
				let temp = new Fraction(multiplicand, this.#denominator).reduce();
				return new Fraction(this.#numerator*temp.#numerator, temp.#denominator);
			default:
				if(multiplicand instanceof Fraction){
					return new Fraction(this.#numerator*multiplicand.#numerator, this.#denominator*multiplicand.#denominator).reduce()
				}
		}
		throw new TypeError(`Cannot accept \`${multiplicand}\` as an input`);
	}

	divide(divisor: AnyNumber): Fraction {
		Fraction.#assertNumber(divisor)
		if(Fraction.#isZero(divisor)) throw new Fraction.ZeroDivisionError;
		if(!(divisor instanceof Fraction)) divisor = new Fraction(divisor);
		return this.times(divisor.reciprocal)
	}

	toString(type?: string): string {
		switch(type){
			case "latex":
				return `\\frac{${this.#numerator}}{${this.#denominator}}`;
			default:
				return `${this.#numerator}/${this.#denominator}`
		}
	}

	valueOf(): number {
		return Number.parseFloat(this.asDecimal(17))
	}

	asDecimal(decimals: number = 15): string {
		if(this.#denominator === 0n){
			throw new Fraction.ZeroDivisionError();
		}
		const integerPart = this.#numerator / this.#denominator;
		let remainder = this.#numerator % this.#denominator;
		if(remainder === 0n){
			return integerPart.toString();
		}
		let result = `${integerPart}.`;
		remainder *= 10n;
		for(let i = 0; i < decimals; i++){
			const digit = remainder / this.#denominator;
			result += digit.toString();
			remainder = remainder % this.#denominator;
			remainder *= 10n;
		}
		return result;
	}

	static #gcd(a: bigint, b: bigint): bigint {
		a = a > 0 ? a : -a;
		b = b > 0 ? b : -b;
		if(b > a){
			[a, b] = [b, a]
		}
		while(true){
			if(b === 0n) return a;
			a %= b;
			if(a === 0n) return b;
			b %= a;
		}
	}

	// static #lcm(a: bigint, b: bigint): bigint {
	// 	return (a * b) / Fraction.#gcd(a, b)
	// }

	static #typeCheck(inp: any): boolean {
		switch (typeof inp) {
			case "object":
				return inp instanceof Fraction;
			case "string":
				return /^\s*[+-]?\s*\d+\s*$/.test(inp) || 
					/^\s*([+-]?\s*0?|-?\s*[1-9]\d*(_\d+)*)\.\d+(_\d+)*(e[+-]?\d+(_\d+)*)?\s*$/i.test(inp) ||
					/^\s*[+-]?\s*0x[0-9a-f]+(_[0-9a-f]+)*\s*$/i.test(inp) ||
					/^\s*[+-]?\s*0b[01]+(_[01]+)*$/i.test(inp) ||
					/^\s*[+-]?\s*0o[0-7]+(_[0-7]+)*$/i.test(inp);
			case "number":
			case "bigint":
				return true;
			default:
				return false
		}
	}

	static #assertNumber(inp: any): void {
		if(Fraction.#typeCheck(inp)) return;
		throw new TypeError(`${"string" == typeof inp ? `"${inp}"` : `\`${inp}\``} Cannot be parsed into a number; As such, it cannot be accepted an input`)
	}

	static #parseNumber(str: string | number): Fraction | bigint {
		if("number" == typeof str)
			str = str.toString();
		else
			str = str.replaceAll(/\s/g, "").replace(/^\+/, "");
		if(/^-?\d+$/.test(str)){
			return BigInt(str)
		}
		if(/^(-?0?|-?[1-9]\d*(_\d+)*)\.\d+(_\d+)*(e[+-]?\d+(_\d+)*)?$/i.test(str)){
			str = str.replaceAll("_", "");
			if(+str === 0){
				return 0n
			}
			let groups = /^(?<whole>-?0?|-?[1-9]\d*)(?<decimal>\.\d+)(?<exponent>(e[+-]?\d+)?)$/i.exec(str).groups;
			let num = "",
				den = "1";
			if(groups.whole && groups.whole !== "0"){
				num = groups.whole === "-0" ? "-" : groups.whole;
			}
			num += groups.decimal.substring(1);
			if(groups.exponent){
				let exp = /\d+/.exec(groups.exponent)[0];
				if(groups.exponent[1] === "-"){
					den += Array(+exp).fill(0).join("")
				} else {
					num += Array(+exp).fill(0).join("")
				}
			}
			den += Array(groups.decimal.length - 1).fill(0).join("");
			return new Fraction(BigInt(num), BigInt(den))
		}
		if(
			/^-?0x[0-9a-f]+(_[0-9a-f]+)*$/i.test(str) ||
			/^-?0b[01]+(_[01]+)*$/i.test(str) ||
			/^-?0o[0-7]+(_[0-7]+)*$/i.test(str)
		){
			return str[0] === "-" ? -BigInt(str.replaceAll("_", "").substring(1)) : BigInt(str.replaceAll("_", ""))
		}
		throw new Error("Cannot convert string to number")
	}

	static #toInt(num: AnyInteger): bigint {
		switch(typeof num){
			case "bigint":
				return num;
			case "string":
				try {
					return BigInt(num)
				} catch {
					break
				}
			case "number":
				if(num % 1 !== 0){
					break
				}
				return BigInt(num)
		}
		throw new Fraction.IntegerExpectedError(num)
	}

	static #isZero(num: AnyNumber): boolean {
		switch(typeof num){
			case "number":
				return num === 0
			case "string":
				num = Fraction.#parseNumber(num);
		}
		switch(typeof num){
			case "bigint":
				return num === 0n;
			default:
				if(num instanceof Fraction){
					return num.#numerator === 0n
				}
		}
		return false
	}

	static ZeroDivisionError = class extends Error {

		name = "ZeroDivisionError";

		constructor(){
			super("Cannot devide by 0")
		}
	}

	static IntegerExpectedError = class extends Error {

		name = "IntegerExpectedError";

		constructor(value: any){
			super(`\`${"string" == typeof value ? `"${value}"` : value}\` is not an integer`)
		}
	}

	static abs(frac: Fraction): Fraction {
		let abs = (a: bigint) => a<0 ? -a : a;
		return frac instanceof Fraction ? new Fraction(abs(frac.#numerator), abs(frac.#denominator)) : Fraction.NaN
	}

	static pow(frac: Fraction, exponent: AnyInteger): Fraction {
		if(frac instanceof Fraction){
			try {
				exponent = Fraction.#toInt(exponent)
			} catch(err){
				if(err instanceof Fraction.IntegerExpectedError)
					console.error(new TypeError("Fractions can only be exponentiated by integers"));
				throw err
			}
			return exponent < 0n ? new Fraction(frac.#denominator**-exponent, frac.#numerator**-exponent) :  new Fraction(frac.#numerator**exponent, frac.#denominator**exponent)
		}
		throw new TypeError(`${frac} is not a fraction`)
	};

	static parseFraction(str: string): Fraction {
		let match: RegExpExecArray;
		if(
			(match = /^\s*(.+)\s*[:\/]\s*(.+)\s*$/.exec(str)) ||
			(match = /^\s*\\frac\s*\{(.+)\}\s*\{(.+)\}\s*$/m.exec(str))
		){
			return new Fraction(Fraction.#parseNumber(match[1]), Fraction.#parseNumber(match[2]))
		}
		return Fraction.NaN
	}
}