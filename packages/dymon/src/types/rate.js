const DefaultDebounceTime = 0;
const DefaultRateSize = -1;

const coerceNumberWithMin = (inputNumber, min) => {
  let number = Number(inputNumber);
  if (!number || number < min) number = min;
  return number;
};

/**
 * @memberOf module:Dymon
 */
class Rate {
  constructor(props = {}) {
    this.debounceTime = props.debounceTime;
    this.size = props.size;

    this.timer = 0;
    this.calls = 0;
  }

  set debounceTime(time) {
    this._debounceTime = coerceNumberWithMin(time, DefaultDebounceTime);
    return this._debounceTime;
  }

  set size(size) {
    this._size = coerceNumberWithMin(size, DefaultRateSize);
    return this._size;
  }

  get hasDebounceTime() {
    return this._debounceTime !== DefaultDebounceTime;
  }

  get hasRateSize() {
    return this._size !== DefaultRateSize;
  }

  reset() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = 0;
    }
    if (this.calls > 0) this.calls = 0;
  }
}

module.exports = Rate;
