# Calculadora de CDB — API

API para simular o rendimento de uma aplicação em CDB, construída em .NET 10 e organizada com Clean Architecture.

As taxas e faixas de imposto são externas ao código e ficam em `src/CdbCalculator.Api/appsettings.json`.

## Tecnologias

- .NET SDK 10.0 ou superior;
- ASP.NET Core Web API;
- OpenAPI e Swagger UI;
- xUnit e Coverlet para testes e cobertura.

## Estrutura da solução

```text
CdbCalculator.slnx
src/
  CdbCalculator.Domain/        # Regras de cálculo e imposto de renda
  CdbCalculator.Application/   # Caso de uso CalculateCdb
  CdbCalculator.Api/           # Endpoint HTTP, OpenAPI e Swagger
tests/
  CdbCalculator.Domain.Tests/
  CdbCalculator.Application.Tests/
  CdbCalculator.Api.Tests/
```

## Pré-requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download/dotnet/10.0);
- Acesso ao NuGet para restaurar os pacotes de teste e Swagger UI.

Confirme a instalação:

```powershell
dotnet --version
```

## Restaurar dependências e compilar

Na pasta raiz do projeto:

```powershell
dotnet restore CdbCalculator.slnx --configfile NuGet.Config
dotnet build CdbCalculator.slnx --no-restore
```

## Executar a API

Execute a API na porta `5000`:

```powershell
dotnet run --project src/CdbCalculator.Api --urls http://localhost:5000
```

Depois de iniciada em ambiente `Development`, a documentação interativa estará disponível em:

```text
http://localhost:5000/swagger/index.html
```

O documento OpenAPI estará disponível em:

```text
http://localhost:5000/openapi/v1.json
```

## Endpoint de cálculo

### `POST /api/cdb/calculate`

Calcula o valor bruto, o imposto de renda e o valor líquido da aplicação.

#### Corpo da requisição

```json
{
  "initialAmount": 1000.00,
  "termInMonths": 12
}
```

| Campo | Tipo | Regra |
|---|---|---|
| `initialAmount` | decimal | Must be greater than zero. |
| `termInMonths` | integer | Must be greater than one. |

#### Exemplo com PowerShell

```powershell
$body = @{ initialAmount = 1000.00; termInMonths = 12 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:5000/api/cdb/calculate' -ContentType 'application/json' -Body $body
```

#### Resposta de sucesso — `200 OK`

```json
{
  "grossAmount": 1123.08,
  "incomeTax": 24.62,
  "netAmount": 1098.47
}
```

Os valores são calculados com `decimal`; o arredondamento para duas casas decimais ocorre somente na resposta da API.

#### Resposta de validação — `400 Bad Request`

```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "initialAmount": ["Initial amount must be greater than zero."],
    "termInMonths": ["Term must be greater than one month."]
  }
}
```

## Configuração do cálculo

As regras financeiras ficam na seção `CdbCalculation` de `src/CdbCalculator.Api/appsettings.json`:

```json
{
  "CdbCalculation": {
    "CdiRate": 0.009,
    "BankCdiPercentage": 1.08,
    "TaxBrackets": [
      { "MaximumTermInMonths": 6, "Rate": 0.225 },
      { "MaximumTermInMonths": 12, "Rate": 0.20 },
      { "MaximumTermInMonths": 24, "Rate": 0.175 },
      { "MaximumTermInMonths": null, "Rate": 0.15 }
    ]
  }
}
```

A API não inicia se CDI, percentual bancário ou faixas estiverem inválidos. As faixas devem estar em ordem crescente, ter alíquotas entre zero e um e encerrar com uma faixa sem prazo máximo.

## Regras de negócio

- CDI mensal padrão: **0,9%** (`0.009m`);
- Percentual bancário padrão: **108% do CDI** (`1.08m`);
- O rendimento é composto mês a mês;
- O imposto incide somente sobre o rendimento;
- Alíquotas de IR:

| Prazo | Alíquota |
|---|---:|
| 2 a 6 meses | 22,5% |
| 7 a 12 meses | 20% |
| 13 a 24 meses | 17,5% |
| Acima de 24 meses | 15% |

## Executar os testes

```powershell
dotnet test CdbCalculator.slnx --no-restore
```

Para gerar os arquivos de cobertura Cobertura:

```powershell
dotnet test CdbCalculator.slnx --no-restore --collect:'XPlat Code Coverage'
```

Os arquivos de cobertura são gerados nas pastas `tests/*/TestResults`.

## Qualidade de código

- O projeto trata avisos de compilação como erros;
- A camada de domínio possui cobertura de testes acima de 90%;
- Use SonarLint durante o desenvolvimento;
- Execute a análise local do SonarQube antes da entrega, conforme a configuração do ambiente.
