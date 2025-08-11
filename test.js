import repl from "node:repl"
const sesh = repl.start()
const {resolve, promise} = Promise.withResolvers()
sesh.on("exit", resolve)
await promise
console.log("hello world")
