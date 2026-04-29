import { env } from "./env/index.js"
import { app } from "./app.js"



app.listen({
    port: env.PORT,
}).then(() => {
    console.log("Server Running on http://localhost:3333")
})