// --- Library
const express = require('express')


// --- Const
const PORT = process.env.PORT || 8080

// --- int express
const app = express()

app.use('/', express.static('public'))

app.listen(PORT, () => { console.log(`=== LISTENING ON ${PORT} ===`) })

require('./app/backend/ws-backend-dispatcher')