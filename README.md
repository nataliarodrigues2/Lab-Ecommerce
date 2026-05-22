# E-Commerce — Padrões Criacionais

## Alunos
> Diego Silveira | Natalia S. Rodrigues
## Sobre o projeto

Implementação dos três padrões criacionais (Singleton, Factory Method e Builder) aplicados ao backend de um e-commerce, usando **JavaScript (Node.js)** com banco de dados **MySQL** via Docker.

---

## Estrutura

```
lab e-commerce/
├── compose.yml
├── database/
│   └── init.sql           # Cria tabelas e insere dados de exemplo
├── index.js               # Demonstração dos três padrões
├── package.json
└── src/
    ├── conexao.js         # Tarefa 01 — Singleton
    ├── pagamento.js       # Tarefa 02 — Factory Method
    └── pedido.js          # Tarefa 03 — Builder
```

---

## Como rodar

**1. Subir o banco:**
```bash
docker compose up -d
```

**2. Instalar dependências:**
```bash
npm install
```

**3. Aguardar o banco inicializar e rodar:**
```bash
node index.js
```

---