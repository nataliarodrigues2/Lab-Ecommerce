/**
 * TAREFA 05 — DECORATOR (Estrutural)
 * Adiciona comportamentos extras ao pagamento sem alterar as classes existentes.
 *
 * Por que Decorator aqui?
 * - Queremos somar comportamentos (log, desconto) de forma dinâmica e combinável,
 *   sem tocar em CartaoCredito, Pix ou Boleto.
 * - Cada decorator envolve um Pagamento e delega a chamada, podendo agir antes/depois.
 * - Como todos implementam o mesmo contrato Pagamento, são empilháveis em qualquer ordem.
 */

const { Pagamento } = require("./pagamento");

// ─── Decorator base ─────────────────────────────────────────────────────────
// Envolve um Pagamento (wrappee) e, por padrão, apenas delega.

class PagamentoDecorator extends Pagamento {
  constructor(pagamento) {
    super();
    this._wrappee = pagamento;
  }

  processar(valor) {
    return this._wrappee.processar(valor);
  }

  getDescricao() {
    return this._wrappee.getDescricao();
  }
}

// ─── Decorators concretos ───────────────────────────────────────────────────

class LogDecorator extends PagamentoDecorator {
  processar(valor) {
    console.log(`📝 [LOG] Iniciando cobrança de R$ ${valor.toFixed(2)} (${this._wrappee.getDescricao()})`);
    const resultado = this._wrappee.processar(valor);
    console.log(`📝 [LOG] Cobrança finalizada.`);
    return resultado;
  }

  getDescricao() {
    return `${this._wrappee.getDescricao()} + log`;
  }
}

class DescontoDecorator extends PagamentoDecorator {
  constructor(pagamento, percentual) {
    super(pagamento);
    this._percentual = percentual;
  }

  processar(valor) {
    const valorComDesconto = valor * (1 - this._percentual / 100);
    console.log(`🏷️  Desconto de ${this._percentual}% aplicado: R$ ${valor.toFixed(2)} → R$ ${valorComDesconto.toFixed(2)}`);
    return this._wrappee.processar(valorComDesconto);
  }

  getDescricao() {
    return `${this._wrappee.getDescricao()} + ${this._percentual}% off`;
  }
}

module.exports = { PagamentoDecorator, LogDecorator, DescontoDecorator };
