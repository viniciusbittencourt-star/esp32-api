const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// 🔥 libera acesso do GitHub Pages
app.use(cors());

// conexão com banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 🔥 cria tabela automaticamente
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

// rota teste
app.get("/", (req, res) => {
  res.send("API ESP32 funcionando 🚀");
});

// 🔥 salvar dados
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

// 🔥 listar dados (dashboard usa isso)
app.get("/logs", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM logs ORDER BY created_at DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.send("Erro");
  }
});

// inicia servidor
app.listen(port, async () => {
  console.log("Rodando na porta " + port);
  await criarTabela();
});
