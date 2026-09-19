# Calculadora de CDB — Fullstack (.NET 10 & Angular 22)

Solução completa para simulação de investimento em CDB (Certificado de Depósito Bancário) pós-fixado, composta por uma **Web API em .NET 10** e um **front-end em Angular 22**, estruturada segundo os princípios da **Clean Architecture** e boas práticas de engenharia de software (SOLID, testes automatizados e design moderno responsivo).

---

## 🏛️ Visão Geral da Arquitetura

```text
Usuário
   │
   ▼
Angular 22 (Web UI) ── POST /api/cdb/calculate ──► ASP.NET Core API (.NET 10)
   │                                                     │
   │                                                     ▼
   └── Exibe projeção de resgate                   Camada de Aplicação
       e validações Problem Details                      │
                                                         ▼
                                                   Camada de Domínio
                                                   ├── Cálculo composto de CDB
                                                   └── Regras e alíquotas de IR
```

---

## 🛠️ Tecnologias e Padrões Utilizados

### Backend (.NET 10)
- **ASP.NET Core Web API** stateless;
- **Clean Architecture** com desacoplamento total do domínio: `CdbCalculator.Domain`, `CdbCalculator.Application` e `CdbCalculator.Api`;
- **OpenAPI & Swagger UI** configurados para o ambiente de desenvolvimento;
- **RFC 7807 (Problem Details)** para tratamento padronizado de erros de validação (HTTP 400);
- **xUnit** e **Coverlet** para testes unitários com cobertura > 90%;
- **CORS** configurado para a origem `http://localhost:4200`.

### Front-end (Angular 22)
- **Angular 22** com Componentes Standalone (sem dependência de NgModules obsoletos);
- **Reactive Forms** com validações de entrada e sincronização com mensagens de erro do servidor;
- **Angular Signals** (`signal`, `computed`) para gerenciamento do estado reativo local;
- **Identidade visual corporativa e moderna**: paleta em azul marinho (`#0B1E42`), azul elétrico (`#0055FF`) e branco/cinza institucional (`#F4F7FB`);
- **Painel explicativo didático** exibindo as variáveis utilizadas no cálculo (`CDI = 0,90% a.m.`, `TB = 108%`, `Taxa Efetiva = 0,972% a.m.`) e tabela de IR;
- **Vitest** com `@vitest/coverage-v8` para testes unitários rápidos e cobertura > 95%;
- **Convenção de código**: 100% dos identificadores em inglês com interface para o usuário em Português (`pt-BR`).

---

## 📁 Estrutura da Solução

```text
CdbCalculator.slnx
src/
  CdbCalculator.Domain/        # Regras puras de negócio, cálculo composto e faixas de IR
  CdbCalculator.Application/   # Caso de uso CalculateCdb e DTOs
  CdbCalculator.Api/           # Controllers HTTP, OpenAPI, Swagger e CORS
  CdbCalculator.Web/           # Aplicação Angular 22 (Standalone + Signals + Modern UI)
    src/
      app/
        core/                  # Configurações de API e modelos RFC 7807
        features/
          cdb-calculator/      # Componente principal, serviço, modelos e painel explicativo
            components/
              cdb-info-panel/  # Painel de variáveis e tabela regressiva de IR
            directives/
              brl-currency/    # Diretiva de máscara monetária BRL
tests/
  CdbCalculator.Domain.Tests/
  CdbCalculator.Application.Tests/
  CdbCalculator.Api.Tests/
```

---

## ⚙️ Pré-requisitos

- [.NET SDK 10.0](https://dotnet.microsoft.com/download/dotnet/10.0) ou superior;
- [Node.js](https://nodejs.org/) v20+ ou v24+ e npm v11+;
- Navegador moderno (Google Chrome, Microsoft Edge, Firefox).

---

## 🚀 Como Executar a Aplicação

### 1. Iniciar o Backend (.NET Web API)

Na raiz do repositório (`C:\Workspace\cdb-calculator`):

```powershell
# Restaurar dependências e compilar
dotnet restore CdbCalculator.slnx --configfile NuGet.Config
dotnet build CdbCalculator.slnx --no-restore

# Executar a API na porta 58678
dotnet run --project src/CdbCalculator.Api --urls http://localhost:58678
```

- **Swagger UI interativo:** [http://localhost:58678/swagger/index.html](http://localhost:58678/swagger/index.html)
- **OpenAPI JSON:** [http://localhost:58678/openapi/v1.json](http://localhost:58678/openapi/v1.json)

---

### 2. Iniciar o Front-end (Angular 22)

Abra outro terminal e navegue até a pasta web:

```powershell
cd src/CdbCalculator.Web

# Instalar dependências (se necessário)
npm install

# Iniciar o servidor de desenvolvimento
npm start
```

Acesse no navegador:
👉 **[http://localhost:4200](http://localhost:4200)**

---

## 📡 Contrato da Web API

### `POST /api/cdb/calculate`

Calcula o rendimento bruto, imposto de renda retido e resultado líquido da aplicação.

#### Corpo da Requisição (`application/json`):

```json
{
  "initialAmount": 1000.00,
  "termInMonths": 12
}
```

| Campo | Tipo | Regra de Validação |
|---|---|---|
| `initialAmount` | decimal | Obrigatório, maior que zero ($> 0$), até R$ 100.000.000,00 e máximo 2 casas decimais. |
| `termInMonths` | inteiro | Obrigatório, maior que um mês ($> 1$) e até 1.200 meses. |

#### Resposta de Sucesso — `200 OK`:

```json
{
  "grossAmount": 1123.18,
  "incomeTax": 24.64,
  "netAmount": 1098.54
}
```

#### Resposta de Erro de Validação — `400 Bad Request` (RFC 7807):

```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "InitialAmount": ["Initial amount must be greater than zero."],
    "TermInMonths": ["Term must be greater than one month."]
  }
}
```

#### Exemplo de Chamada via PowerShell:

```powershell
$body = @{ initialAmount = 1000.00; termInMonths = 12 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:58678/api/cdb/calculate' -ContentType 'application/json' -Body $body
```

---

## 📐 Regras de Negócio e Variáveis do Cálculo

1. **Rendimento Bruto (Juros Compostos Mensais):**
   $$VF = VI \times [1 + (CDI \times TB)]$$
   - **CDI Mensal**: `0,90%` (`0.009m`)
   - **Taxa do Banco (TB)**: `108%` (`1.08m`)
   - **Taxa Efetiva Mensal**: `0,972%` (`0.00972m`)

2. **Alíquotas Regressivas de Imposto de Renda (incidem exclusivamente sobre o lucro):**

| Prazo de Aplicação | Alíquota de IR |
|---|---:|
| Até 6 meses (2 a 6 meses) | **22,5%** |
| De 7 a 12 meses | **20,0%** |
| De 13 a 24 meses | **17,5%** |
| Acima de 24 meses | **15,0%** |

3. **Configuração Externa das Taxas:**
As taxas e alíquotas ficam parametrizadas em `src/CdbCalculator.Api/appsettings.json`:
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

---

## 🧪 Execução dos Testes Automatizados

### Testes do Backend (.NET / xUnit)

```powershell
# Executar todos os testes
dotnet test CdbCalculator.slnx --no-restore

# Executar com coleta de cobertura de código
dotnet test CdbCalculator.slnx --no-restore --collect:"XPlat Code Coverage"
```

### Testes do Front-end (Angular / Vitest)

```powershell
cd src/CdbCalculator.Web

# Executar suíte de testes
npm test -- --watch=false

# Executar com relatório detalhado de cobertura (V8)
npm test -- --coverage --watch=false
```

---

## 🛡️ Qualidade de Código e Análise Estática

- `TreatWarningsAsErrors` habilitado em todos os projetos .NET;
- Cobertura de testes unitários superior a **90% no backend** e **95% no front-end**;
- Código preparado e compatível com as regras do **SonarLint** e **SonarQube**.
