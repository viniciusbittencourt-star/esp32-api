const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 🔥 CRIA TABELA AUTOMATICAMENTE
async function criarTabela() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        device_id TEXT,
        status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabela pronta!");
  } catch (err) {
    console.error("Erro ao criar tabela:", err);
  }
}

// rota principal
app.get("/", (req, res) => {
  res.send("API ESP32 funcionando 🚀");
});

// rota de log
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

// inicia servidor + cria tabela
app.listen(port, async () => {
  console.log("Rodando na porta " + port);
  await criarTabela(); // 👈 AQUI resolve tudo
});
