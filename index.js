const { Conexao } = require("./src/conexao");
const { PagamentoFactory } = require("./src/pagamento");
const { PedidoBuilder } = require("./src/pedido");
const { GatewayAdapter } = require("./src/gatewayAdapter");
const { LogDecorator, DescontoDecorator } = require("./src/decoratorPagamento");
const { CheckoutFacade } = require("./src/checkoutFacade");

async function main() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║   E-COMMERCE — PADRÕES CRIACIONAIS   ║");
  console.log("╚══════════════════════════════════════╝\n");

  // ── SINGLETON ────────────────────────────────────────────────────────────
  console.log("━━━ TAREFA 01: SINGLETON ━━━");

  const db1 = Conexao.getInstance();
  const db2 = Conexao.getInstance(); // reutiliza — mesmo objeto
  console.log("db1 === db2?", db1 === db2);

  const produtos = await db1.query("SELECT * FROM produtos WHERE ativo = 1");
  console.log("Produtos no banco:", produtos);

  // ── FACTORY METHOD ────────────────────────────────────────────────────────
  console.log("\n━━━ TAREFA 02: FACTORY METHOD ━━━");

  const pagPix    = PagamentoFactory.criar("pix");
  const pagCartao = PagamentoFactory.criar("cartao", { parcelas: 3 });
  const pagBoleto = PagamentoFactory.criar("boleto");

  [pagPix, pagCartao, pagBoleto].forEach(p => console.log(p.processar(299.90)));

  // ── BUILDER ───────────────────────────────────────────────────────────────
  console.log("\n━━━ TAREFA 03: BUILDER ━━━");

  const pedido = new PedidoBuilder()
    .adicionarItem("Camiseta", 2, 59.90)
    .adicionarItem("Tênis", 1, 249.90)
    .setEndereco("Rua das Flores", "123", "Joinville", "89201-000")
    .setPagamento(PagamentoFactory.criar("cartao", { parcelas: 3 }))
    .build();

  pedido.exibir();

  // Persiste o pedido no banco
  const db = Conexao.getInstance();

  await db.query(
    `INSERT INTO pedidos (id, total, forma_pagamento, rua, numero, cidade, cep)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      pedido.id,
      pedido.total,
      "cartao",
      pedido.endereco.rua,
      pedido.endereco.numero,
      pedido.endereco.cidade,
      pedido.endereco.cep,
    ]
  );

  for (const item of pedido.itens) {
    await db.query(
      `INSERT INTO itens_pedido (pedido_id, produto, quantidade, preco_unitario)
       VALUES (?, ?, ?, ?)`,
      [pedido.id, item.produto, item.quantidade, item.precoUnitario]
    );
  }

  console.log("✅ Pedido salvo no banco!");

  const pedidosSalvos = await db.query("SELECT * FROM pedidos");
  console.log("\n📋 Pedidos no banco:", pedidosSalvos);

  // ── Validação do Builder ──────────────────────────────────────────────────
  console.log("\n━━━ Testando validação do Builder ━━━");
  try {
    new PedidoBuilder()
      .setEndereco("Av. Brasil", "500", "Joinville", "89201-100")
      .setPagamento(PagamentoFactory.criar("pix"))
      .build();
  } catch (e) {
    console.log(e.message);
  }

  // ── ADAPTER ─────────────────────────────────────────────────────────────────
  console.log("\n━━━ TAREFA 04: ADAPTER ━━━");

  // O Pedido só conhece o contrato Pagamento; não sabe que por trás há um legado.
  const pagamentoLegado = new GatewayAdapter();
  console.log(pagamentoLegado.processar(299.90));

  // ── DECORATOR ───────────────────────────────────────────────────────────────
  console.log("\n━━━ TAREFA 05: DECORATOR ━━━");

  // Empilha comportamentos: log em cima de desconto em cima de PIX.
  const pixDecorado = new LogDecorator(
    new DescontoDecorator(PagamentoFactory.criar("pix"), 10)
  );
  console.log("Descrição:", pixDecorado.getDescricao());
  console.log(pixDecorado.processar(299.90));

  // ── FACADE ──────────────────────────────────────────────────────────────────
  console.log("\n━━━ TAREFA 06: FACADE ━━━");

  // O cliente chama apenas finalizar() — não conhece os subsistemas internos.
  const checkout = new CheckoutFacade();
  checkout.finalizar(pedido);

  await db.fechar();
}

main().catch(console.error);
