/**
 * TAREFA 04 — ADAPTER (Estrutural)
 * Integração com um gateway de pagamento legado de terceiros.
 *
 * Por que Adapter aqui?
 * - O gateway legado expõe uma interface incompatível com a do sistema.
 * - Não podemos alterar o código do legado (é de terceiros).
 * - O Adapter "traduz" a chamada para o contrato Pagamento, então o Pedido
 *   continua chamando apenas processar(valor) — sem saber que existe um legado.
 *   (Princípio Open/Closed: estendemos sem modificar o que já existe.)
 */

const { Pagamento } = require("./pagamento");

// ─── Gateway legado de terceiros (NÃO ALTERAR) ───────────────────────────────
// Simula uma API antiga: trabalha em centavos e devolve um objeto, não string.

class GatewayLegado {
  efetuarCobranca(montanteEmCentavos) {
    const transacaoId = `LEG-${Math.floor(montanteEmCentavos * 7 + 1000)}`;
    return {
      sucesso: true,
      codigo: 200,
      transacaoId,
      valorCobradoCentavos: montanteEmCentavos,
    };
  }
}

// ─── Adapter ──────────────────────────────────────────────────────────────────
// Implementa o contrato Pagamento e adapta a chamada para o legado.

class GatewayAdapter extends Pagamento {
  constructor(gatewayLegado = new GatewayLegado()) {
    super();
    this._legado = gatewayLegado;
  }

  processar(valor) {
    // Adapta a interface: reais -> centavos, objeto de resposta -> string padrão.
    const centavos = Math.round(valor * 100);
    const resposta = this._legado.efetuarCobranca(centavos);

    if (!resposta.sucesso) {
      return `🏦 Gateway Legado: R$ ${valor.toFixed(2)} — RECUSADO (código ${resposta.codigo})`;
    }
    return `🏦 Gateway Legado: R$ ${valor.toFixed(2)} | Transação: ${resposta.transacaoId} — APROVADO`;
  }

  getDescricao() {
    return "Gateway Legado (via Adapter)";
  }
}

module.exports = { GatewayLegado, GatewayAdapter };
