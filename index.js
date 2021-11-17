Object.defineProperty(exports, "__esModule", { value: true });
class Fraction {
    #_Numerator;
    #_Denominator;
    static #NaN = (nan => (
    // @ts-ignore
    [nan.#_Denominator, nan.#_Numerator] = [NaN, NaN],
        nan))(new Fraction());
    static get NaN() {
        return Fraction.#NaN;
    }
    get [Symbol.toStringTag]() {
        return "Fraction";
    }
    constructor(numerator = 0n, denominator = 1n) {
        if (typeof numerator == "bigint" && typeof denominator == "bigint" && denominator !== 0n) {
            this.#_Numerator = numerator;
            this.#_Denominator = denominator;
            return;
        }
        Fraction.#typeCheck(numerator, true);
        Fraction.#typeCheck(denominator, true);
        if (denominator === "") {
            denominator = 1n;
        }
        if (denominator == 0) {
            throw new Fraction.ZeroDivisionError;
        }
        let numExp = 0, denExp = 0;
        switch (typeof numerator) {
            case "number":
                if (numerator % 1 == 0) {
                    numerator = BigInt(numerator);
                    break;
                }
                numerator = numerator.toString();
            case "string":
                if (numerator) {
                    let match = Fraction.#parseNum(numerator.trim());
                    if (match) {
                        numerator = BigInt(`${match[1]}${match[2]}`);
                        if (match[0]) {
                            numerator *= -1n;
                        }
                        numExp = match[2].length;
                    }
                    else if (numerator.includes("/")) {
                        numerator = Fraction.parseFraction(numerator);
                        if (numerator.isNaN) {
                            throw new TypeError(`Cannot parse "${numerator}" as a fraction`);
                        }
                    }
                    else {
                        throw new TypeError(`Cannot use value "${numerator}" as a numerator`);
                    }
                }
                else {
                    numerator = 0n;
                }
            case "bigint":
            case "object":
                break;
            default:
                throw new TypeError(`Cannot use value ${numerator} as a numerator`);
        }
        switch (typeof denominator) {
            case "number":
                denominator = denominator.toString();
            case "string":
                let match = Fraction.#parseNum(denominator.trim());
                if (match) {
                    denominator = BigInt(`${match[1]}${match[2]}`);
                    if (match[0]) {
                        denominator *= -1n;
                    }
                    denExp = match[2].length;
                }
                else if (denominator.includes("/")) {
                    denominator = Fraction.parseFraction(denominator);
                    if (denominator.isNaN) {
                        throw new TypeError(`Cannot parse "${denominator}" as a fraction`);
                    }
                }
                else {
                    throw new TypeError(`Cannot use value "${denominator}" as a denominator`);
                }
            case "bigint":
            case "object":
                break;
            default:
                throw new TypeError(`Cannot use value ${denominator} as a denominator`);
        }
        [numExp, denExp] = [(numExp > denExp ? 1n : 10n ** BigInt(denExp - numExp)), (denExp > numExp ? 1n : 10n ** BigInt(numExp - denExp))];
        if (numerator instanceof Fraction) {
            if (denominator instanceof Fraction) {
                this.#_Numerator = numerator.#_Numerator * denominator.#_Denominator;
                this.#_Denominator = numerator.#_Denominator * denominator.#_Numerator;
            }
            else {
                this.#_Numerator = numerator.#_Numerator * numExp;
                this.#_Denominator = numerator.#_Denominator * denominator;
            }
        }
        else if (denominator instanceof Fraction) {
            this.#_Numerator = denominator.#_Denominator * numerator;
            this.#_Denominator = denominator.#_Numerator * denExp;
        }
        else {
            this.#_Numerator = numerator * numExp;
            this.#_Denominator = denominator * denExp;
        }
    }
    get numerator() { return this.#_Numerator; }
    get denominator() { return this.#_Denominator; }
    get isNaN() { return typeof this.#_Numerator != "bigint" || typeof this.#_Denominator != "bigint"; }
    get isNegative() { return this.#_Numerator != 0n || this.#_Numerator < 0 != this.#_Denominator < 0; }
    get negative() { return new Fraction(-this.#_Numerator, this.#_Denominator); }
    get whole() { return this.#_Numerator / this.#_Denominator; }
    eq(frac) {
        if (Fraction.#typeCheck(frac)) {
            let f1 = this.clone().reduce(), f2 = frac instanceof Fraction ? frac.clone().reduce() : new Fraction(frac).reduce();
            return f1.#_Numerator == f2.#_Numerator && f1.#_Denominator == f2.#_Denominator;
        }
        else {
            return false;
        }
    }
    seq(frac) {
        return frac instanceof Fraction && this.eq(frac);
    }
    lt(frac) {
        if (!Fraction.#typeCheck(frac))
            return false;
        if (frac == 0) {
            return this.isNegative;
        }
        return this.minus(frac).lt(0);
    }
    lteq(frac) {
        if (!Fraction.#typeCheck(frac))
            return false;
        if (frac == 0) {
            return this.isNegative || this.#_Numerator == 0n;
        }
        return this.minus(frac).lteq(0);
    }
    gt(frac) {
        if (!Fraction.#typeCheck(frac))
            return false;
        if (!(frac instanceof Fraction)) {
            frac = new Fraction(frac);
        }
        return frac.minus(this).lt(0);
    }
    gteq(frac) {
        if (!Fraction.#typeCheck(frac))
            return false;
        if (!(frac instanceof Fraction)) {
            frac = new Fraction(frac);
        }
        return frac.minus(this).lteq(0);
    }
    reduce() {
        let gcd = Fraction.#gcd(this.#_Numerator, this.#_Denominator);
        this.fixNegative();
        while (gcd > 1) {
            this.#_Numerator /= gcd;
            this.#_Denominator /= gcd;
            gcd = Fraction.#gcd(this.#_Numerator, this.#_Denominator);
        }
        return this;
    }
    fixNegative() {
        if (this.isNegative && this.#_Denominator < 0) {
            this.#_Denominator *= -1n;
            this.#_Numerator *= -1n;
        }
        return this;
    }
    get reciprocal() {
        return new Fraction(this.#_Denominator, this.#_Numerator);
    }
    reciprocate() {
        if (this.#_Numerator == 0n)
            throw new Fraction.ZeroDivisionError;
        [this.#_Numerator, this.#_Denominator] = [this.#_Denominator, this.#_Numerator];
        return this;
    }
    clone() {
        return new Fraction(this.#_Numerator, this.#_Denominator);
    }
    scaleTo(factor) {
        this.#_Numerator *= BigInt(factor);
        this.#_Denominator *= BigInt(factor);
        return this;
    }
    plus(addend) {
        Fraction.#typeCheck(addend, true);
        if (typeof addend != "object")
            addend = new Fraction(addend, 1n);
        let lcmRatio = (this.#_Denominator * addend.#_Denominator) / Fraction.#lcm(this.#_Denominator, addend.#_Denominator);
        return new Fraction((this.#_Numerator * addend.#_Denominator + addend.#_Numerator * this.#_Denominator) / lcmRatio, this.#_Denominator * addend.#_Denominator / lcmRatio);
    }
    minus(subtrahend) {
        Fraction.#typeCheck(subtrahend, true);
        if (typeof subtrahend == "string")
            subtrahend = Fraction.parseFraction(subtrahend);
        return this.plus(subtrahend instanceof Fraction ? subtrahend.negative : -subtrahend);
    }
    times(multiplicand) {
        Fraction.#typeCheck(multiplicand, true);
        let multiplier = multiplicand instanceof Fraction ? multiplicand : new Fraction(multiplicand);
        return new Fraction(this.#_Numerator * multiplier.#_Numerator, this.#_Denominator * multiplier.#_Denominator).reduce();
    }
    divide(divisor) {
        Fraction.#typeCheck(divisor, true);
        if (divisor == 0)
            throw new Fraction.ZeroDivisionError;
        if (!(divisor instanceof Fraction))
            divisor = new Fraction(divisor);
        return this.times(divisor.reciprocal);
    }
    toString(type) {
        switch (type) {
            case "latex":
                return `\\frac{${this.#_Numerator}}{${this.#_Denominator}}`;
            default:
                return `${this.#_Numerator}/${this.#_Denominator}`;
        }
    }
    valueOf() {
        // temporary
        return Number(this.#_Numerator) / Number(this.#_Denominator);
    }
    static #gcd(a, b) {
        a = a > 0 ? a : -a;
        b = b > 0 ? b : -b;
        if (b > a) {
            [a, b] = [b, a];
        }
        while (true) {
            if (b == 0n)
                return a;
            a %= b;
            if (a == 0n)
                return b;
            b %= a;
        }
    }
    static #lcm(a, b) {
        return (a * b) / Fraction.#gcd(a, b);
    }
    static #typeCheck(inp, thro) {
        switch (typeof inp) {
            case "undefined":
                return false;
            case "object":
                return inp instanceof Fraction;
            case "number":
            case "bigint":
            case "string":
                return true;
            default:
                if (thro)
                    throw new TypeError(`Cannot accept ${inp} as an input`);
                return false;
        }
    }
    static #parseNum(str) {
        let match = /^(?<sign>[+-])?((?<b>0b[01]+)|(?<o>0o[0-7]+)|(?<x>0x[0-9a-f]+)|(((?<whole>\d+)(?<decimal>\.\d*)?)|(?<jdecimal>\.\d+)))$/gi.exec(str);
        if (match) {
            if (match.groups?.b || match.groups?.o || match.groups?.x) {
                return [match.groups.sign == "-", match.groups.b || match.groups.o || match.groups.x, ""];
            }
            else if (match.groups?.whole || match.groups?.jdecimal) {
                return [match.groups.sign == "-", match.groups.whole ?? "", (match.groups.decimal || match.groups.jdecimal)?.replace(".", "") ?? ""];
            }
            return undefined;
        }
        return undefined;
    }
    static #randomBigInt(max) {
        let i = 30, bin = "0b1", result;
        do {
            bin += Math.round(Math.random());
        } while (Math.round(Math.random() * 30) && i--);
        result = BigInt(bin);
        if (max)
            result %= max;
        return result;
    }
    static ZeroDivisionError = class extends Error {
        constructor() {
            super("Cannot devide by 0");
            this.name = "ZeroDivisionError";
        }
    };
    static RationalExponentError = class extends Error {
        constructor(value) {
            super(`Cannot exponentiate a fraction by ${value}`);
            this.name = "RationalExponentError";
        }
    };
    static abs(frac) {
        let abs = (a) => a < 0 ? -a : a;
        return frac instanceof Fraction ? new Fraction(abs(frac.#_Numerator), abs(frac.#_Denominator)) : Fraction.NaN;
    }
    static pow(frac, exponent) {
        if (frac instanceof Fraction) {
            if (typeof exponent == "number") {
                if (exponent % 1 != 0) {
                    throw new Fraction.RationalExponentError(exponent);
                }
                exponent = BigInt(exponent);
            }
            else if (typeof exponent != "bigint") {
                throw new TypeError("Fractions can only be exponentiated by integers");
            }
            if (exponent < 0n) {
                exponent *= -1n;
                frac.reciprocate();
            }
            return new Fraction(frac.#_Numerator ** BigInt(exponent), frac.#_Denominator ** BigInt(exponent));
        }
        throw new TypeError(`${frac} is not a fraction`);
    }
    ;
    static parseFraction(str) {
        if (typeof str == "string") {
            let parts = str.split("/");
            return parts[1] ? new Fraction(parts[0], parts[1]) : Fraction.NaN;
        }
        return Fraction.NaN;
    }
    static random() {
        let den = Fraction.#randomBigInt();
        return new Fraction(Fraction.#randomBigInt(den), den);
    }
}
exports.default = Fraction;
