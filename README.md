# E-Commerce — Padrões de Projeto

## Alunos
> Diego Silveira | Natalia S. Rodrigues

## Sobre o projeto

Backend de um e-commerce usado como base para praticar **Padrões de Projeto** em
**JavaScript (Node.js)**, com banco de dados **MySQL** via Docker.

O projeto cobre duas atividades:

- **Atividade 03 — Padrões Criacionais:** Singleton, Factory Method e Builder.
- **Atividade 04 — Padrões Estruturais e Comportamentais:** Adapter, Decorator,
  Facade (estruturais) e Strategy, Observer, Command (comportamentais), evoluindo a
  mesma arquitetura sem reescrever o que já existia.

---

## Estrutura

```
Lab-Ecommerce/
├── compose.yaml
├── database/
│   └── init.sql               # Cria tabelas e insere dados de exemplo
├── index.js                   # Demonstração de todos os padrões
├── perguntas.md               # Justificativas de cada padrão
├── package.json
└── src/
    ├── conexao.js             # Tarefa 01 — Singleton
    ├── pagamento.js           # Tarefa 02 — Factory Method (contrato Pagamento)
    ├── pedido.js              # Tarefa 03 — Builder  +  Tarefa 08 — Observer (Subject)
    ├── gatewayAdapter.js      # Tarefa 04 — Adapter
    ├── decoratorPagamento.js  # Tarefa 05 — Decorator
    ├── checkoutFacade.js      # Tarefa 06 — Facade
    ├── frete.js               # Tarefa 07 — Strategy
    ├── observers.js           # Tarefa 08 — Observer (observers concretos)
    └── comandos.js            # Tarefa 09 — Command
```

---

## Decisões arquiteturais

### Atividade 03 — Criacionais

- **Singleton (`conexao.js`):** uma única instância de pool MySQL em toda a execução,
  criada de forma *lazy* no primeiro `getInstance()`. Evita abrir conexões redundantes
  e estourar o limite do banco.
- **Factory Method (`pagamento.js`):** `PagamentoFactory.criar(tipo)` devolve a
  implementação concreta de `Pagamento` (CartãoCredito, Pix, Boleto). O cliente não
  conhece as classes concretas — adicionar uma nova forma é criar a classe + 1 case.
- **Builder (`pedido.js`):** `PedidoBuilder` monta o `Pedido` de forma fluente e valida
  tudo em `build()` (não permite pedido sem itens, endereço ou pagamento).

### Atividade 04 — Estruturais e Comportamentais

- **Adapter (`gatewayAdapter.js`):** `GatewayLegado` simula uma API de terceiros
  incompatível (trabalha em centavos e devolve objeto). `GatewayAdapter` implementa o
  contrato `Pagamento` e traduz a chamada, então o `Pedido` continua usando só
  `processar(valor)`. Reaproveita o contrato da Atividade 03.
- **Decorator (`decoratorPagamento.js`):** `LogDecorator` e `DescontoDecorator` envolvem
  qualquer `Pagamento` e somam comportamento (log, desconto) sem alterar as classes de
  pagamento. São combináveis em qualquer ordem por compartilharem o mesmo contrato.
- **Facade (`checkoutFacade.js`):** `CheckoutFacade.finalizar(pedido)` orquestra estoque,
  pagamento, carrinho e e-mail. O cliente chama um único método e fica protegido de
  mudanças internas dos subsistemas.
- **Strategy (`frete.js`):** `EstrategiaFrete` define `calcular(peso)`; `FreteCorreios`,
  `FreteJadlog` e `FreteRetirada` são intercambiáveis em runtime via `Carrinho.setFrete()`.
- **Observer (`observers.js` + `pedido.js`):** o `Pedido` é o Subject — mantém a lista de
  observers e dispara `atualizar()` em `setStatus()`, sem conhecer os tipos concretos.
  `EmailObserver`, `EstoqueObserver` e `LogObserver` reagem à mudança de status.
- **Command (`comandos.js`):** `CancelarPedidoComando` e `AtualizarEnderecoComando`
  encapsulam ações com `executar()`/`desfazer()`, guardando o estado anterior.
  `GerenciadorComandos` mantém histórico e desfaz a última ação.

As justificativas completas de cada padrão estão em [perguntas.md](perguntas.md).

---

## Diagrama de relações (ASCII)

```
                        ┌───────────────────────┐
                        │   Pagamento (contrato) │
                        │  + processar(valor)    │
                        └───────────┬───────────┘
            ┌───────────┬───────────┼───────────┬──────────────────┐
            │           │           │           │                  │
     CartaoCredito     Pix       Boleto   GatewayAdapter   PagamentoDecorator
                                          (Adapter)         (Decorator base)
                                              │              ├── LogDecorator
                                       GatewayLegado         └── DescontoDecorator
                                       (não alterado)

   PagamentoFactory.criar(tipo) ───► instância de Pagamento

   ┌───────────────────────────┐        ┌──────────────────────────┐
   │          Pedido           │ Subject │   Observer (contrato)    │
   │  + setStatus()/notificar()│◄────────│  + atualizar(pedido)     │
   │  + adicionarObserver()    │  N obs. ├── EmailObserver          │
   └────────────┬──────────────┘         ├── EstoqueObserver        │
                │ build()                 └── LogObserver            │
          PedidoBuilder

   ┌──────────────────┐  usa   ┌───────────────────────┐
   │     Carrinho     │───────►│ EstrategiaFrete        │ (Strategy)
   │  + setFrete()    │        ├── FreteCorreios        │
   └──────────────────┘        ├── FreteJadlog          │
                               └── FreteRetirada        │

   CheckoutFacade.finalizar(pedido) ─► Estoque / Pagamento / Carrinho / Email (Facade)

   GerenciadorComandos ─► Comando (executar/desfazer)  (Command)
                          ├── CancelarPedidoComando
                          └── AtualizarEnderecoComando
```

---

## Como rodar

**1. Subir o banco:**
```bash
docker compose up -d
```

**2. Instalar dependências:**
```bash
npm install
```

**3. Aguardar o banco inicializar e rodar a demonstração de todos os padrões:**
```bash
node index.js
```
