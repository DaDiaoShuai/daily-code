const mySetInterval = (fn, a, b) => {
	let _interval = [a, a + b, a + 2 * b]
	let _currentInterval = null
	let _idx = 0

	let _mySetInterval = _t => {
		if(_idx < _interval.length) {
			clearInterval(_currentInterval)
			_currentInterval =  setInterval(() => {
				_idx++
				fn()
				_mySetInterval(_interval[_idx])
			}, _t)
			return _currentInterval
		} else {
			_idx = -1
		}
	}
	_mySetInterval(_interval[_idx])
	return _currentInterval
}

const myClear = (_interval) => {
	clearInterval(_interval)
}

// let interval = mySetInterval(() => {
// 	console.log('太难了')
// }, 1000, 2000)

