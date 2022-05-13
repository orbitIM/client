"use strict"

import WebSocket from "ws"

const removeArrayItem = (array, item) => {
	const index = array.indexOf(item)
	if (index > -1) { array.splice(index, 1) }
	return array
}

const randInt = (min, max) => {
	return Math.floor(Math.random() * ((max + 1) - min)) + min
}

const randString = (length) => {
	let str = ""
	for (let x = 0; x < length; x++) {
		const num = randInt(0, 61)
		if (num <= 9) {
			str = `${str}${num}`
		} else if (num <= 35) {
			str = `${str}${String.fromCharCode(87 + num)}`
		} else {
			str = `${str}${String.fromCharCode(29 + num)}`
		}
	}
	return str
}

export class OrbitClient {
	constructor(url, timeout) {
		this.ws = new WebSocket(url)
		this.timeout = timeout || 5000
		this.onevent = null
		this.waiting = []
		this.handlers = {}

		this.ws.onmessage = (message) => {
			let msg = message.data
			if (msg instanceof ArrayBuffer) { msg = Buffer.from(msg).toString("utf-8") }
			const data = JSON.parse(msg)
			if (data.origin !== undefined && this.waiting.includes(data.origin)) {
				const origin = data.origin
				delete data.origin
				this.waiting = removeArrayItem(this.waiting, origin)
				this.handlers[origin](data)
				delete this.handlers[origin]
			} else if (data.event !== undefined) {
				if (this.oneventHandler) {
					this.oneventHandler(data)
				} else {
					throw "`onevent` is not defined"
				}
			}
		}
	}
	requestSync(req, data, handler) {
		const origin = randString(64)
		this.waiting.push(origin)
		this.handlers[origin] = handler
		this.ws.send(JSON.stringify({
			request: req,
			data,
			origin,
		}))
		const end = Date.now() + this.timeout
		while (origin in this.waiting && Date.now() < end) continue
		if (origin in this.waiting) throw "request timed out"
	}
	close() {
		this.ws.close()
	}
	set onopen(func) {
		this.ws.onopen = func
	}
	set onevent(func) {
		this.oneventHandler = func
	}
	set onclose(func) {
		this.ws.onclose = func
	}
}
