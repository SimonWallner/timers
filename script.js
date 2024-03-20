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

function convertTimestampToTime(timestamp) {
	const date = new Date(timestamp * 1000);

	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');

	return `${hours}:${minutes}`;
  }


const map = (value, a, b,  r, s) => {
    const normalized = (value - a) / (b - a);
    return r + normalized * (s - r);
}

const now = () => Date.now() / 1000;

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
			const duration = now() - lastStart;
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

const updateTimeline = () => {
	const timeline = document.querySelector('.timeline')
	if (!timeline.appendChild) {
		return;
	}

	timeline.innerHTML= '';

	let min = Number.MAX_VALUE;
	let max = now();
	timers.forEach((timer) => {
		(data[timer] ?? []).forEach((entry) => {
			min = Math.min(min, entry.time);
			max = Math.max(max, entry.time);
		})
	})

	timers.forEach((timer) => {
		const line = document.createElement('div')
		line.className = 'line'
		line.innerHTML = `
		<span class="label">${timer}</span>
		<div class="bars"></div>
		`;
		timeline.appendChild(line);

		let start = undefined;

		dataCopy = JSON.parse(JSON.stringify(data[timer] ?? []))
		if (dataCopy.length > 0 && dataCopy[dataCopy.length - 1].type === 'start') {
			dataCopy.push({ type: 'stop', time: now(), running: true})
		}

		dataCopy.forEach((entry) => {
			if (entry.type === 'start') {
				start = entry.time;
			}

			if (entry.type === 'stop') {

				const bar = document.createElement('div')
				bar.className = 'bar';

				const duration = entry.time - start;
				bar.style.left = `${map(start, min, max, 0, 100)}%`
				bar.style.width = `${map(duration, 0, max - min, 0, 100)}%`;

				bar.textContent = `${convertTimestampToTime(start)} - ${entry.running ? '' : convertTimestampToTime(entry.time)}`

				if (entry.running) {
					bar.classList.add('running')
				}

				line.querySelector('.bars').appendChild(bar)
				start = undefined;
			}
		})
	})
}

const update = () => {
	updateView();
	updateTimeline();
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
			time: now(),
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
			time: now(),
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
	// update();
}, 1000);