/**
 * TAREFA 02 — FACTORY METHOD
 * Produz diferentes formas de pagamento sem expor as classes concretas.
 *
 * Por que Factory Method aqui?
 * - O código cliente não precisa conhecer CartaoCredito, Pix ou Boleto.
 * - Adicionar Criptomoeda = criar nova classe + 1 case na factory.
 *   Nenhuma outra parte do sistema muda. (Princípio Aberto/Fechado)
 */

// ─── "Interface" base (contrato) ─────────────────────────────────────────────

class Pagamento {
  processar(valor) {
    throw new Error("processar() deve ser implementado pela subclasse.");
  }
  getDescricao() {
    throw new Error("getDescricao() deve ser implementado pela subclasse.");
  }
}

// ─── Implementações concretas ─────────────────────────────────────────────────

class CartaoCredito extends Pagamento {
  constructor(parcelas = 1) {
    super();
    this.parcelas = parcelas;
  }

  processar(valor) {
    const parcela = (valor / this.parcelas).toFixed(2);
    return `💳 Cartão de Crédito: R$ ${valor.toFixed(2)} em ${this.parcelas}x de R$ ${parcela} — APROVADO`;
  }

  getDescricao() {
    return `Cartão de Crédito (${this.parcelas} parcela(s))`;
  }
}

class Pix extends Pagamento {
  processar(valor) {
    const chave = `PIX-${Date.now()}`;
    return `⚡ PIX: R$ ${valor.toFixed(2)} | Chave: ${chave} — CONFIRMADO`;
  }

  getDescricao() {
    return "PIX (pagamento instantâneo)";
  }
}

class Boleto extends Pagamento {
  processar(valor) {
    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + 3);
    const data = vencimento.toLocaleDateString("pt-BR");
    return `🧾 Boleto: R$ ${valor.toFixed(2)} | Vencimento: ${data} — AGUARDANDO PAGAMENTO`;
  }

  getDescricao() {
    return "Boleto Bancário (vence em 3 dias)";
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

class PagamentoFactory {
  /**
   * Recebe o tipo e devolve o objeto certo.
   */
  static criar(tipo, opcoes = {}) {
    switch (tipo) {
      case "cartao":
        return new CartaoCredito(opcoes.parcelas ?? 1);
      case "pix":
        return new Pix();
     case "boleto": 
        return new Boleto();
      default:
        throw new Error(`Forma de pagamento não suportada: "${tipo}"`);
    }
  }
}

module.exports = { Pagamento, CartaoCredito, Pix, Boleto, PagamentoFactory };
