# nFractions
Creates fractions using BigInts. These fraction have arbitrary precision and can be as precise as needed.

## Syntax

```javascript
new Fraction( numerator,  denominator )
```

* `numerator`: string, number, bigint, Fraction (default: 0)
* `denominator`: string, number, bigint, Fraction (default: 1)

```javascript
new Fraction(1, 2)     //  = 1/2
new Fraction(2n, 4n)   //  = 2/4
new Fraction([1, 2])   //  = 1/2
new Fraction([2n, 4n]) //  = 2/4
new Fraction([1, 2], [1, 2]) //  = 2/2
new Fraction("1", "2") //  = 1/2
new Fraction("1", -2n) //  = 1/-2
new Fraction("1.5", 2) //  = 3/4
new Fraction(new Fraction(1, 2)) //  = 1/2
new Fraction(new Fraction(1, 2), 2) //  = 1/4
new Fraction(.5, .5)   //  = 5/5
new Fraction(1)        //  = 1/1
new Fraction()         //  = 0/1
new Fraction(1, 0)     //  err: ZeroDivisionError

new Fraction(.11111111111111111111111111111)   //  = 1111111111111111/10000000000000000
new Fraction(".11111111111111111111111111111") //  = 11111111111111111111111111111/1000000000000000000000000000000000
```

## Properties
* `.numerator`: BigInt
* `.denominator`: BigInt
* `.isNaN`: Boolean
* `.isNegative`: Boolean
* `.negative`: Fraction
    * Returns the faction with a negated numerator. <u>Does not change the value of the variable.</u>
* `.reciprocal`: Fraction
    * Returns the reciprical. <u>Does not change the value of the variable.</u>
* `.whole`: BigInt
* `.remainder`: BigInt

## Inequality/inequality
* Equals
    * `.eq( value )` (mimics `==`)
* Strictly Equals
    * `.seq( value )` (mimics `===`) (will always be false when comparing a Fraction to a non-Fraction)
* Less Than
    * `.lt( value )` (mimics `<`)
* Less Than or Equals
    * `.lteq( value )` (mimics `<=`)
* Greater Than
    * `.gt( value )` (mimics `>`)
* Greater Than or Equals
    * `.gteq( value )` (mimics `>=`)

### Examples

```Javascript
new Fraction(1, 2).lt(1n)      // => true
new Fraction(1, 2).gt(.5)      // => false
new Fraction(1, 2).lteq("foo") // => false
new Fraction(1, 2).eq(1/2)   // => true
new Fraction(1, 2).seq(1/2)  // => false
new Fraction(1, 2).seq(new Fraction(1/2)) // => true
```

## Arithmatic
* Addition
    * `.plus( addend )` (mimics `+`)
* Subtraction
    * `.minus( subtrahend )` (mimics `-`)
* Multiplication
    * `.times( multiplicidad )` (mimics `*`)
* Division
    * `.divide( dividend )` (mimics `/`)

> Parameters can only be of type number, Fraction, bigint, or number-like string.

* Exponentiation
    * `Fraction.pow( fraction ,  exponent )` (mimics `Math.pow()`)
    * Only accepts Fractions as first input and integers (including BigInts) as second
* Absolution
    * `Fraction.abs( fraction )` (mimics `Math.abs()`)
    * Only accepts Fractions as input

* Reciprocation
    * `.reciprocate()`
    * <u>This will change the value of the variable.</u>
* Simplification
    * `.reduce()`
    * <u>This will change the value of the variable.</u>

## `.clone()`
Returns a copy of the variable. Eliminates the risk of call-by-sharing logic errors.

## Statics
### `Fraction.NaN`
Acts as `NaN` as a fraction. Math and comparisons cannot be done with it.

Will not throw an error if the input is not a string. May throw a ZeroDivisionError.

### `Fraction.parseFraction()`
Accepts only strings. Will always return a Fraction or Fraction.NaN. Will return whatever fraction is within the string.

```javascript
Fraction.parseFraction("1/2")     // =>  1/2
Fraction.parseFraction(" 1 / 2 ") // =>  1/2
Fraction.parseFraction("0b1/0x2") // =>  1/2
Fraction.parseFraction("-1 / +2") // => -1/2
Fraction.parseFraction("1/0")     // err: ZeroDivisionError
Fraction.parseFraction(6)         // => NaN
Fraction.parseFraction("foo")     // => NaN
```

## FracMath Methods
The `FracMath` object provides various mathematical operations for working with fractions.

- `toInt(num: AnyNumber)`: Converts a number to a `bigint`.
- `pow(frac: AnyNumber, exponent: AnyNumber)`: Raises a fraction to a given exponent.
- `abs(frac: AnyNumber)`: Returns the absolute value of a number.
- `qlog(int: bigint)`: Computes the quick logarithm of a `bigint`.
- `factorial(n: AnyInteger)`: Computes the factorial of an integer.
- `sin(x: AnyNumber)`, `cos(x: AnyNumber)`, `tan(x: AnyNumber)`: Compute trigonometric functions for fractions.
- `sqrt(x: AnyNumber, guess: AnyNumber)`: Computes the square root of a fraction using an initial guess.
- `round(frac: FractionLike)`, `floor(frac: FractionLike)`, `ceil(frac: FractionLike)`: Round a fraction to the nearest integer, floor it, or ceil it.
- `exp(x: AnyNumber)`: Computes the exponential function of a fraction.
- `ln(x: AnyNumber)`, `log(x: AnyNumber)`: Compute the natural and base-10 logarithms of a fraction.
- `random()`: Generates a random fraction.
- `max(first: AnyNumber, ...args: AnyNumber[])`, `min(first: AnyNumber, ...args: AnyNumber[])`: Find the maximum or minimum of a set of numbers.
- `trunc(frac: FractionLike)`: Truncates a fraction to its integer part.

All of these use the property `FracMath.accuracy`, a number that determines how accurate each function will be. By default, the accuracy is 200. This will give 

### Mathematical Constants
`FracMath` also defines common mathematical constants as `Fraction` values:
- `PI`: The mathematical constant π.
- `E`: Euler's number.
- `SQRT2`: The square root of 2.
- `SQRT1_2`: The square root of 1/2.
- `PHI`: The golden ratio.
- `LN10`: The natural logarithm of 10.
- `LOG10_E`: The base-10 logarithm of Euler’s number.
- `LOG2_E`: The base-2 logarithm of Euler’s number.
- `LN2`: The natural logarithm of 2.

Each property will create a new Fraction. These values cannot be changed. Each constant is accurate to at least 4500 decimal places.