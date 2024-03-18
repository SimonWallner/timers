const timers = ['total', 'core']

const div = document.querySelector('.timers')

timers.forEach((timer) => {
	const container = document.createElement('div')
	container.setAttribute('data-timer', timer)
	container.textContent = timer
	div.appendChild(container);

	const start = document.createElement('button')
	start.textContent = 'start'
	start.onclick = () => {
		const data = {
			start: Date.now()
		}
		writeData(timer, data)
	}
	container.appendChild(start)

	const stop = document.createElement('button')
	stop.textContent = 'stop'
	container.appendChild(stop)
})

const loadData = () => {
	const blob = window.localStorage.getItem('timers')
	const data = JSON.parse(blob ?? '')
}

const writeData = (name, data) => {
	window.localStorage.setItem('timers-' + name, JSON.stringify(data))
}

const updateView = () => {

}