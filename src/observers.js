/**
 * TAREFA 08 — OBSERVER (Comportamental)
 * Observadores notificados automaticamente quando o status do pedido muda.
 *
 * Por que Observer aqui?
 * - Ao confirmar um pedido, vários serviços precisam reagir (e-mail, estoque, log).
 * - O Pedido (Subject) não deve conhecer o tipo concreto de cada serviço.
 * - Cada observer implementa atualizar(pedido); novos observers entram sem alterar o Pedido.
 */

// ─── Contrato ────────────────────────────────────────────────────────────────

class Observer {
  atualizar(pedido) {
    throw new Error("atualizar(pedido) deve ser implementado pelo observer.");
  }
}

// ─── Observers concretos ─────────────────────────────────────────────────────

class EmailObserver extends Observer {
  atualizar(pedido) {
    console.log(`📧 [Email] Pedido ${pedido.id} mudou para "${pedido.status}". Notificando o cliente.`);
  }
}

class EstoqueObserver extends Observer {
  atualizar(pedido) {
    console.log(`📦 [Estoque] Pedido ${pedido.id} agora "${pedido.status}". Ajustando estoque.`);
  }
}

class LogObserver extends Observer {
  atualizar(pedido) {
    console.log(`🗒️  [Auditoria] Status do pedido ${pedido.id}: "${pedido.status}".`);
  }
}

module.exports = { Observer, EmailObserver, EstoqueObserver, LogObserver };
