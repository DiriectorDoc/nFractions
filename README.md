# nFractions
Creates fractions using BigInts.



## Syntax

```javascript
new Fraction(  numerator,  denominator  )
```

* `numerator`: string, number, bigint, Fraction (default: 0)
* `denominator`: string, number, bigint, Fraction (default: 1)

```javascript
new Fraction(1, 2)     //  = 1/2
new Fraction(2n, 4n)   //  = 2/4
new Fraction("1", "2") //  = 1/2
new Fraction("1", -2n) //  = 1/-2
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
    * `.seq( value )` (mimics `===`)
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