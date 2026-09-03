# Integração: Fechamento Mensal

Este documento descreve o contrato atual da API de fechamento mensal para a integração do front-end.

## Autenticação

Todos os endpoints exigem um JWT de acesso no cabeçalho da requisição:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

O usuário é definido pelo token. Não envie `userId` no corpo das requisições.

## Regras Gerais

- A data do fechamento deve usar o formato `YYYY-MM-DD`, por exemplo, `2026-09-30`.
- Um usuário não pode ter dois fechamentos com a mesma `closingDate`.
- Valores monetários devem ser números positivos com, no máximo, duas casas decimais.
- `amountCollected` e `totalInvoiceTax` são calculados pela API. Não envie esses campos.
- Campos não reconhecidos no objeto principal da requisição são removidos pela API.
- Cada fechamento pertence exclusivamente ao usuário autenticado.

## Criar Fechamento

```http
POST /monthly-closing
```

### Campos aceitos

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `closingDate` | string | Sim | Data no formato `YYYY-MM-DD` |
| `isClosing` | boolean | Não | Quando omitido, assume `false` |
| `operacionalPj` | objeto | Não | Dados operacionais do PJ |
| `personalExpense` | array | Não | Lista de despesas pessoais |

### DTO de `operacionalPj`

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `accountFee` | number | Não | Maior ou igual a `0` |
| `individualContribution` | number | Não | Maior ou igual a `0` |
| `invoice` | array | Não | Lista de notas fiscais |

O objeto operacional só é criado se houver uma tarifa, contribuição ou pelo menos uma nota fiscal. Quando criado sem uma das tarifas, o respectivo valor assume `0`.

### DTO de cada nota fiscal

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `value` | number | Sim | Maior que `0`, com no máximo duas casas decimais |

### DTO de cada despesa pessoal

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `name` | string | Sim | Não pode ser vazio |
| `description` | string | Não | Descrição da despesa |
| `value` | number | Sim | Maior que `0`, com no máximo duas casas decimais |
| `expenseTypeId` | string | Sim | ID do tipo de despesa |

### Exemplo mínimo

```json
{
  "closingDate": "2026-09-30"
}
```

### Exemplo completo

```json
{
  "closingDate": "2026-09-30",
  "isClosing": false,
  "operacionalPj": {
    "accountFee": 50,
    "individualContribution": 2000,
    "invoice": [
      { "value": 15000.5 },
      { "value": 5000 }
    ]
  },
  "personalExpense": [
    {
      "name": "Aluguel",
      "description": "Escritório",
      "value": 1200.5,
      "expenseTypeId": "uuid-do-tipo-de-despesa"
    }
  ]
}
```

### Cálculos realizados pela API

- `amountCollected`: soma dos valores de todas as notas fiscais.
- `totalInvoiceTax`: $6\%$ do valor de `amountCollected`.

## Editar Fechamento

```http
PATCH /monthly-closing/:id
```

Todos os campos do `PATCH` são opcionais. Envie somente os campos que devem mudar.

### Campos aceitos

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `closingDate` | string | Não | Não pode duplicar a data de outro fechamento do mesmo usuário |
| `isClosing` | boolean | Não | Atualiza o status de conclusão |
| `operacionalPj.accountFee` | number | Não | Maior que `0` |
| `operacionalPj.individualContribution` | number | Não | Maior que `0` |
| `operacionalPj.invoice` | array | Não | Substitui todas as notas existentes quando enviada |
| `personalExpense` | array | Não | Substitui todas as despesas existentes quando enviada |

### Regra essencial para listas

No `PATCH`, as listas possuem comportamento de substituição completa:

| Campo | Omitido | Enviado como `[]` | Enviado com itens |
| --- | --- | --- | --- |
| `operacionalPj.invoice` | Mantém as notas atuais | Remove todas as notas | Remove as atuais e cria a nova lista |
| `personalExpense` | Mantém as despesas atuais | Remove todas as despesas | Remove as atuais e cria a nova lista |

Não há atualização individual de nota fiscal ou despesa por este endpoint. Para alterar um item, o front-end deve enviar a coleção completa com o estado final desejado.

Quando `operacionalPj` é enviado para um fechamento que ainda não tem dados operacionais, a API cria esse registro. Ao alterar `invoice`, a API recalcula `amountCollected` e `totalInvoiceTax`.

### Exemplo: alterar somente o status

```json
{
  "isClosing": true
}
```

### Exemplo: alterar dados operacionais sem modificar as notas

```json
{
  "operacionalPj": {
    "accountFee": 65,
    "individualContribution": 2500
  }
}
```

### Exemplo: substituir todas as notas

```json
{
  "operacionalPj": {
    "invoice": [
      { "value": 18000 },
      { "value": 7200.5 }
    ]
  }
}
```

### Exemplo: remover todas as notas

```json
{
  "operacionalPj": {
    "invoice": []
  }
}
```

### Exemplo: substituir todas as despesas

```json
{
  "personalExpense": [
    {
      "name": "Internet",
      "description": "Plano empresarial",
      "value": 199.9,
      "expenseTypeId": "uuid-do-tipo-de-despesa"
    }
  ]
}
```

## Excluir Fechamento

```http
DELETE /monthly-closing/:id
```

A exclusão é lógica (`soft delete`). Ao excluir um fechamento, a API também exclui logicamente:

- as despesas pessoais vinculadas;
- as notas fiscais vinculadas ao operacional PJ;
- o operacional PJ vinculado;
- o fechamento mensal.

Em caso de sucesso, a resposta não possui corpo. Após uma resposta HTTP de sucesso, o front-end pode remover o fechamento da lista local.

## Consultar Um Fechamento

```http
GET /monthly-closing/find-one/:id
```

Retorna o fechamento com os dados operacionais, notas fiscais e despesas pessoais.

## Listar Fechamentos

```http
GET /monthly-closing/find-all?page=1&limit=10&startDate=2026-09-01&endDate=2026-09-30
```

### Parâmetros de consulta

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `page` | number | Não | Página atual. Padrão: `1` |
| `limit` | number | Não | Quantidade de itens por página. Padrão: `10` |
| `startDate` | string | Não | Data inicial no formato `YYYY-MM-DD` |
| `endDate` | string | Não | Data final no formato `YYYY-MM-DD` |

Os resultados são ordenados por `closingDate` de forma decrescente.

### Formato da resposta paginada

```json
{
  "data": [
    {
      "id": "uuid-do-fechamento",
      "closingDate": "2026-09-30",
      "amountCollected": 20000.5,
      "isClosing": false,
      "operacionalPj": {
        "id": "uuid-operacional-pj",
        "accountFee": 50,
        "individualContribution": 2000,
        "totalInvoiceTax": 1200.03,
        "invoice": [
          { "id": "uuid-da-nota", "value": 20000.5 }
        ]
      },
      "personalExpense": [
        {
          "id": "uuid-da-despesa",
          "name": "Aluguel",
          "description": "Escritório",
          "value": 1200.5,
          "expenseType": {
            "id": "uuid-do-tipo-de-despesa",
            "name": "Moradia"
          }
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limitPerPage": 10,
    "totalItems": 1,
    "previousPage": null,
    "nextPage": null
  }
}
```

## Erros Esperados

| Status | Situação |
| --- | --- |
| `400` | Dados inválidos, como data ou valor fora do formato esperado |
| `401` | Token ausente, inválido ou usuário não encontrado |
| `404` | Fechamento não encontrado para o usuário autenticado |
| `409` | Data duplicada para o usuário; na exclusão, também é retornado quando o fechamento não existe |

## Observação Sobre Datas

A validação da API aceita o padrão `YYYY-MM-DD` e dias de `01` a `31`, mas não valida a existência real da data no calendário. O front-end deve validar datas impossíveis, como `2026-02-31`, antes de enviar a requisição.