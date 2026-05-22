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