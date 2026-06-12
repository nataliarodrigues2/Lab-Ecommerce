/**
 * TAREFA 03 — BUILDER
 * Constrói um Pedido de forma fluente, com validação antes de finalizar.
 *
 * Por que Builder aqui?
 * - Um Pedido tem muitos campos com regras de negócio (itens, endereço, pagamento).
 * - Construtor com vários parâmetros é confuso e frágil (erro de ordem).
 * - O Builder deixa a criação legível e validada em um único ponto (build()).
 *
 * TAREFA 08 — OBSERVER (Subject)
 * O Pedido também atua como Subject: mantém uma lista de observers e os notifica
 * ao mudar de status, sem conhecer o tipo concreto de cada observer.
 */

// ─── Produto final ────────────────────────────────────────────────────────────

class Pedido {
  constructor(itens, endereco, pagamento) {
    this.id = `PED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.itens = [...itens];
    this.endereco = { ...endereco };
    this.pagamento = pagamento;
    this.total = itens.reduce((acc, item) => acc + item.quantidade * item.precoUnitario, 0);
    this.criadoEm = new Date();
    this.status = "CRIADO";
    this._observers = [];
  }

  // ─── Observer (Subject) ──────────────────────────────────────────────────
  adicionarObserver(observer) {
    this._observers.push(observer);
    return this;
  }

  setStatus(novoStatus) {
    this.status = novoStatus;
    this._notificar();
  }

  _notificar() {
    this._observers.forEach((obs) => obs.atualizar(this));
  }

  exibir() {
    console.log("\n========================================");
    console.log(`📦 PEDIDO: ${this.id}`);
    console.log(`📅 ${this.criadoEm.toLocaleString("pt-BR")}`);
    console.log("----------------------------------------");
    console.log("🛒 Itens:");
    this.itens.forEach((item) => {
      const subtotal = (item.quantidade * item.precoUnitario).toFixed(2);
      console.log(`   • ${item.produto} x${item.quantidade} — R$ ${subtotal}`);
    });
    console.log(`💰 Total: R$ ${this.total.toFixed(2)}`);
    console.log("----------------------------------------");
    console.log(`🚚 Entrega: ${this.endereco.rua}, ${this.endereco.numero}`);
    console.log(`   ${this.endereco.cidade} — CEP ${this.endereco.cep}`);
    console.log("----------------------------------------");
    console.log(`💳 Pagamento: ${this.pagamento.getDescricao()}`);
    console.log(this.pagamento.processar(this.total));
    console.log("========================================\n");
  }
}

// ─── Builder ──────────────────────────────────────────────────────────────────

class PedidoBuilder {
  constructor() {
    this._itens = [];
    this._endereco = null;
    this._pagamento = null;
  }

  // Retorna o próprio builder → permite encadeamento fluente
  adicionarItem(produto, quantidade, precoUnitario) {
    if (quantidade <= 0) throw new Error("Quantidade deve ser maior que zero.");
    if (precoUnitario <= 0) throw new Error("Preço deve ser maior que zero.");
    this._itens.push({ produto, quantidade, precoUnitario });
    return this;
  }

  setEndereco(rua, numero, cidade, cep) {
    this._endereco = { rua, numero, cidade, cep };
    return this;
  }

  setPagamento(pagamento) {
    this._pagamento = pagamento;
    return this;
  }

  // Valida tudo e devolve o Pedido pronto
  build() {
    if (this._itens.length === 0) {
      throw new Error("❌ O pedido deve ter pelo menos um item.");
    }
    if (!this._endereco) {
      throw new Error("❌ O pedido deve ter um endereço de entrega.");
    }
    if (!this._pagamento) {
      throw new Error("❌ O pedido deve ter uma forma de pagamento.");
    }
    return new Pedido(this._itens, this._endereco, this._pagamento);
  }
}

module.exports = { Pedido, PedidoBuilder };
