-- database/init.sql
-- Executado automaticamente pelo container na primeira inicialização

CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  estoque INT DEFAULT 0,
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedidos (
  id VARCHAR(50) PRIMARY KEY,
  total DECIMAL(10,2) NOT NULL,
  forma_pagamento VARCHAR(20) NOT NULL,
  rua VARCHAR(100),
  numero VARCHAR(10),
  cidade VARCHAR(50),
  cep VARCHAR(10),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itens_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id VARCHAR(50) NOT NULL,
  produto VARCHAR(100) NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

-- Dados de exemplo
INSERT INTO produtos (nome, preco, estoque) VALUES
  ('Camiseta', 59.90, 100),
  ('Tênis', 249.90, 30),
  ('Mochila', 149.90, 50);
