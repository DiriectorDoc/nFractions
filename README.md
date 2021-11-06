# nFractions
Creates fractions using BigInts

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
new Fraction("1/2")    //  = 1/2
new Fraction(new Fraction("1/2")) //  = 1/2
new Fraction("1/2", 2) //  = 1/4
new Fraction(.5, .5)   //  = 5/5
new Fraction()         //  = 0/1
new Fraction(1, 0)     //  err: ZeroDivisionError

new Fraction(.111111111111111111111111111111111)   //  = 1111111111111111/10000000000000000
new Fraction(".111111111111111111111111111111111") //  = 111111111111111111111111111111111/1000000000000000000000000000000000
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

## Inequality/inequality
* Equals
    * `.eq()` (mimics `==`)
* Strictly Equals
    * `.seq()` (mimics `===`)
* Less Than
    * `.lt()` (mimics `<`)
* Less Than or Equals
    * `.lteq()` (mimics `<=`)
* Greater Than
    * `.gt()` (mimics `>`)
* Greater Than or Equals
    * `.gteq()` (mimics `>=`)

### Examples

```Javascript
new Fraction(1, 2).lt(1n)      // => true
new Fraction(1, 2).gt(.5)      // => false
new Fraction(1, 2).lteq("foo") // => false
new Fraction(1, 2).eq("1/2")   // => true
new Fraction(1, 2).seq("1/2")  // => false
new Fraction(1, 2).seq(new Fraction("1/2")) // => true
```

## Arithmatic
* Addition
    * `.plus()` (mimics `+`)
* Subtraction
    * `.minus()` (mimics `-`)
* Multiplication
    * `.times()` (mimics `*`)
* Division
    * `.divide()` (mimics `/`)

* Exponentiation
    * `Fraction.pow()` (mimics `Math.pow()`)
    * Only accepts Fractions as first input and integers as second
* Absolution
    * `Fraction.abs()` (mimics `Math.abs()`)
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

### `Fraction.random()`
Returns a random fraction from [0, 1). Each fraction will have a random numerator and denominator.

```Javascript
Fraction.random()
```

* Theoretical max: (2^13 - 1)/2^31
* Theoretical non-zero min: 1/2^31

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

----
## Extra functionality
A third parameter may be entered into the constructor. If the third parameter is exactly `Symbol("#Quick")`, then the constructor will create the object much quicker. If any other value is inputed, it will be ignored. This input will make the constructer bypass all checks, and immediately set the numerator and denominator to the first and second parameter respectively.

> **Warning:** Do not use this technique in production as it allows the values of the numerator and the denominator to be set to anything, not just BigInts.