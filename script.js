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

  const updateView = () => {
	timers.forEach((timer) => {

		const timerData = data[timer] ?? [];

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
		span.textContent = convertSeconds(sum)
		if (running) {
			div.classList.add('running')
		}
		else {
			div.classList.remove('running')
		}
	})
}

const update = () => {
	updateView();
	updateTimeline();
}

const updateTimeline = () => {
	const timeline = document.querySelector('.timeline')
	if (!timeline.appendChild) {
		return;
	}

	timeline.innerHTML= '';

	timers.forEach((timer) => {
		const line = document.createElement('div')
		line.className = 'line'
		line.innerHTML = `
		<span class="label">${timer}</span>
		<div class="bars"></div>
		`;
		timeline.appendChild(line);

		(data[timer] ?? []).forEach((entry) => {
			const bar = document.createElement('div')
			bar.className = 'bar';
			bar.style.width = '100px';
			bar.textContent = `${entry.type}`

			line.querySelector('.bars').appendChild(bar)
		})
	})
}


const timers = ['day', 'core', 'issues', 'invest', 'support external/saas', 'help internal', 'syncs']
const div = document.querySelector('.timers')
let data = loadData()

timers.forEach((timer) => {
	const container = document.createElement('div')
	container.setAttribute('data-timer', timer)
	container.className = 'timer'
	container.innerHTML = `
	<span class="label">${timer}</span>
	<div class="controls">
		<button data-action="start">start</button>
		<button data-action="stop">stop</button>
	</div>
	<span class="duration">--</span>
	`;

	div.appendChild(container);

	const start = container.querySelector('[data-action="start"]')
	start.onclick = () => {
		const timerData = data[timer] || []
		timerData.push({
			type: 'start',
			time: Date.now() / 1000,
		})
		data[timer] = timerData;

		writeData(data)
		update()
	}

	const stop = container.querySelector('[data-action="stop"')
	stop.onclick = () => {
		const timerData = data[timer] || []
		timerData.push({
			type: 'stop',
			time: Date.now() / 1000,
		})
		data[timer] = timerData;

		writeData(data)
		update()
	}
})

const reset = document.querySelector('[data-action="reset"]')
reset.onclick = () => {
	data = {}
	writeData(data);
}


update()

setInterval(() => {
	update();
}, 1000);