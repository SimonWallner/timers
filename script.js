const loadData = () => {
	const blob = window.localStorage.getItem('timers')
	const data = JSON.parse(blob ?? '{}')
	return data;
}

const writeData = (data) => {
	window.localStorage.setItem('timers', JSON.stringify(data))
}
function convertSeconds(seconds) {
	let hours = Math.floor(seconds / 3600);
	seconds %= 3600; // remaining seconds after calculating hours
	let minutes = Math.floor(seconds / 60);
	seconds %= 60; // remaining seconds after calculating minutes

	// Pad with zeros for consistent formatting
	hours = hours.toFixed(0).padStart(2, '0');
	minutes = minutes.toFixed(0).padStart(2, '0');
	seconds = seconds.toFixed(0).padStart(2, '0');

	return `${hours}:${minutes}:${seconds}`;
  }


const timers = ['total', 'core']
const div = document.querySelector('.timers')
let data = loadData()

timers.forEach((timer) => {
	const container = document.createElement('div')
	container.setAttribute('data-timer', timer)
	container.className = 'timer'
	container.textContent = timer
	div.appendChild(container);

	const start = document.createElement('button')
	start.textContent = 'start'
	start.onclick = () => {

		const timerData = data[timer] || []
		timerData.push({
			type: 'start',
			time: Date.now() / 1000,
		})
		data[timer] = timerData;

		writeData(data)
	}
	container.appendChild(start)

	const stop = document.createElement('button')
	stop.textContent = 'stop'
	stop.onclick = () => {
		const timerData = data[timer] || []
		timerData.push({
			type: 'stop',
			time: Date.now() / 1000,
		})
		data[timer] = timerData;

		writeData(data)
	}
	container.appendChild(stop)

	const duration = document.createElement('span')
	duration.classList.add('duration')
	duration.textContent= '--'
	container.appendChild(duration)
})

const reset = document.querySelector('[data-action="reset"]')
reset.onclick = () => {
	data = {}
	writeData(data);
}


const updateView = () => {
	timers.forEach((timer) => {

		const timerData = data[timer];
		if (!timerData) {
			const div = document.querySelector(`[data-timer="${timer}"]`)
			const span = div.querySelector('.duration')
			span.textContent = '--'
			return;
		}

		let lastStart = undefined;
		let sum = 0
		let running = false;
		timerData.forEach((t) => {
			if (t.type === 'start') {
				lastStart = t.time
			}

			if (t.type === 'stop' && lastStart !== undefined) {
				const duration = t.time - lastStart;
				sum += duration
				lastStart = undefined;
			}
		})

		if (lastStart !== undefined) {
			const duration = (Date.now() / 1000) - lastStart;
			sum += duration
			lastStart = undefined;
			running = true
		}

		const div = document.querySelector(`[data-timer="${timer}"]`)
		const span = div.querySelector('.duration')
		span.textContent = convertSeconds(sum) + (running ? ' running' : '');
	})
}

setInterval(() => {
	updateView()
}, 1000);