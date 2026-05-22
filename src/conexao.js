/**
 * TAREFA 01 — SINGLETON
 * Conexão real com MySQL usando mysql2.
 * Uma única instância de pool durante toda a execução.
 */


const mysql = require("mysql2/promise");

class Conexao {
  constructor() {
    if (Conexao._instancia) {
      throw new Error("Use Conexao.getInstance()");
    }

    // Pool gerencia múltiplas queries sem abrir nova conexão a cada vez
    this._pool = mysql.createPool({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "123456",
      database: "ecommerce",
      waitForConnections: true,
      connectionLimit: 10,
    });

    console.log("🔌 Pool de conexão criado com o MySQL.");
  }

  static getInstance() {
    if (!Conexao._instancia) {
      Conexao._instancia = new Conexao();
    } else {
      console.log("♻️  Reutilizando pool existente.");
    }
    return Conexao._instancia;
  }

  // Executa uma query e retorna as linhas
  async query(sql, params = []) {
    const [rows] = await this._pool.execute(sql, params);
    return rows;
  }

  async fechar() {
    await this._pool.end();
    Conexao._instancia = null;
    console.log("🔒 Pool encerrado.");
  }
}

Conexao._instancia = null;

module.exports = { Conexao };
