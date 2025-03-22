"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FracMath = exports.Fraction = void 0;
class Fraction {
    #numerator;
    #denominator;
    static get NaN() {
        let nan = new Fraction();
        // @ts-ignore
        [nan.#denominator, nan.#numerator] = [NaN, NaN];
        return nan;
    }
    static isNaN(inp) {
        return inp instanceof Fraction && inp.isNaN;
    }
    static get ONE() {
        return new Fraction(1n);
    }
    get [Symbol.toStringTag]() {
        return "Fraction";
    }
    get accuracy() {
        return exports.FracMath.qlog(this.#denominator);
    }
    set accuracy(int) {
        let a = this.accuracy;
        if (a >= int) {
            let c = 10n ** BigInt(a - int);
            this.#numerator *= c;
            this.#denominator *= c;
        }
        else {
            let c = 10n ** BigInt(int - a);
            this.#numerator /= c;
            this.#denominator /= c;
        }
    }
    constructor(numerator = 0n, denominator = 1n) {
        switch (typeof denominator) {
            case "bigint":
                this.#denominator = denominator;
                break;
            case "number":
                if (denominator % 1 === 0) {
                    this.#denominator = BigInt(denominator);
                    break;
                }
                denominator = denominator.toString();
            case "string":
                if (denominator === "") {
                    this.#denominator = 1n;
                    break;
                }
                denominator = Fraction.#parseNumber(denominator);
                if ("bigint" === typeof denominator) {
                    this.#denominator = denominator;
                    break;
                }
            case "object":
                if (denominator instanceof Fraction) {
                    if (denominator.#denominator === 0n)
                        throw new Fraction.ZeroDivisionError;
                    let temp = denominator.reciprocal.times(numerator);
                    this.#numerator = temp.#numerator;
                    this.#denominator = temp.#denominator;
                    return;
                }
                if (denominator instanceof Array) {
                    if (Fraction.#isZero(denominator[1]))
                        throw new Fraction.ZeroDivisionError;
                    let temp = new Fraction(denominator[1], denominator[0]).times(numerator);
                    this.#numerator = temp.#numerator;
                    this.#denominator = temp.#denominator;
                    return;
                }
            default:
                throw new TypeError(`Cannot use value ${denominator} as a denominator`);
        }
        if (this.#denominator === 0n)
            throw new Fraction.ZeroDivisionError;
        switch (typeof numerator) {
            case "bigint":
                this.#numerator = numerator;
                break;
            case "number":
                if (numerator % 1 == 0) {
                    this.#numerator = BigInt(numerator);
                    break;
                }
                numerator = numerator.toString();
            case "string":
                if (numerator === "") {
                    this.#numerator = 0n;
                    break;
                }
                numerator = Fraction.#parseNumber(numerator);
                if ("bigint" === typeof numerator) {
                    this.#numerator = numerator;
                    break;
                }
            case "object":
                if (numerator instanceof Fraction) {
                    this.#numerator = numerator.#numerator;
                    this.#denominator *= numerator.#denominator;
                    return;
                }
                if (numerator instanceof Array) {
                    let temp = new Fraction(...numerator);
                    this.#numerator = temp.#numerator;
                    this.#denominator *= temp.#denominator;
                    return;
                }
            default:
                throw new TypeError(`Cannot use value ${numerator} as a numerator`);
        }
    }
    get numerator() { return this.#numerator; }
    get denominator() { return this.#denominator; }
    set numerator(num) {
        try {
            this.#numerator = exports.FracMath.toInt(num);
        }
        catch (err) {
            console.error(new TypeError("When setting the numerator manually, the input must be an integer"));
            throw err;
        }
    }
    set denominator(num) {
        try {
            num = exports.FracMath.toInt(num);
        }
        catch (err) {
            console.error(new TypeError("When setting the denominator manually, the input must be an integer"));
            throw err;
        }
        if (num === 0n) {
            throw new Fraction.ZeroDivisionError;
        }
        this.#denominator = num;
    }
    get isNaN() { return typeof this.#numerator !== "bigint" || typeof this.#denominator !== "bigint"; }
    get isNegative() { return this.#numerator !== 0n && (this.#numerator < 0n) !== (this.#denominator < 0n); }
    get negative() { return new Fraction(-this.#numerator, this.#denominator); }
    get whole() { return this.#numerator / this.#denominator; }
    eq(frac) {
        if (Fraction.#typeCheck(frac)) {
            let f1 = this.clone().reduce(), f2 = frac instanceof Fraction ? frac.clone().reduce() : new Fraction(frac).reduce();
            return f1.#numerator === f2.#numerator && f1.#denominator === f2.#denominator;
        }
        else {
            return false;
        }
    }
    seq(frac) {
        if (frac instanceof Fraction) {
            let f1 = this.clone().reduce(), f2 = frac.clone().reduce();
            return f1.#numerator === f2.#numerator && f1.#denominator === f2.#denominator;
        }
        else {
            return false;
        }
    }
    lt(frac) {
        if (!Fraction.#typeCheck(frac))
            return false;
        if (Fraction.#isZero(frac)) {
            return this.isNegative;
        }
        return this.minus(frac).lt(0);
    }
    lteq(frac) {
        if (!Fraction.#typeCheck(frac))
            return false;
        if (Fraction.#isZero(frac)) {
            return this.isNegative || this.#numerator === 0n;
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
        let gcd = Fraction.#gcd(this.#numerator, this.#denominator);
        this.fixNegative();
        while (gcd > 1) {
            this.#numerator /= gcd;
            this.#denominator /= gcd;
            gcd = Fraction.#gcd(this.#numerator, this.#denominator);
        }
        return this;
    }
    fixNegative() {
        if (this.#denominator < 0n) {
            this.#denominator *= -1n;
            this.#numerator *= -1n;
        }
        return this;
    }
    get reciprocal() {
        if (this.#numerator === 0n)
            throw new Fraction.ZeroDivisionError;
        return new Fraction(this.#denominator, this.#numerator);
    }
    reciprocate() {
        if (this.#numerator === 0n)
            throw new Fraction.ZeroDivisionError;
        [this.#numerator, this.#denominator] = [this.#denominator, this.#numerator];
        return this;
    }
    get remainder() {
        return this.#numerator % this.#denominator;
    }
    clone() {
        return new Fraction(this.#numerator, this.#denominator);
    }
    scaleTo(factor) {
        let d = exports.FracMath.toInt(factor);
        this.#numerator *= d;
        this.#denominator *= d;
        return this;
    }
    plus(addend) {
        Fraction.#assertNumber(addend);
        if (!(addend instanceof Fraction))
            addend = new Fraction(addend, 1n);
        let gcd = Fraction.#gcd(this.#denominator, addend.#denominator);
        return new Fraction((this.#numerator * addend.#denominator + addend.#numerator * this.#denominator) / gcd, this.#denominator * addend.#denominator / gcd);
    }
    minus(subtrahend) {
        Fraction.#assertNumber(subtrahend);
        return this.negative.plus(subtrahend).negative.fixNegative();
    }
    times(multiplicand) {
        switch (typeof multiplicand) {
            case "number":
            case "string":
                multiplicand = Fraction.#parseNumber(multiplicand);
        }
        switch (typeof multiplicand) {
            case "bigint":
                let temp = new Fraction(multiplicand, this.#denominator).reduce();
                return new Fraction(this.#numerator * temp.#numerator, temp.#denominator);
            default:
                if (multiplicand instanceof Array) {
                    multiplicand = new Fraction(multiplicand);
                }
                if (multiplicand instanceof Fraction) {
                    return new Fraction(this.#numerator * multiplicand.#numerator, this.#denominator * multiplicand.#denominator).reduce();
                }
        }
        throw new TypeError(`Cannot accept \`${multiplicand}\` as an input`);
    }
    divide(divisor) {
        Fraction.#assertNumber(divisor);
        if (Fraction.#isZero(divisor))
            throw new Fraction.ZeroDivisionError;
        if (!(divisor instanceof Fraction))
            divisor = new Fraction(divisor);
        return this.times(divisor.reciprocal);
    }
    toString(type) {
        switch (type) {
            case "latex":
                return `\\frac{${this.#numerator}}{${this.#denominator}}`;
            default:
                return `${this.#numerator}/${this.#denominator}`;
        }
    }
    valueOf() {
        return Number.parseFloat(this.asDecimal(17));
    }
    [Symbol.toPrimitive](hint) {
        if (hint === "string") {
            return this.toString();
        }
        return this.valueOf();
    }
    asDecimal(decimals = 15) {
        if (this.#denominator === 0n) {
            throw new Fraction.ZeroDivisionError();
        }
        const integerPart = this.#numerator / this.#denominator;
        let remainder = this.#numerator % this.#denominator;
        if (remainder === 0n) {
            return integerPart.toString();
        }
        let result = `${integerPart}.`;
        remainder *= 10n;
        for (let i = 0; i < decimals; i++) {
            const digit = remainder / this.#denominator;
            result += digit.toString();
            remainder = remainder % this.#denominator;
            remainder *= 10n;
        }
        return result;
    }
    static #gcd(a, b) {
        a = a > 0 ? a : -a;
        b = b > 0 ? b : -b;
        if (b > a) {
            [a, b] = [b, a];
        }
        while (true) {
            if (b === 0n)
                return a;
            a %= b;
            if (a === 0n)
                return b;
            b %= a;
        }
    }
    // static #lcm(a: bigint, b: bigint): bigint {
    // 	return (a * b) / Fraction.#gcd(a, b)
    // }
    static #typeCheck(inp) {
        switch (typeof inp) {
            case "object":
                if (inp instanceof Array) {
                    return Fraction.#typeCheck(inp[0]) && Fraction.#typeCheck(inp[1]);
                }
                return inp instanceof Fraction && !Fraction.isNaN(inp);
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
                return false;
        }
    }
    static #assertNumber(inp) {
        if (Fraction.#typeCheck(inp))
            return;
        throw new TypeError(`${"string" == typeof inp ? `"${inp}"` : `\`${inp}\``} Cannot be parsed into a number; As such, it cannot be accepted an input`);
    }
    static #parseNumber(str) {
        if ("number" == typeof str)
            str = str.toString();
        else
            str = str.replaceAll(/\s/g, "").replace(/^\+/, "");
        if (/^-?\d+$/.test(str)) {
            return BigInt(str);
        }
        if (/^(-?0?|-?[1-9]\d*(_\d+)*)\.\d+(_\d+)*(e[+-]?\d+(_\d+)*)?$/i.test(str)) {
            str = str.replaceAll("_", "");
            if (+str === 0) {
                return 0n;
            }
            let groups = /^(?<whole>-?0?|-?[1-9]\d*)(?<decimal>\.\d+)(?<exponent>(e[+-]?\d+)?)$/i.exec(str).groups;
            let num = "", den = "1";
            if (groups.whole && groups.whole !== "0") {
                num = groups.whole === "-0" ? "-" : groups.whole;
            }
            num += groups.decimal.substring(1);
            if (groups.exponent) {
                let exp = /\d+/.exec(groups.exponent)[0];
                if (groups.exponent[1] === "-") {
                    den += Array(+exp).fill(0).join("");
                }
                else {
                    num += Array(+exp).fill(0).join("");
                }
            }
            den += Array(groups.decimal.length - 1).fill(0).join("");
            return new Fraction(BigInt(num), BigInt(den));
        }
        if (/^-?0x[0-9a-f]+(_[0-9a-f]+)*$/i.test(str) ||
            /^-?0b[01]+(_[01]+)*$/i.test(str) ||
            /^-?0o[0-7]+(_[0-7]+)*$/i.test(str)) {
            return str[0] === "-" ? -BigInt(str.replaceAll("_", "").substring(1)) : BigInt(str.replaceAll("_", ""));
        }
        throw new Error("Cannot convert string to number");
    }
    static #isZero(num) {
        switch (typeof num) {
            case "number":
                return num === 0;
            case "string":
                num = Fraction.#parseNumber(num);
        }
        switch (typeof num) {
            case "bigint":
                return num === 0n;
            default:
                if (num instanceof Fraction) {
                    return num.#numerator === 0n;
                }
                if (num instanceof Array) {
                    if (Fraction.#isZero(num[1]))
                        throw new Fraction.ZeroDivisionError;
                    return Fraction.#isZero(num[0]);
                }
        }
        return false;
    }
    static ZeroDivisionError = class extends Error {
        name = "ZeroDivisionError";
        constructor() {
            super("Cannot devide by 0");
        }
    };
    static IntegerExpectedError = class extends Error {
        name = "IntegerExpectedError";
        constructor(value) {
            super(`\`${"string" == typeof value ? `"${value}"` : value}\` is not an integer`);
        }
    };
    static parseFraction(str) {
        let match;
        if ((match = /^\s*(.+)\s*[:\/]\s*(.+)\s*$/.exec(str)) ||
            (match = /^\s*\\frac\s*\{(.+)\}\s*\{(.+)\}\s*$/m.exec(str))) {
            return new Fraction(Fraction.#parseNumber(match[1]), Fraction.#parseNumber(match[2]));
        }
        return Fraction.NaN;
    }
}
exports.Fraction = Fraction;
exports.FracMath = ((obj) => {
    const _abs = (a) => a < 0 ? -a : a;
    let immutable = {
        toInt(num) {
            switch (typeof num) {
                case "bigint":
                    return num;
                case "string":
                    try {
                        return BigInt(num);
                    }
                    catch {
                        break;
                    }
                case "number":
                    if (num % 1 !== 0) {
                        break;
                    }
                    return BigInt(num);
                default:
                    if (num instanceof Array) {
                        num = new Fraction(num);
                    }
                    if (num instanceof Fraction && num.eq(num.whole)) {
                        return num.whole;
                    }
            }
            throw new Fraction.IntegerExpectedError(num);
        },
        pow(frac, exponent) {
            try {
                exponent = exports.FracMath.toInt(exponent);
            }
            catch (err) {
                /**
                 * \sqrt[n]{\alpha}
                 * x_{k+1}\>=\;\frac{1}{n}\left[(n\!-\!1)x_{k}+\frac{\alpha}{x_{k}^{n-1}}\right]
                */
                if (err instanceof Fraction.IntegerExpectedError) {
                    exponent = new Fraction(exponent);
                    let n = exponent.denominator, approx = new Fraction(frac, n ** (n / 2n)), realign = true;
                    do {
                        approx = frac.divide((new Fraction(approx.numerator ** (n - 1n), approx.denominator ** (n - 1n)))).plus(approx.times(n - 1n)).divide(n);
                        if (realign && approx.accuracy >= 200) {
                            realign = false;
                            let max = Math.max(Math.ceil(2 * approx.accuracy / 3), Math.ceil(`${approx.numerator}`.length / 3 * 2));
                            if (approx.accuracy - max <= 200) {
                                let div = 10n ** BigInt(max);
                                approx = new Fraction(approx.numerator / div, approx.denominator / div);
                            }
                        }
                    } while (approx.accuracy <= exports.FracMath.accuracy);
                    return new Fraction(approx.numerator ** exponent.numerator, approx.denominator ** exponent.numerator);
                }
                throw err;
            }
            switch (typeof frac) {
                case "bigint":
                    return new Fraction(frac ** exponent);
                case "string":
                case "number":
                    frac = new Fraction(frac);
                default:
                    if (frac instanceof Array) {
                        frac = new Fraction(frac);
                    }
                    if (frac instanceof Fraction) {
                        return exponent < 0n ? new Fraction(frac.denominator ** -exponent, frac.numerator ** -exponent) : new Fraction(frac.numerator ** exponent, frac.denominator ** exponent);
                    }
            }
            throw new TypeError(`${frac} is not a fraction`);
        },
        abs(frac) {
            return frac instanceof Fraction ? new Fraction(_abs(frac.numerator), _abs(frac.denominator)) : typeof frac === "bigint" ? _abs(frac) : Math.abs(frac);
        },
        qlog(int) {
            return int.toString().length - 1;
        },
        factorial(n) {
            n = exports.FracMath.toInt(n);
            if (n < 0n) {
                throw new Error("Factorial is not defined for negative numbers");
            }
            let product = 1n;
            for (let i = 2n; i <= n; i++) {
                product *= i;
            }
            return product;
        },
        sin(x) {
            if (x[Symbol.for("nfrac-semanticKey")] === "pi")
                return new Fraction;
            let sum = new Fraction, k = 0n;
            x = new Fraction(x);
            do {
                sum = sum.plus(new Fraction(exports.FracMath.pow(x, 1n + 2n * k), exports.FracMath.factorial(1n + 2n * k)).times(-(k & 1n || -1n))).reduce();
                k++;
            } while (sum.accuracy <= exports.FracMath.accuracy);
            return sum;
        },
        cos(x) {
            if (x[Symbol.for("nfrac-semanticKey")] === "pi")
                return Fraction.ONE;
            let sum = new Fraction, k = 0n;
            x = new Fraction(x);
            do {
                sum = sum.plus(new Fraction(exports.FracMath.pow(x, 2n * k), exports.FracMath.factorial(2n * k)).times(-(k & 1n || -1n))).reduce();
                k++;
            } while (sum.accuracy <= exports.FracMath.accuracy);
            return sum;
        },
        tan(x) {
            return new Fraction(exports.FracMath.sin(x), exports.FracMath.cos(x));
        },
        sqrt(x, guess) {
            let str = new Fraction(x).whole.toString(2), approx = new Fraction(guess ?? BigInt(`0b${str.substring(0, (str.length / 2) | 0) || "1"}`)), realign = true;
            do {
                approx = new Fraction(approx.numerator ** 2n, approx.denominator ** 2n).plus(x).divide(approx.times(2));
                if (realign && approx.accuracy >= 200) {
                    realign = false;
                    let max = Math.max(Math.ceil(2 * approx.accuracy / 3), Math.ceil(`${approx.numerator}`.length / 3 * 2));
                    if (approx.accuracy - max <= 200) {
                        let div = 10n ** BigInt(max);
                        approx = new Fraction(approx.numerator / div, approx.denominator / div);
                    }
                }
            } while (approx.accuracy <= exports.FracMath.accuracy);
            return approx;
        },
        round(frac) {
            if (frac instanceof Array)
                frac = new Fraction(frac);
            let w = frac.whole;
            return frac.remainder === 0n ? w : frac.minus(w).lt(Fraction.ONE.plus(w).minus(frac)) ? frac.minus(new Fraction(frac.remainder, frac.denominator)).whole : 1n + frac.minus(new Fraction(frac.remainder, frac.denominator)).whole;
        },
        floor(frac) {
            if (frac instanceof Array)
                frac = new Fraction(frac);
            return frac.remainder === 0n ? frac.whole : frac.minus(new Fraction(frac.remainder, frac.denominator)).whole;
        },
        ceil(frac) {
            if (frac instanceof Array)
                frac = new Fraction(frac);
            return frac.remainder === 0n ? frac.whole : 1n + frac.minus(new Fraction(frac.remainder, frac.denominator)).whole;
        },
        exp(x) {
            let exp = Fraction.ONE;
            if (typeof x !== "bigint")
                x = new Fraction(x);
            for (let k = 1n, i = 0; i < exports.FracMath.accuracy / 10; k++) {
                let n = exports.FracMath.pow(x, k), f = exports.FracMath.factorial(k);
                exp = exp.plus(new Fraction(n, f));
                if (f > n.whole) {
                    i++;
                }
            }
            return exp;
        },
        ln(x) {
            if (new Fraction(x).isNegative)
                throw new TypeError(`Cannot perfor logarithms on negative numbers.`);
            if (x[Symbol.for("nfrac-semanticKey")] === "e")
                return Fraction.ONE;
            let ac = 2n ** exports.FracMath.toInt(exports.FracMath.accuracy);
            return exports.FracMath.pow(x, new Fraction(1n, ac)).minus(1n).times(ac);
        },
        // gamma(z: AnyNumber): Fraction {
        // 	z = Fraction.ONE.plus(z);
        // 	let approx = Fraction.ONE;
        // 	for(let n = 1n; approx.accuracy**2 <= FracMath.accuracy; n++) {
        // 		approx = approx.times(new Fraction(1n, new Fraction(z, n).plus(1n)).times(FracMath.pow(new Fraction(z, n).plus(1n), z))).reduce()
        // 	}
        // 	return approx.divide(z)
        // },
        log(x) {
            if (new Fraction(x).isNegative)
                throw new TypeError(`Cannot perfor logarithms on negative numbers.`);
            if (/^10*$/.test(x.toString()))
                return new Fraction(exports.FracMath.qlog(exports.FracMath.toInt(x)) - 1);
            let ac = 2n ** exports.FracMath.toInt(exports.FracMath.accuracy);
            return exports.FracMath.pow(x, new Fraction(1n, ac)).minus(1n).times(ac).divide(exports.FracMath.LN10);
        },
        random: () => new Fraction(Math.random()),
        max: (first, ...args) => {
            let max = first;
            for (let e of args) {
                if (new Fraction(e).gt(max))
                    max = e;
            }
            return max;
        },
        min: (first, ...args) => {
            let min = first;
            for (let e of args) {
                if (new Fraction(e).lt(min))
                    min = e;
            }
            return min;
        },
        trunc: (frac) => frac instanceof Array ? new Fraction(frac).whole : frac.whole
    };
    for (let [k, v] of Object.entries(immutable)) {
        Object.defineProperty(obj, k, {
            value: v,
            enumerable: true,
            configurable: false,
            writable: false
        });
    }
    return obj;
})({
    accuracy: 200,
    get PI() {
        return Object.defineProperties(new Fraction(3312432684171355764844425214526211561221456908697468476098834311521799491595194813963099867042513280557375666433802142549108636027957170581354584232177076728001976266605700106311243912748703915065676930894607095591776205035218664236903525663327640751393357366718177632804361115314925480838524596059827260107082753359241500982664887324959568223964921678486334436335597680247548078662472848445470910280698949417712984594422819629326916585254991886232256556410253038364716006552787509241534889269607019157876813986974142223540016187953845989344476208859757193430135665493409474769594570777074624091165770842633539189274892515931744114505999746573669238783565171217867157380096588971258571433863602323432164961133505243473630677620053306151188053470058521060150781710126060381061677638263285320852082769170736323308688859006851121718532104379994676352686865838217285161329729344036495344793293448129695992556703848739025777655680016080790951063036877262840872336391831139903583863036883331600510136519894968887394052228985601053308057344014548550528562438898158879106869835935983279173643364974300187809588717648298492106631135026621616018067930976544991572372395411584530587727585629548927754209297053775989573919645226077722306370771835076321683354145121267368405086232573501910714430809578949900432042404768144606097154359708506557845186894366115619540910753966241777834662940111011798589930812499711234845430676509999156559831621508284032228685855368338267057662007308645773541943576143970430215495644728618472002710283450722107205624991237438392844346316355539738645441520246220467738592355105977157422466125077960763172874689525769856599460865384988885180553801768864590322861181372926459879123751125190899883636843039824143866060233719923376205838876653313507939938859233175944251917407989067443583613363032741190309268275020455168606885561274485139893148563261776204995196554505952195490269243548363743895685423880204099912497912851930263152935128517132809965227962049796484464062673304055753693487074954973313163698281156885849007138026521821029794801805228898742479366677366962694341616420775054513855479237593465298706051940002076498842156356103652279457274581389098627818523894474285034025063489040802417655842528908593688530352349953275178042320809n, 1054380070690052485420575084848065912829970358297427335210193292475517217281982515086446841690384170367392197796914945606069490967337853950773378811486977247224640796321807398341487085859500989607157634305959915353595672155717832864502550066781188921477490010251704510154038801922172459389245764578640028228151665749597040181178348050773355406181750152789892624042132561908331731172260826280399175454503194887761675322761114392116851283485225505375389024619419184829261672841512595167290099346117313382430221489608878590319878311291602123187890533532810979359677089938651798222433153475963890652689666685004365783445326054164730934588968281118490082026488976937293941933324704095527191866370967635360319179080635824013067956814086736305295367222822450807006341342797339727769103329670759033114253967652178559145980057417174510530891206579391622535160808708272396891925739746867255836656566035143789662107877457956831091731304864082923445449656051415322919431799198120849597994665676635517207697368279739984756215503498019599030730019219840938896916810615877610986309397207536706608399671403876986207358159500640376933307969515776737003970599057342191382559293859154174076596886051295160706883714461672844654133134673496049810664649322576354713485456031534288604525042110791648770339131722388670617962356109535576291431396266850617913590978812359099231627667733930646800054153953582784745482488533109862953082171195398417843017938526186175988771406845295812305163822307130180696087114171561939882313150003633293529409509934746636311588706516658456864796510583836122247823365741594954310680432289103941972412128549976367992291084298147108891864941618795081875534013538382137737235731402527152738467762459938337773436924685993424584498105540917779982630493794999234755647165187618488927961507481030415188041415232940442965606008300271390412846751781980167624082647343123621170760607600631759468608961639191862047335906673310984757330295420728930400222529852850969909714327580353901188121121057115969202966219207352748955301342017096456189393986107766262326210362700259237694005443791651864259156829272043134216639277303706268758241450132148049046600308106562215544472383362544409054338825615454044681765075647778346325013378420013514230859829390617040077307029n), {
            valueOf: {
                value: () => Math.PI
            },
            [Symbol.for("nfrac-semanticKey")]: {
                value: "pi"
            }
        });
    },
    get E() {
        return Object.defineProperties(new Fraction(72640639803496036933355503420955506694852064596095480585566974561554421849362169952256271906542286189338467069389948680443717671091549731621490165567588971817063483295338727212129815344288160427676061826422486135893690875047041882025593706503577264121341249700326016965614974423252370577636901698477490800886156262487804470226949841087159691542382148881144367553659674869195563359601857611469432636292838485021641409238927345121777915494589951982059759657218695781913562761424450627810593275478106324606703468227945168403215876731752665800211944404618583632305044871279113748495109439557530528059411517292539613050027015835277040144151727095412087106361440261047890729353525647874234742469207006843226718579266235301071095404251262746805745216424459267421300327181847220503180984750102440293228891673103059524205767609625726827378423566781194953617167889425572289680983356095138689338713325047826166178729549115592552005341330053571319877789195341227669460771123689519929915127401034677487410517936937568611368283841116783066633727196751455003795048810563326350268608114992402581978892693936211979491947079347880479695870148000869211368777295392790021658801888396903007984065112221596564673506061029363340411782989322246438035233072329061509705284854331264090723927382029114743158572572180516776724098148441899769995324515385955205993712504275391057031160447592625347345996802726243974232772273725797123976425494276904385062040081065429324738488630489827754320422288716956430492769346951085996710709255329309259258219254826705261809606251778730704221353017614702864011606827302990296903625976801101378578953771594994683325946011273257591777467727154789751519987647161655640777447596094902133366425470695010720367314483872819886736049855364348344055801574772491914558121429787600781236436308069949143104687643737128891322650668872231277008316243520642666643167013416767947336011576338157730694396807288139757844024504713727757387783943263868950701063665520105287038908952746225125452014672588577762071821938410166931339614345387962815208668563424581633742725379773473253347210819834520494202319836058894879648891682579182520462507795183495616134460537540354317870224413155730757473717722623054428435799965675895471020253131531450899102326491178448232101089106n, 26722997977246151842853749021649529122488280898290715840286584696083324223105999084624936770802867585157777137518984339425373780420704871711992528503749142319997439298914261279036848807330312627375859847277186098651726874358161973735418568234272515540862565211001882054767226276947001800362443029386817813738101005878902827608426040953901651765429311801331745237910906674744265903334383690222675535101859050632745170724567684844930441543379700479031855084421484441445324480264247603081569008767939798186620634015103412443773966202490417369129995887376725784877223898429534740839558255928290704166803865770712763668714284115764075840413964680982456492414662441731156408894075508974958473530336961787424766106135417559142721142990673664416848587415218070731024398490232885226115070284562130050422292850107574693049742448730742543341495982509473603647828271518105886115948071699163562415645030832185450328486488627560004581556534601842158563552259725369835801608052994322948378754358578494057777540669115072716617344069340562861583342739277847917327403700029833939111527470201979931925448321407154936683355492584438895054934835974621232047021761390687059979053397297871466930700644544134907686929828078622824738427506773240299101114098923394470451672057600774552397555712752722802155950334460591919529272773319858126361393176276981303802744317571373643391866956457394484897317711646130808339843523885785482611196041748021408922153483418173740467685803006874566847960430622215662129905068099496759231410831106261852370191086714608499417607229766879140142366095920584132283641816635192145432247549166228715482022755510494377285343224290720672098840314342143682737824831684007020725483820388172245563077629349420589520633060520075306840815995454541046026199031163766180641146013996799804897402946408057695915692811507812973542917155177323246800410794117057040011950383726958083569911643503462619117148796494162528374123717191704414222318398251899941529261507011846371304449198809532685147961372017580527314799362701159924866971239873020968103672875434229107676231802356623723441525050051909964067529050452812504015358729708407756984629906091496936798980427325371419546765020670022867255066852096655581591196592437505864809001778041913223541212684379391237475483759n), {
            valueOf: {
                value: () => Math.E
            },
            [Symbol.for("nfrac-semanticKey")]: {
                value: "e"
            }
        });
    },
    get SQRT2() {
        return new Fraction(352045419625890138314143018950495084609622169853228268804789166860860832569051840946136367092916491273697989814287403290681392393022320368995763821220561298177275825033237337351930134821850593705979226877227630115730106745970139052755592795068982613065319945797469024215819654201408598513136393949991719804025565912063051676248178462717415205148552406118649973352795028951069263276206359398585246938842347360695956693515646660094798328530365872414863225668738422483392759276276434892377908855803233339766629251543382154136367928873028423987891748113219459737185780251001647333491605098694504144403590057688784529617657866457714574878222669965516009674125069316297418380053376900626269718396347557430015203455258767829172810032019943441473124346402394356135412599739574070076321302302314399004185076375196893080314889976542758079986732050955876887013645679386270495738457131065129586916594625656418798058735180690991691898699933450727411457727145018818475912435391504431769680017621258041327616476771326130915459903245965243975727085475515687859625685991539126434468978819868281175827820276175901029129426959034823497650664309525332344455566191684166071156831848145894156857303739558049895611492245740631364353465000769362162219583607152479889077247809922980881752337628901781702921718842760657560166311206336440439675830299244417487862241747109334825675263722697883642560772482003892674410158742207892215526868911530419632509256245485710609669555163255130970562733685642456226242150380286062929523635160255448787146823545291356613075201571690206691396276883841706845237526490779622260142944816584714254023921459281124796838388226911009177388983622511382239773252798104088272633412449446487793119858875697796921430172913317712705911498676970811701923946179940968730528001984969971249679217131009638692753358096054329769503653464100589785951633370043033195957350272025720165573720200072691382884648809085613091237097464804189585382190125681109682084900970416190335058621523402075446798361618179097624152451913774261666474421596074963481171686401247602021325211519200493021465242287758308827960743600040014628467050461863018406582940557096046512598629333504307083141967552371485738742190380429481345649203601972819802344955267269768812679498006392189197105722n, 248933703503130601470824670164101327208758432497099831512423654882034773244957498035491485000095708727188712263295624213308672019993412384939260366551164272191631689722972656122940613193599189963209524977516865789437668014029741034962379326982703485065625760322006890994132217730225322209395854603149769498480552369470480502085984778770108693266699687232348301259221826088344960518526116840099072162647248363421648772303459350946384296414749722683777422350699661618997691037796162705507518982582514036865316454728658542268273133728781756397027510815925627754655284810703179278633383211117214741480525865204594612602428964332717995535333042004649530660303343847467607827166044172775515330839287213162448428426838804768833340663109278647938092883794483572697499272721082114759724946934459643091304964630470480161973320869646929881681317649693995156383310663174684092004719921514339444515618789120475208962615864733017187842569853456394518182203102633149138141514374590260672049579537307055807006684043328999698339237882540097120412858569093280284976197381373244526384981542300674958274442067567172264163847739908377410062534495465946590655723325680543016123286396553139605522480532725835960951460664617624916663208245620431700967696334733450871717744728264885321827211035579883262954344022611648382835550651687505532257325775205824503132680951017268642640624565913672333252653840011266485815642807374925059753989795660892047859313823236633247541760557233233369568814163540149530811680769041891209683411185246311037536291553339232533297363064150577068768640294343234690660572155995785237151540310681149409779845037086165968872582008962036918311513559128189083262700342154510017428798786130022101886047353215420717254237216624366338973343036608449499015644880091415937907519176835503665162596093148571248078420377909899882221170021084741219971652051317541206580515982688314822716796859882221939298847514395227350124741102628663117225330458090226776966366469238346125610603358399009386385615512182718871526912197713355028602348526219737672388965334820634622267216242305427618817393024776113916978686145005327189713581582068242090975696516686429433007221883383590678044931340968805910948255395374127699676080427842981311316647363068597353713068113351530235118121n);
    },
    get SQRT1_2() {
        return new Fraction(248933703503130601470824670164101327208758432497099831512423654882034773244957498035491485000095708727188712263295624213308672019993412384939260366551164272191631689722972656122940613193599189963209524977516865789437668014029741034962379326982703485065625760322006890994132217730225322209395854603149769498480552369470480502085984778770108693266699687232348301259221826088344960518526116840099072162647248363421648772303459350946384296414749722683777422350699661618997691037796162705507518982582514036865316454728658542268273133728781756397027510815925627754655284810703179278633383211117214741480525865204594612602428964332717995535333042004649530660303343847467607827166044172775515330839287213162448428426838804768833340663109278647938092883794483572697499272721082114759724946934459643091304964630470480161973320869646929881681317649693995156383310663174684092004719921514339444515618789120475208962615864733017187842569853456394518182203102633149138141514374590260672049579537307055807006684043328999698339237882540097120412858569093280284976197381373244526384981542300674958274442067567172264163847739908377410062534495465946590655723325680543016123286396553139605522480532725835960951460664617624916663208245620431700967696334733450871717744728264885321827211035579883262954344022611648382835550651687505532257325775205824503132680951017268642640624565913672333252653840011266485815642807374925059753989795660892047859313823236633247541760557233233369568814163540149530811680769041891209683411185246311037536291553339232533297363064150577068768640294343234690660572155995785237151540310681149409779845037086165968872582008962036918311513559128189083262700342154510017428798786130022101886047353215420717254237216624366338973343036608449499015644880091415937907519176835503665162596093148571248078420377909899882221170021084741219971652051317541206580515982688314822716796859882221939298847514395227350124741102628663117225330458090226776966366469238346125610603358399009386385615512182718871526912197713355028602348526219737672388965334820634622267216242305427618817393024776113916978686145005327189713581582068242090975696516686429433007221883383590678044931340968805910948255395374127699676080427842981311316647363068597353713068113351530235118121n, 352045419625890138314143018950495084609622169853228268804789166860860832569051840946136367092916491273697989814287403290681392393022320368995763821220561298177275825033237337351930134821850593705979226877227630115730106745970139052755592795068982613065319945797469024215819654201408598513136393949991719804025565912063051676248178462717415205148552406118649973352795028951069263276206359398585246938842347360695956693515646660094798328530365872414863225668738422483392759276276434892377908855803233339766629251543382154136367928873028423987891748113219459737185780251001647333491605098694504144403590057688784529617657866457714574878222669965516009674125069316297418380053376900626269718396347557430015203455258767829172810032019943441473124346402394356135412599739574070076321302302314399004185076375196893080314889976542758079986732050955876887013645679386270495738457131065129586916594625656418798058735180690991691898699933450727411457727145018818475912435391504431769680017621258041327616476771326130915459903245965243975727085475515687859625685991539126434468978819868281175827820276175901029129426959034823497650664309525332344455566191684166071156831848145894156857303739558049895611492245740631364353465000769362162219583607152479889077247809922980881752337628901781702921718842760657560166311206336440439675830299244417487862241747109334825675263722697883642560772482003892674410158742207892215526868911530419632509256245485710609669555163255130970562733685642456226242150380286062929523635160255448787146823545291356613075201571690206691396276883841706845237526490779622260142944816584714254023921459281124796838388226911009177388983622511382239773252798104088272633412449446487793119858875697796921430172913317712705911498676970811701923946179940968730528001984969971249679217131009638692753358096054329769503653464100589785951633370043033195957350272025720165573720200072691382884648809085613091237097464804189585382190125681109682084900970416190335058621523402075446798361618179097624152451913774261666474421596074963481171686401247602021325211519200493021465242287758308827960743600040014628467050461863018406582940557096046512598629333504307083141967552371485738742190380429481345649203601972819802344955267269768812679498006392189197105722n);
    },
    get PHI() {
        return new Fraction(1597106785460049180690531119352459784949311992232723324373512164851969076306454313814077584966312131334222738375176335556008515252283611038098637403364008920013358486664792719059907689358869802548443105031024050954469065072322634122590672893223924877158528225861034757760114185965321147237450678147454233142587735785417832847609191393374168297822987184675809420102923371976299153097053861830981087263825282406086135537184936811315588573997868386581285887600518935143963335921472737645906339080957669861339542620458272462666109450131529004147459140639078253554679128287795524515137364813428746443418118268359257907579043494772251723629593629967172171914894694092797221873922844304473988556552005859046046854251423138829757656260222756800591926536560339985830932294459841593700779233998986838203087312726131596047745155823995570089982093580250388719754480877822343953592685462418080320794838229115528825640691302259341459830364080724496889627394767446058476849597267897675257840979685718758270624149671750927392433115610130639881899278058644347044412502495149248213478564128223097387751567379805417104271030819584344111987316459635802574926439688160241344320378567890237235023516639641386202062418155445212563764002384050960000251271650736910362565458059113912340236483290759536168639330777141182746393450355464075590476054875128902859451497608716369562202872093513881997012144994163087718701570870743788735729543600786657476928673405592142150595217592045687175184739507408723522824696893247944151970221747731685632475436821710485026573570128506699886894090769316512105802348827859210135852052035200154400795927572619745800218515405852378561988259658757014372448147451385641393962829536393087041690679666296321948788782871242384156091628393999207288310394084363065638016429461945229681802967562594969742569424618268182541511433438907749929090649683059986883609780480764359025000174583065204136746012329997393640002852576856511504457711194672151545660722544813924098974870282913148382436996473114664382954404394157787281915535093982168665757710392323311711203174762228281192391297674598393486186091316740631841911283473341558171402826750686020576677655976302019312653845439797781148916395614111434564852791342366868031672559786016557625307942299181103139274813955327440766554158116362632701448882010142533438704265927911842325044663326799167923994892962213667464820415256884748649359156345069525718376103144140484840002890036419109361402238711661809180105853095485483592235191089279915510648330346067741192089n, 987066277077396760267380753339106881483644092615312957339205061375790690005578368196148871287916482639714289375170205605024835698544024461072088346572268869854475242265613788915500688515336522734802544113956155349215435366773379838949703187801572561610931925224008667508724104358190117944160148845038945479010975592299555439097796471992997477517381028295223904074539278596736298995208477365026434400822120611763013086534783980781791331496200326458434709352866460144771419319137430479235347259389481653942251674873170414315493569419904745135409944127842408513278327751659656980394480750903477700478461672396795145540336055481863574888105720964289435756354484720427855194047541813061481192259919311386528014189180218318234981442763938447477914695473343018425669056754877208981549340541860963338913564188889385198706457478624387057564003175738011440594776899809905801393154693096271374710025111458947058790249310790185140614014691398794841192023470226370160934138410230564913788686530771605113532483815654271865550756626696468881781259942797217981335255510151821251982686547184498278784689993116844545801631873169837392961987398794658224905868127962959844016802900733673377545575628154893803068606275879973840046028219556583219559267887552770322320063562361839576770616152612710111478184799480361491131527352708718003186000883630393328560726859739580599753538877288756300347273172150526141612100350187811825570375826229951847065332810797331941465176273725875315775170827465427082352093329154281708080523586628386418849408576617111536218548323973736982486913713903442626817505226780821231987315252982707245552020051829699995087997988663075104272997085261344285048109332453076960219376962145035200229929278631950066396932374493933660891027856895837466594188381766822095980138351723359259414976746310526715645052014925128028949302747622145230848692301858677506353669356118526338980272014492734405245560868580689932739012148476179930010563268633570845919087370363503084088424052873116120295237154402862852450965822250866608714804619546085411906595647772133761253568651448022810667866402702162239425406096230628866421610868944699236102303682412958936705747688611162630187144169549215461885471120848931533206402219668102831525698442475844407459995755994207420877956268171832568959119644505923684301809729462524794904033174263250138441631320271144879201910468011373558604348532074637864999122005208790273623283872031046611519340109443940040049367033167837652867082893433732311196336917050721112279814865394068623856n);
    },
    get LN10() {
        return new Fraction(63798480908595328818928406050605221457680466360423341011635931831950273154016469424759507681750581965267455766452924306298747470015357077630022052289671566427489427577757772161665067867273382340991210691704890662100249538017756285952052686629132371724643600737747149936750662855897960414464457538431808752155319376964685817619588322181037844690574314129058703239667273028408336272913666629063736381065862872759047162391202149231847543313787209424727703959068909215868325641294644486527342349362217362290323010704910640186396711575348837998328670057775706334787222510510953729203073667061452067861146447080384687226122592803460210556388643048709866195318776126089120989506357463404435121037440151795231503019800048647553372690044458005726134931131457200856189572642997845517144234061173265697760339403422864826684683837382794405921079402473425238291967933277314076289788386884762093674439581029929346527360371573393321596777952720902776564580557977940774702069461012521943731216559316431085232520017991887256497352736773538170089917277799511529188960811203667520412711664255027851611407523353843450833787515009479294989149247855776641546506156672556041162696089416765904822525612468673559586098634036093879605652494844670215429496932846069528840232136559760297628987345328357899200553429119407229391273715685382616721137337547676975907333186616267447307639179130779172336960930154831732984817316061337069424105883689320487484611640248730321963820219479495444382858231744298406090102551012082379919854038915529536451801187944042974863919033085978335243845685813457374318273966110127335249622683464470885064031835234060909927765388584231950520946316820891549448476466052311637144040915372428948697384790362433114181642896190442357527562096657622545159544904755427592489799634632968801381983491334326491885085870733542612246996981249162262322864452938277883988509799437511528798112946963437423542748526310379789461892905239445043341192950512665649061933708923385201005910158099584703774146946140618034367489015675791615173235770000750281667158614433697919528473548676209209372959633312681341837776808020210421390101259874210003302281447937526877936692806645044469788592190284045840908128018102335601956600886522999956922207303051394960648953737065106942797472788131398674175507479500804682602538142n, 27707328212412911250495241743803034533464030921626413756645080599450627016698630204381214877825492059748817285207403104364459191581401108758496802827177102776961297806375706019145542105619073011839487704638976848653317966990121233365998060976312100142269055578098941099950943083567629019207522392544908193500912565439823270342909035047324652762657899624540501855704088115082396909890246888563223911692266748280973144318745219089407958115674135266371259968667345035141680233307539491328442375302525624164743530721630994496686364875828402780179304828162435234665074441288167137081087367890440527885758276529929231971960848248461708888395567448081033475674505429500315054747741317471425888045282468660704797527865603416682765821949829089744267778263811158761663041019445816502484776137631949944182186608005656182020132061888499127498462179762771939067900375064015320319565516837192184724619917302868157955668942521964850668305897604639195919707935509088027520989649915931858296113679132564642040157104525335930249686311390683486030789493076269909350972725243221991080431413444495318962762942028338800253512954194234441067623078714962893950986604674822736294581887617226498280543918570783168331980221294578927954058271409285061559166147946403030721049042273613774003837886873694010550545891294572534492889176901226598477897047413851087306918848142492024160346193615449109898205424997159995269708754609696178314406184649081625016539440516848417285494213306506154792639436890245228636806097821221856038328853476015304661836220874613267249179030322705227184616904888724767283982182843015378126422754787691447918978505150395562942055865475687543239869630465182409767235737809254592961812084262776785785291679430145688360404821448692248495780935050565261096600358716332685279616337388555802578231984218134771503981070218141677816778847266214110699716033393246567187309661589409025169692188208737024053312003240208243050468079722360702745665874626728685341864944379454353695468324063392869817624484711285551746732409677139557767195410863563261330347377331722674514149763943465425377341053844744921892979636863536182035920501260543014063841269958931339890402098811647185419444303922864346641240027952346060483805537910840601072900085223137035937323598210279673955844420992742746800646311196019595677289321n);
    },
    get LOG10_E() {
        return new Fraction(102168168237604435054711917921700665314038865294337013628366725854235315083769377458533235795748796005516707149503920125849515008552856615950153067153750317243263617487935634670417134946805010331378444152949226750249692753506366968563257950840544563452762859093006174485719601033323806011067877084803074792224239669517535764974780729228441930851991850521945357576352652131147521689192764090676934134800834417879807294259110743086405397882550667226484033033847266784140007517217842563398863230040343540249194306957895778037972962423722968675159361317080824870894384178433450115586455312428649217944920267439592035892362019147652310388324657337795101462891693777992286393148599663168534640474867421535683700389970580308506870163074309524827924354884148217420525670500526244501797669088744884032934377906365036406977199956880441467599699793005467534487045914504843387031205004854002818902146253848160247817583259829284318420927398368536851908745223213527174056926727343815442628554399051740877736954822961304887221056057761146426699031058806416221600155660872653095129325703412805975480574921926603781486111632967246952335813803935300240825607492930159105904009655315946144561108744952178263484207361897853132478735317861519851237003335824183974980861469330105898751327566711823365586915187803950875562569419295764575221556820749305564310738833077215143755181762046721748096970897418833353148264826191820780550388448635048480484808267309383775044292256492470972958564943926782457203691345854822222930579261510391711473340141103513673764782226637703405006853888780109395985335738163777346950850670460273725514348193808155922772350171988362839010892808297833509976564518637909526567502963034827537975384225430482726843997838849810829010245364271099720193383882323594162384124340804361088628494847433091001527333229838415195514418800560820895703049472794961272598977502576055663768314523222596927014752473406745773879447239163996283065336981354871257894413270694958609802153735652963234741866004448293989959228508640946486119639705816634249941211147957026528792884885994306606493556539960224064266448131509509258967457760432120919194653746814431666211420031317265332820764044021277876790395123391741171143124444601260129931833569339398320450411569632567866709257286431967n, 235250901162415712630676595695661619873483207579225361367690800614989451115782694898420037507950092729877934309785142578634424409560416787900969278442481352665827663836866046496963281734345438124785282672622040049137978580602985588108758243065550685167681450965456278660391874567759574915773908926708279408928195018217042793698641861256633165643923252695945377434013059283666653937397681912457697537608479897125344313605007583629182612724451431978030126520499820773583364262785358953607200844037275188573347928328235527210985146596493872478757368883133049827492783721122634801064500069112197979904945486469307920925658026401302937409336523114593135796322951817614080863705674582371056444732766471013625563508992995163174626044003145286572739174492771376232741018531847404808104511883448336319427281048176341868199093528193670447629621120461975808515043737577191465506950333983360229402254277714051075654721328737222374034650690855315642904148737144234638190205377136245299762094596186089121462186949966668189811779555291278084199705217502386869525067865433279053909156574046529494674725447054628687840659316554841890899259286270675111002029034555245937929539911003759606737523026703384176306894827953982648247139360313907752451215167940118589510484362725133425922536707558095332489093990916708258938134510600190799884067944499478037288728809962936604551842840688439182126611524859769728005781387048149529180977809139015800964130311904319691608794088699817917496769144078494291144557649535215384579062219749701386558768632143320910453171168049481801232176674865632202576714296070399747305935601964666913138105176032207696649023769832984674582508287876854346389872374913362241145498952926325460174306196823025621771862745370061794943470713082732913070735665907602958883363484110599498551549153989871221877808416308489040200281371748419534974199318057124605698642289308055488372867898841918849876485546943295691642317339885707782157069791217319034007879326298392148908135611851833078545619130644372508221033612833560255009329871017585921203857797973158466822265842112445118693352854123682649062054713950402485095964440887027357259167734090822408428611355211732847456136170653185900085617188670094433948915645509149704016925871853178959931914735009783820254420919923300n);
    },
    get LOG2_E() {
        return new Fraction(3860650260200132240027884907570506098678208643319201140760852986318698944456024891801568453239521777899243437186560588177644418678516230666184037493578896824948891629768669556771618103245560459151592379641390604035655200310270574279624811437937442854848500894755808269269722922381020069987681491733294886517681390575448997121226490322970787890740648110782310087293675536624387366300980247879168910733082647008272427942666119407917776886090784693260436912018530466568990004899516157779355256507047682262356024063585438087718255541294413269930138916885249030447465376556388097464377702987738344221533558804370327316521049073741031214568411348873141517820394244958329798941812881286461303830002640862202318375912473201433176654550941868901908826982785042031872178795442624276965545432852394098222616316764366417280514140185638097730727064440831493372860602145953832489166293326107860573893652389571375749279825136003352342015152239379684311303085079297409431186410768563787582539783105830529829612442370932372084822942885319760916717240894285523979216925180535267700976393302547721856828728714126063835239701169128419977232667588321568322027268534902992423187626557162860524582154908035383160280767518556535494674074478171689512798564076243165464942624476732552246563219950103193629197334669402302907314314723953814302550263065980090900934486091487626064325931445201815861558032585765371848869110304369635100256629896466957002634733590598300352170837891561579188849004681208074547667356598386428600020822794409432271329486702684232421508959520180913443987037385894723874960998381959635280110367520300117980551104203650033584023396221216418637594101837779261098708239559258779019209235348842346235418130334190334360704946096594575870146769528700527210236134453049903666758764677948141504458128387018776679227807454545405485213143869350411280634624334796688011020844418093832559066425784885710691991494600417976386806240499457326180766204339893491887651318067946631711414795608953130312944048684007120222250502171182494505045624788149313511820160028346931021843238205050203683898412757657769918082799861035589011305834017472696060805590825287584500364446892427841846426182789517887472052324645250601606218336113073592546247734550239784720844265017258415355237628n, 2675998842985740902301892292301695682403204240653808280264898676580536804639408963659558876546806046446677676168273759016050031529153000978646263492395398440936161891468616422992584613460212817365427737070726264495041273162595823929481723520521216349367160494939390277237142212556439033229101981325929373984310546421593311342277881300596657418902579054440033111453351102857312621509771358516475808208557389704030559871755525638926690993419737015609893263430948681810928550214028357767175075368401117094670786691880920815069922118331793892525421220153783743504773818806419811517769430688163290812881448329142360925624913534606959161699712931570193296619513732088813040655871903901036457684186443298078951974984941813819798034146381379845743031075504364723566111012003889544911121058322556645063201226123146879854484004580598911856915541536916874876211491374599765072245570012427588325672468943301220879324976875403800615894082872486209757771199694344460544683905706513284963447046954425062295575155953335610963147869402313273928224830457306719777025264341458768614315192136571057494217183245717014638411592032369211530829660165825844018096454437820795253681849898783637275906443358633051294562239226716197929283665957932634062623426757208157959408207426451987055342920799033324560764878283257599161167243751824674935540807673510972800715890680546242081973432999314154563301812278676662427110582112182937681459311539361218015616066858419496411032590002764686058064968027404109324586402374772772846976783455531634611412052116956061644127646565122269209766989141685389679607031961122670468305060644200598392804256192109390364031997799730996487899670861325662007075056744458755048190913966060444135691928743025312802778698626952003573056272865821590805927902290899306398969672745747454479223342350906010931716579244057069065298991460343729695774900874402538492103943161920335193517196184372660460996820146885801213859983343046915458403010086359436623007524992567469265744454788750951054440114541399740994574808970321300958645095712136910009502793252260819204517917807132866393366007314724192551510112272179863227919165398391722401591280969326208018195407645659419467563622370501830909507807736978412631856741370490399008510984621997099421124104281483047197852279n);
    },
    get LN2() {
        return new Fraction(2744310713208860667570080370023524641956140509455202594237281865427753747522812156529741162417212596003004737652894823531512869959262584760848490951355018024419199730583155461364024060326317410586287846578683026165326856769274931021051124489410142191231352785555583732897592677351940479428669721039564670865351920369067289876023799458358760304567974263972233282044825197929272929877459174527085416082106503947003970899605143698325589904873052777250477223181976696137033409430260771391286563938017728642500608710438284521934016625454401030749262999011269573317564796543197153434949139422643834954799252952247355006745565782015568018129175440065451095511684477647452996911213314851741642465371120980818628424737046775115793175349546473384153726791945933586180073429908000443905464700140891202562463979261656280593415590750120283263541806569623232842219638380444543620459012318650111461243958917599569465096958296993145296049232347430750952738160474450169859768134596262352444479170336679697607899537220942049678705024265135774678487790472432776239093978261316559497751686918276770923118466215011882656824695235345466285658765561849421646426851370528345845618906732067605761955081126281488165215911758479347026945048180236607759962788148752208845078855811045760500997723936480876313294592924642210687447310332426983840386473221518472178245774897825985615832051286605313432354520553996843383453572253662329099450925369977169730792534784052362290082574086117139943672814538683386553800968250049178582062169049353450567266808693021006131111987785124526542694970575810749206789069139181081526021762712202706028814080845130454131832290066447059946160991159785845155457422770055386450012962222638375213969516343161587879912233045928364760855695232122817800227505759580510553417304972673891167798976597322191543852195211522496694293998154459702441639264162041194670576841355853730175849266588254200242019946645316315641204041142279680094199979322952099471238777665780524737858619953491090460507439145736263315472064629743521581023969184763555241644496541860703908136605454811215521337437679695753982576367109210477766752472235355428305831205313120559509161250025608675331742857378928122992267019884014823934247848173768715140936522178878753696779174331054662667331128677078277605n, 3959203456604877571622937641887471016427249105447168513956762779253540172657504779716913051740577528566545527388399731992026825180412288141910042519181633503366427287035185304196370524649445136850405500175619765450852754961823294176418250763072115399812142892838151230208051080427197237322845289065483988208278316663753343815788251644236701638391190195948154937613355236999659377730220271997569555502509398895893661104617790002414848953346064433273718618052997893406178489933884791242423310331350294856382277739059640306383395502681132840264398726348025622234931405567609329117011692323953973817286553775932102621172328221967483990196436751175145268559418858134842517423745281294794831597431231328729887842348143607908095082444853270604899566180849227696201966149290607089365786468879740548822325893404329726158775861919254077138132507515838826145315161141534474502349813323185597265203413066917438058848919725429002192179737437328097974928985756324610823151002360548113126371156964454645730656971066367611966401901343985280450395273927275644894297287032849374790703733825612685548480801371221691083271319334138537425123986846964997428197986630567278433755259027811858620239668366832915647401895098564623844501278136355144380804179419930726362305326391845212195503572372404203262904433488412795370589644115514874273966301595139175569194582045530191776322874643487379921716976836466670956532732907916075880390767623836106620619603323824712058378868115585780368387529287570460955965194785841722038126085132364702919612273531834257845530868925633031650507002692632311260717463616178720556043807904710520727762739333295984737045270417247440519065066911298039742839999346720540251229708653835858094199009951717753353231040491528320748941887763572767512711199919092503508912586386875023354630228068687205302642883505582349219916802048448910797738569460625811473361366372406470710951638649567789895984803027369178744457442781408025429880340252407425087142575794671129004204776362893416364813567302080821555596511377994463005722211296539157466963955919349998011498772378874227615543732241361576638963302149095719615849754951533141268761602728248217827376140533354587185065027458398778589336448285853085534660502134208269101451841316365085269421912947155436291762562454258509262n);
    }
});
