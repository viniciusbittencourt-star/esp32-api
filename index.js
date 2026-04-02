const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get("/log", async (req, res) => {
  const { device_id, status } = req.query;

  if (!device_id || !status) {
    return res.send("Dados inválidos");
  }

  try {
    await pool.query(
      "INSERT INTO logs (device_id, status) VALUES ($1, $2)",
      [device_id, status]
    );

    res.send("OK");
  } catch (err) {
    console.error(err);
    res.send("Erro");
  }
});

app.get("/", (req, res) => {
  res.send("API ESP32 funcionando");
});

app.listen(port, () => {
  console.log("Rodando na porta " + port);
});
