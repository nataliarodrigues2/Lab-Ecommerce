/**
 * TAREFA 09 — COMMAND (Comportamental)
 * Encapsula ações sobre o pedido como objetos, com suporte a desfazer (undo).
 *
 * Por que Command aqui?
 * - Cada ação administrativa (cancelar, atualizar endereço) vira um objeto com
 *   executar() e desfazer(), guardando o estado anterior para reverter.
 * - O GerenciadorComandos mantém histórico — base para undo, auditoria e até
 *   filas de tarefas assíncronas (os comandos são enfileiráveis).
 */

// ─── Contrato ────────────────────────────────────────────────────────────────

class Comando {
  executar() {
    throw new Error("executar() deve ser implementado pelo comando.");
  }
  desfazer() {
    throw new Error("desfazer() deve ser implementado pelo comando.");
  }
}

// ─── Comandos concretos ──────────────────────────────────────────────────────

class CancelarPedidoComando extends Comando {
  constructor(pedido) {
    super();
    this._pedido = pedido;
    this._statusAnterior = null;
  }

  executar() {
    this._statusAnterior = this._pedido.status; // salva para o undo
    this._pedido.setStatus("CANCELADO");
    console.log(`🚫 Pedido ${this._pedido.id} cancelado.`);
  }

  desfazer() {
    this._pedido.setStatus(this._statusAnterior);
    console.log(`↩️  Cancelamento desfeito. Status restaurado para "${this._statusAnterior}".`);
  }
}

class AtualizarEnderecoComando extends Comando {
  constructor(pedido, novoEndereco) {
    super();
    this._pedido = pedido;
    this._novoEndereco = novoEndereco;
    this._enderecoAnterior = null;
  }

  executar() {
    this._enderecoAnterior = this._pedido.endereco; // salva para o undo
    this._pedido.endereco = { ...this._novoEndereco };
    console.log(`🏠 Endereço do pedido ${this._pedido.id} atualizado para ${this._novoEndereco.rua}, ${this._novoEndereco.numero}.`);
  }

  desfazer() {
    this._pedido.endereco = this._enderecoAnterior;
    console.log(`↩️  Endereço restaurado para ${this._enderecoAnterior.rua}, ${this._enderecoAnterior.numero}.`);
  }
}

// ─── Invoker / histórico ─────────────────────────────────────────────────────

class GerenciadorComandos {
  constructor() {
    this._historico = [];
  }

  executar(comando) {
    comando.executar();
    this._historico.push(comando);
  }

  desfazerUltimo() {
    const comando = this._historico.pop();
    if (!comando) {
      console.log("Nada para desfazer.");
      return;
    }
    comando.desfazer();
  }
}

module.exports = {
  Comando,
  CancelarPedidoComando,
  AtualizarEnderecoComando,
  GerenciadorComandos,
};
