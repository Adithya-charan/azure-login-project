const path = require("node:path");
const express = require("express");
const authRoutes = require("./routes/auth");

const app = express();
const frontendPath = path.resolve(__dirname, "../frontend");

app.use(express.json());
app.use(express.static(frontendPath));
app.use("/api/auth", authRoutes);

const port = Number(process.env.PORT) || 3000;

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Login project available at http://localhost:${port}`);
    });
}

module.exports = app;
