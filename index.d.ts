type AnyNumber = AnyInteger | FractionLike;
type AnyInteger = bigint | number | string;
type FractionLike = [AnyNumber, AnyNumber] | Fraction;
export declare class Fraction {
    #private;
    static get NaN(): Fraction;
    static isNaN(inp: Fraction): boolean;
    static get ONE(): Fraction;
    get [Symbol.toStringTag](): string;
    get accuracy(): number;
    set accuracy(int: number);
    constructor(numerator?: AnyNumber, denominator?: AnyNumber);
    get numerator(): bigint;
    get denominator(): bigint;
    set numerator(num: AnyInteger);
    set denominator(num: AnyInteger);
    get isNaN(): boolean;
    get isNegative(): boolean;
    get negative(): Fraction;
    get whole(): bigint;
    eq(frac: AnyNumber): boolean;
    seq(frac: Fraction): boolean;
    lt(frac: AnyNumber): boolean;
    lteq(frac: AnyNumber): boolean;
    gt(frac: AnyNumber): boolean;
    gteq(frac: AnyNumber): boolean;
    reduce(): this;
    fixNegative(): this;
    get reciprocal(): Fraction;
    reciprocate(): this;
    get remainder(): bigint;
    clone(): Fraction;
    scaleTo(factor: AnyInteger): this;
    plus(addend: AnyNumber): Fraction;
    minus(subtrahend: AnyNumber): Fraction;
    times(multiplicand: AnyNumber): Fraction;
    divide(divisor: AnyNumber): Fraction;
    toString(type?: string): string;
    valueOf(): number;
    [Symbol.toPrimitive](hint: "string" | "number" | "default"): string | number;
    asDecimal(decimals?: number): string;
    static ZeroDivisionError: {
        new (): {
            name: string;
            message: string;
            stack?: string;
            cause?: unknown;
        };
    };
    static IntegerExpectedError: {
        new (value: any): {
            name: string;
            message: string;
            stack?: string;
            cause?: unknown;
        };
    };
    static parseFraction(str: string): Fraction;
}
export declare const FracMath: {
    readonly toInt: (num: AnyNumber) => bigint;
    readonly pow: (frac: AnyNumber, exponent: AnyNumber) => Fraction;
    readonly abs: {
        (frac: number): number;
        (frac: bigint): bigint;
        (frac: Fraction): Fraction;
    };
    readonly qlog: (int: bigint) => number;
    readonly factorial: (n: AnyInteger) => bigint;
    readonly sin: (x: AnyNumber) => Fraction;
    readonly cos: (x: AnyNumber) => Fraction;
    readonly tan: (x: AnyNumber) => Fraction;
    readonly sqrt: (x: AnyNumber, guess: AnyNumber) => Fraction;
    readonly round: (frac: FractionLike) => bigint;
    readonly floor: (frac: FractionLike) => bigint;
    readonly ceil: (frac: FractionLike) => bigint;
    readonly exp: (x: AnyNumber) => Fraction;
    readonly ln: (x: AnyNumber) => Fraction;
    readonly log: (x: AnyNumber) => Fraction;
    readonly random: () => Fraction;
    readonly max: (first: AnyNumber, ...args: AnyNumber[]) => AnyNumber;
    readonly min: (first: AnyNumber, ...args: AnyNumber[]) => AnyNumber;
    readonly trunc: (frac: FractionLike) => bigint;

    accuracy: number;
    readonly PI: Fraction;
    readonly E: Fraction;
    readonly SQRT2: Fraction;
    readonly SQRT1_2: Fraction;
    readonly PHI: Fraction;
    readonly LN10: Fraction;
    readonly LOG10_E: Fraction;
    readonly LOG2_E: Fraction;
    readonly LN2: Fraction;
};
export {};
