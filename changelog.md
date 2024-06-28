## 1.0.0
### Additions
* `Fraction.prototype.asDecimal(places: number = 15) => string`
	* Returns the decimal representation of the fraction to `places` decimal places (does not round)
* `Fraction.IntegerExpectedError`
	* An extension of `Error` that might be thrown when the input of a method must be an integer (or integer-like)
* `get remainder() => bigint`
	* Returns `numerator % denominator` (not true modulo)
* `Fraction.ONE`
	* Getter that will always return `new Fraction(1n, 1n)`
* `Fraction.parseFraction` can now parse LaTeX fractions (strings that match `/^\s*\\frac\s*\{(.+)\}\s*\{(.+)\}\s*$/m`)
	* If $1 or $2 are not parsable numbers, a corresponding error will be thrown
* `Fraction.parseFraction` can now parse ratios (strings that contain `:` instead of `/`)

#### .d.ts
* Created "index.d.ts"
* `type AnyNumber = Fraction | bigint | number | string`
* `type AnyInteger = bigint | number | string`
	* Methods that accept `AnyInteger` will throw an error if an inputted `string` is not integer-like

### Fixes
* No longer possible to modify `Fraction.NaN`
* `Fraction.prototype.lt()`, `.lteq()`, and `divide()` now properly check if input is a fraction that is equal to 0
* `Fraction.prototype.plus()` no longer redundantly calculates `(n1 * n2) / (n1 * n2)`
* Better number parsing for most strings
* `set denominator()` and `set numerator()` now only accept `AnyInteger`
* `set denominator()` may now throw `Fraction.ZeroDivisionError`
* `get reciprocal()` may now throw `Fraction.ZeroDivisionError`
* `Fraction.prototype.scaleTo()` now accepts `AnyInteger`

### Changes
* `Fraction.prototype.fixNegative()` will now change the numerator and denominator to be positive if both of them are negative
* `Fraction.prototype.valueOf()` uses a new method of calculating the number, utilizing `.asDecimal()`
* Substantially sped up the `Fraction` constructor
* `Fraction.prototype.seq()` now only checks once of input is of type `Fraction`
	* ".d.ts" Says that this method can only accept `Fraction`s as input; any other input will always return false
* Switched from `==` to `===` in several areas to make operations marginally faster

### Removals
* `Fraction.RationalExponentError` no longer exists
	* `Fraction.pow()` now throws `Fraction.IntegerExpectedError` if exponent parameter is not an integer
* `Fraction.random()` was removed as it was not mathematically sound