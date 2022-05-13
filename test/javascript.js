import { OrbitClient } from "../index.js"
import "dotenv/config"

const password = process.env.PASSWORD
const uuid = process.env.UUID
const url = process.env.URL
const key = process.env.KEY

const client = new OrbitClient(url, 5000)

client.onopen = () => {
	client.requestSync("auth", { uuid, password, key }, (data) => {
		if (data.status === "OK") {
			console.log("success")
		} else {
			console.log("failure")
		}
		client.close()
	})
}
