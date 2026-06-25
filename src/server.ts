import { env } from "./env/index.js"
import { app } from "./app.js"

app.listen({
  port: env.PORT,
  host: "0.0.0.0",
}).then(() => {
  console.log("HTTP Server Running")
})