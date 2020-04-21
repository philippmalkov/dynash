const DefaultDebounceTime = 0;
const DefaultRateSize = -1;

const NumberWithMin = (inputNumber, min) => {
  let number = Number(inputNumber);
  if (!number || number < min) number = min;
  return number;
};

class Rate {
  constructor(props = {}) {
    this._debounceTime = DefaultDebounceTime;
    this._size = DefaultRateSize;

    this.debounceTime = props.debounceTime;
    this.size = props.size;

    this.timer = 0;
    this.calls = 0;
  }

  set debounceTime(time) {
    this._debounceTime = NumberWithMin(time, DefaultDebounceTime);
    return this._debounceTime;
  }

  set size(size) {
    this._size = NumberWithMin(size, DefaultRateSize);
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
