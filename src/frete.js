/**
 * TAREFA 07 — STRATEGY (Comportamental)
 * Estratégias intercambiáveis de cálculo de frete.
 *
 * Por que Strategy aqui?
 * - O cálculo do frete varia por transportadora, mas o Carrinho não deve mudar
 *   quando uma nova transportadora surge.
 * - Cada estratégia encapsula um algoritmo de cálculo atrás do mesmo contrato.
 * - A estratégia é trocável em tempo de execução via setFrete().
 *   (Respeita Open/Closed: adicionar DHL = criar nova classe, sem tocar no Carrinho.)
 */

// ─── Contrato ────────────────────────────────────────────────────────────────

class EstrategiaFrete {
  calcular(peso) {
    throw new Error("calcular(peso) deve ser implementado pela estratégia.");
  }
}

// ─── Estratégias concretas ───────────────────────────────────────────────────

class FreteCorreios extends EstrategiaFrete {
  calcular(peso) {
    return 12.5 + peso * 1.8; // taxa base + por kg
  }
}

class FreteJadlog extends EstrategiaFrete {
  calcular(peso) {
    return 9.9 + peso * 2.4;
  }
}

class FreteRetirada extends EstrategiaFrete {
  calcular(peso) {
    return 0; // retirada na loja — sem custo
  }
}

// ─── Contexto que usa a estratégia ───────────────────────────────────────────

class Carrinho {
  constructor(estrategiaFrete = new FreteRetirada()) {
    this._estrategiaFrete = estrategiaFrete;
  }

  setFrete(estrategiaFrete) {
    this._estrategiaFrete = estrategiaFrete;
    return this;
  }

  calcularFrete(peso) {
    return this._estrategiaFrete.calcular(peso);
  }
}

module.exports = {
  EstrategiaFrete,
  FreteCorreios,
  FreteJadlog,
  FreteRetirada,
  Carrinho,
};
