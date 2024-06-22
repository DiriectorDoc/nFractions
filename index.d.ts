type AnyNumber = Fraction | bigint | number | string;
type AnyInteger = bigint | number | string;
export default class Fraction {
    #private;
    static get NaN(): Fraction;
    static get ONE(): Fraction;
    get [Symbol.toStringTag](): string;
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
    seq(frac: AnyNumber): boolean;
    lt(frac: AnyNumber): boolean;
    lteq(frac: AnyNumber): boolean;
    gt(frac: AnyNumber): boolean;
    gteq(frac: AnyNumber): boolean;
    reduce(): this;
    fixNegative(): this;
    get reciprocal(): Fraction;
    reciprocate(): this;
    clone(): Fraction;
    scaleTo(factor: bigint | number): this;
    plus(addend: AnyNumber): Fraction;
    minus(subtrahend: AnyNumber): Fraction;
    times(multiplicand: AnyNumber): Fraction;
    divide(divisor: AnyNumber): Fraction;
    toString(type?: string): string;
    valueOf(): number;
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
    static abs(frac: Fraction): Fraction;
    static pow(frac: Fraction, exponent: AnyInteger): Fraction;
    static parseFraction(str: string): Fraction;
}
export {};
