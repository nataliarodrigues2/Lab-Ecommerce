## 1. Por que faz sentido usar Singleton aqui? Quais problemas ele resolve nesse contexto?

Se cada parte do sistema criasse sua própria conexão, você teria várias abertas ao mesmo tempo sem necessidade, o que desperdiça recursos e pode travar o banco.

O Singleton garante que uma única conexão é criada e reutilizada por todo o sistema, resolvendo dois problemas principais:
- Desperdício de recursos — sem ele, múltiplas conexões seriam abertas desnecessariamente.
- Limite do banco — o MySQL tem um número máximo de conexões; estourar esse limite derruba a aplicação.

---

## 2. O que acontece quando precisarmos adicionar uma nova forma de pagamento (ex: criptomoeda)? A sua solução facilita isso?

Sim, facilita muito.

Para adicionar criptomoeda, basta criar a nova classe extendendo a classe Pagamento e implementar o método processar(). Depois é só registrar o novo case na factory.

O restante do sistema não muda nada — quem usa a factory não precisa saber como a criptomoeda funciona por dentro, só chama PagamentoFactory.criar("cripto") e recebe o objeto pronto.

Sem a Factory, você teria if/else espalhados pelo sistema — em todo lugar que cria um pagamento você teria que lembrar de adicionar a nova opção, o que é fácil de esquecer e difícil de manter.

---

## 3.  Por que Builder é mais adequado aqui do que um construtor com muitos parâmetros?

Porque um pedido tem várias informações obrigatórias — itens, endereço e pagamento — e um construtor com todos esses parâmetros de uma vez fica confuso e difícil de usar.

Com o Builder, a construção é feita passo a passo, de forma legível:

```js
new PedidoBuilder()
  .adicionarItem("Camiseta", 2, 59.90)
  .setEndereco("Rua das Flores", "123", "Joinville", "89201-000")
  .setPagamento(PagamentoFactory.criar("pix"))
  .build()
```

Além disso, o build() valida tudo antes de criar o objeto — se faltar alguma informação, ele lança um erro na hora certa, em vez de criar um pedido incompleto.

Sem o Builder, você teria que passar tudo de uma vez no construtor, sem clareza de qual parâmetro é qual, e as validações ficariam espalhadas ou seriam esquecidas.

---

## 4. Sem o Adapter, o que você teria que fazer para integrar o gateway legado? Como o Adapter preserva o princípio Open/Closed?

Sem o Adapter, você teria que espalhar as chamadas no formato do legado (centavos, objeto de resposta) por todo o sistema, ou alterar o código que consome `Pagamento` para tratar esse caso especial — e o gateway é de terceiros, não pode ser alterado.

O Adapter resolve isso criando uma classe que implementa o contrato `Pagamento` e, por dentro, traduz a chamada para o legado. O restante do sistema continua chamando só `processar(valor)`.

Isso preserva o Open/Closed: o código existente fica **fechado para modificação** (ninguém muda Pedido, Factory ou as outras formas de pagamento) e o sistema fica **aberto para extensão** (basta adicionar o adapter).

---

## 5. Como você adicionaria novos comportamentos (ex: enviar SMS) sem tocar nas classes existentes? Compare essa abordagem com herança simples.

Bastaria criar um novo decorator, ex. `SmsDecorator`, que envolve um `Pagamento` e dispara o SMS antes ou depois de delegar a chamada. Nenhuma classe de pagamento existente é alterada, e ele pode ser combinado com os outros (log, desconto) em qualquer ordem.

Comparado com herança simples: por herança, cada combinação viraria uma subclasse (`PixComLog`, `PixComLogEDesconto`, `PixComSms`...), gerando uma explosão de classes. O Decorator monta o comportamento em tempo de execução, empilhando objetos, o que é muito mais flexível.

---

## 6. O que aconteceria com o controller se a Facade não existisse e um subsistema mudasse sua API? Como a Facade protege o código cliente de mudanças internas?

Sem a Facade, o controller conheceria e chamaria cada subsistema diretamente (estoque, pagamento, carrinho, e-mail). Se um deles mudasse sua API, o controller (e todo lugar que repetisse esse fluxo) teria que ser alterado.

Com a Facade, o controller chama apenas `finalizar(pedido)`. A ordem e os detalhes de cada subsistema ficam isolados dentro da fachada — se uma API interna mudar, só a Facade é ajustada, e o cliente nem percebe.

---

## 7. Como você adicionaria uma nova transportadora (ex: DHL) sem modificar a classe Carrinho? Que princípio SOLID o Strategy ajuda a respeitar?

Bastaria criar uma classe `FreteDHL` que implementa `EstrategiaFrete` com seu próprio `calcular(peso)` e passá-la ao `Carrinho` via construtor ou `setFrete()`. A classe `Carrinho` não muda em nada.

O Strategy ajuda a respeitar o **Open/Closed Principle** (aberto para extensão, fechado para modificação) e também o **Dependency Inversion** — o `Carrinho` depende da abstração `EstrategiaFrete`, não de uma transportadora concreta.

---

## 8. O que muda no código quando você precisa adicionar um novo observer (ex: SMS)? Compare com uma implementação sem o padrão, onde Pedido chamaria cada serviço diretamente.

Com o Observer, basta criar `SmsObserver` implementando `atualizar(pedido)` e registrá-lo com `pedido.adicionarObserver(...)`. A classe `Pedido` não muda.

Sem o padrão, o `Pedido` chamaria cada serviço diretamente dentro do `setStatus()` — então adicionar SMS exigiria editar o `Pedido`, que passaria a depender de e-mail, estoque, log, SMS... acoplando o Subject a todos os serviços e violando o princípio de responsabilidade única.

---

## 9. Que vantagens o Command traz além do undo? Como você usaria esse padrão para implementar uma fila de tarefas assíncronas?

Além do undo, o Command desacopla quem pede a ação de quem a executa, permite **registrar histórico/auditoria** das ações, agrupar várias ações em uma macro e tratar cada ação como um objeto de primeira classe.

Para uma fila assíncrona, como cada ação é um objeto com `executar()`, dá para enfileirar comandos numa estrutura (ou broker de mensagens) e processá-los depois, em outro momento ou worker — exatamente porque a ação está encapsulada e não depende do contexto onde foi criada.