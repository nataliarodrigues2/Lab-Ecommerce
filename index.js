const { Conexao } = require("./src/conexao");
const { PagamentoFactory } = require("./src/pagamento");
const { PedidoBuilder } = require("./src/pedido");
const { GatewayAdapter } = require("./src/gatewayAdapter");
const { LogDecorator, DescontoDecorator } = require("./src/decoratorPagamento");
const { CheckoutFacade } = require("./src/checkoutFacade");
const { Carrinho, FreteCorreios, FreteJadlog, FreteRetirada } = require("./src/frete");
const { EmailObserver, EstoqueObserver, LogObserver } = require("./src/observers");
const {
  CancelarPedidoComando,
  AtualizarEnderecoComando,
  GerenciadorComandos,
} = require("./src/comandos");

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

  // ── STRATEGY ────────────────────────────────────────────────────────────────
  console.log("\n━━━ TAREFA 07: STRATEGY ━━━");

  const peso = 2.5; // kg
  const carrinho = new Carrinho(new FreteCorreios());
  console.log(`Correios:  R$ ${carrinho.calcularFrete(peso).toFixed(2)}`);

  // Troca de estratégia em tempo de execução — o Carrinho não muda.
  carrinho.setFrete(new FreteJadlog());
  console.log(`Jadlog:    R$ ${carrinho.calcularFrete(peso).toFixed(2)}`);

  carrinho.setFrete(new FreteRetirada());
  console.log(`Retirada:  R$ ${carrinho.calcularFrete(peso).toFixed(2)}`);

  // ── OBSERVER ────────────────────────────────────────────────────────────────
  console.log("\n━━━ TAREFA 08: OBSERVER ━━━");

  // Registra os observers e dispara a notificação ao mudar o status.
  pedido
    .adicionarObserver(new EmailObserver())
    .adicionarObserver(new EstoqueObserver())
    .adicionarObserver(new LogObserver());

  console.log(`Mudando status do pedido ${pedido.id} para CONFIRMADO...`);
  pedido.setStatus("CONFIRMADO");

  // ── COMMAND ─────────────────────────────────────────────────────────────────
  console.log("\n━━━ TAREFA 09: COMMAND ━━━");

  const gerenciador = new GerenciadorComandos();

  gerenciador.executar(new CancelarPedidoComando(pedido));
  gerenciador.executar(
    new AtualizarEnderecoComando(pedido, {
      rua: "Rua Nova",
      numero: "999",
      cidade: "Joinville",
      cep: "89202-000",
    })
  );

  console.log("\nDesfazendo as duas últimas ações...");
  gerenciador.desfazerUltimo(); // desfaz atualização de endereço
  gerenciador.desfazerUltimo(); // desfaz cancelamento

  await db.fechar();
}

main().catch(console.error);
