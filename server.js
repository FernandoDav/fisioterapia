const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const root = __dirname;

app.use(express.static(root));
app.get("/", (request, response) => response.sendFile(path.join(root, "vistas", "login.html")));
app.get("/login", (request, response) => response.sendFile(path.join(root, "vistas", "login.html")));
app.listen(port, () => console.log(`Fisio Clinica disponible en http://localhost:${port}`));
