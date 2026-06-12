/**
 * TAREFA 06 — FACADE (Estrutural)
 * Fachada que orquestra a finalização de um pedido.
 *
 * Por que Facade aqui?
 * - Finalizar uma compra envolve vários subsistemas (estoque, pagamento, carrinho, e-mail).
 * - O controller não deve conhecer nem a ordem nem a API de cada subsistema.
 * - A Facade expõe um único ponto de entrada — finalizar(pedido) — e protege o cliente
 *   de mudanças internas: se um subsistema mudar sua API, só a Facade é ajustada.
 */

// ─── Subsistemas (stubs simples) ─────────────────────────────────────────────

class EstoqueService {
  verificarDisponibilidade(pedido) {
    console.log(`📦 [Estoque] Verificando disponibilidade de ${pedido.itens.length} item(ns)...`);
    return true;
  }

  baixar(pedido) {
    console.log(`📦 [Estoque] Baixa de estoque realizada.`);
  }
}

class PagamentoService {
  cobrar(pagamento, valor) {
    console.log(`💳 [Pagamento] Processando...`);
    console.log("   " + pagamento.processar(valor));
    return true;
  }
}

class CarrinhoService {
  esvaziar(pedido) {
    console.log(`🛒 [Carrinho] Carrinho do pedido ${pedido.id} esvaziado.`);
  }
}

class EmailService {
  enviarConfirmacao(pedido) {
    console.log(`📧 [E-mail] Confirmação do pedido ${pedido.id} enviada ao cliente.`);
  }
}

// ─── Facade ───────────────────────────────────────────────────────────────────

class CheckoutFacade {
  constructor() {
    this._estoque = new EstoqueService();
    this._pagamento = new PagamentoService();
    this._carrinho = new CarrinhoService();
    this._email = new EmailService();
  }

  finalizar(pedido) {
    console.log(`\n🧾 Finalizando pedido ${pedido.id}...`);

    if (!this._estoque.verificarDisponibilidade(pedido)) {
      console.log("❌ Pedido não finalizado: itens indisponíveis.");
      return { sucesso: false };
    }

    this._pagamento.cobrar(pedido.pagamento, pedido.total);
    this._estoque.baixar(pedido);
    this._carrinho.esvaziar(pedido);
    this._email.enviarConfirmacao(pedido);

    console.log(`✅ Pedido ${pedido.id} finalizado com sucesso.`);
    return { sucesso: true };
  }
}

module.exports = {
  EstoqueService,
  PagamentoService,
  CarrinhoService,
  EmailService,
  CheckoutFacade,
};
