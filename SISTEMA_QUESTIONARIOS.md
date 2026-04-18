# Sistema de Questionários e Monitoramento de Saúde - Vigie Saúde

## 📋 Visão Geral

Sistema completo de questionários adaptativos, histórico de consultas e lembretes de medicações para monitoramento de comorbidades em tempo real.

---

## 🎯 Funcionalidades Implementadas

### 1. **Questionários Adaptativos por Comorbidade**
- Hipertensão
- Diabetes
- Odontológico
- Respiratório
- Saúde Mental
- Obesidade

Cada questionário é customizado com:
- Perguntas específicas
- Sistema de pontuação
- Classificação de risco (Crítico, Muito Alto, Alto, Médio, Baixo)
- Alertas urgentes para sintomas graves

### 2. **Classificação de Risco Internacional**
Implementação de padrões internacionais:
- WHO - Classificação de Pressão Arterial
- WHO - Classificação de Glicemia
- IMC - Índice de Massa Corporal
- HbA1c - Hemoglobina Glicada

### 3. **Histórico de Consultas**
- Armazenamento de todas as consultas
- Diagnósticos e veredictos
- Prescrições e medicações
- Classificação de risco por consulta
- Timeline completa por paciente

### 4. **Lembretes de Medicações**
- Registro de medicações ativas
- Horários de tomada configuráveis
- Confirmação de medicações tomadas
- Histórico de tomadas
- Alertas para medicações atrasadas

### 5. **Dashboard do Paciente**
- View consolidado de status de saúde
- Último monitoramento com badge de risco
- Medicações ativas com reminders
- Histórico de consultas expandível
- Histórico de questionários respondidos

---

## 🏗️ Arquitetura

### Arquivos Criados/Modificados

```
src/
├── data/
│   ├── types.ts                          # Interfaces de dados
│   └── questionariosConfig.ts            # Configuração de questionários (existente, aprimorado)
├── store/
│   └── questionarioStore.ts              # Store do LocalStorage para dados
├── components/
│   ├── FormularioQuestionario.tsx        # Componente de formul. questionário
│   ├── MedicacoesReminder.tsx            # Componente de reminders
│   ├── HistoricoConsultas.tsx            # Componente histórico consultas
│   └── HistoricoQuestionarios.tsx        # Componente histórico questionários
├── pages/
│   ├── Questionarios.tsx                 # Página principal questionários
│   └── PacienteDashboard.tsx             # Dashboard atualizado
├── utils/
│   └── integrationUtils.ts               # Utilitários de integração
└── services/
    └── googleSheets.ts                   # (Existente, compatível)
```

---

## 💾 Estrutura de Dados

### RespostaQuestionario
```typescript
{
  id: string;
  pacienteId: string;
  questionarioId: string;
  comorbidade: string;
  respostas: Record<string, string>;    // ID pergunta -> resposta
  pontuacao: number;
  classificacaoRisco: {
    nivel: string;
    cor: string;
    mensagem: string;
    alerta: string;
    emoji: string;
  };
  dataResposta: string;
  dataProxima?: string;
}
```

### ConsultaHistorico
```typescript
{
  id: string;
  pacienteId: string;
  data: string;
  profissionalNome: string;
  profissionalEspecialidade: string;
  motivo: string;
  conversa: string;
  vereditoGeral?: string;
  diagnostico?: string;
  prescricoes?: string[];
  medicacoes?: Array<{ nome, dose, dias }>;
  riskLevel?: "low" | "medium" | "high";
  comorbidities?: string[];
}
```

### RemindRemedicacao
```typescript
{
  id: string;
  pacienteId: string;
  medicacao: string;
  dose: string;
  frequencia: "diaria" | "a_cada_12h" | "a_cada_8h" | "semanal";
  horasDia: string[];
  dataInicio: string;
  dataFim?: string;
  tomarAgora: boolean;
  registrosTomadas: Array<{
    data: string;
    horario: string;
    confirmado: boolean;
  }>;
}
```

---

## 🔄 Fluxos de Uso

### Fluxo 1: Cadastro de Paciente
1. Profissional cadastra paciente com comorbidades
2. Sistema cria automaticamente:
   - Entrada inicial no histórico de consultas
   - Questionários correspondentes às comorbidades
3. Paciente recebe acesso ao dashboard
4. Paciente vê questionários pendentes

### Fluxo 2: Responder Questionário
1. Paciente vai para page `/questionarios/:pacienteId`
2. Seleciona questionário disponível
3. Responde perguntas progressivamente
4. Revisa respostas antes de enviar
5. Sistema calcula pontuação e classificação
6. Resultado exibido com alertas se necessário
7. Próximo questionário agendado automaticamente

### Fluxo 3: Medicações com Reminders
1. Profissional prescreve medicação ao cadastrar/consultaar
2. Sistema salva em `RemindRemedicacao`
3. Paciente vê medicações ativas no dashboard
4. Paciente confirma tomada de medicações
5. Sistema registra histórico de tomadas
6. Badge indica se medicação foi tomada hoje

---

## 🎨 Componentes & Páginas

### FormularioQuestionario
**Props:**
```typescript
questionario: QuestionarioConfig
pacienteId: string
onSubmit: (respostas, pontuacao, classificacao) => void
```

**Features:**
- Perguntas progressivas
- Barra de progresso
- Opções com feedback visual
- Review antes de enviar

### MedicacoesReminder
**Props:**
```typescript
medicacoes: RemindRemedicacao[]
onUpdateMedicacao?: (medicacao: RemindRemedicacao) => void
```

**Features:**
- Destaque para medicações atrasadas
- Confirmação de tomada
- Histórico de últimas tomadas
- Deleção de medicações

### HistoricoConsultas & HistoricoQuestionarios
**Features:**
- Listagem expandível/colapsável
- Badges de risco
- Timeline completa
- Detalhes abertos/fechados

---

## 🔌 API de Storage

### questionarioStore.ts

**Questionários:**
```javascript
getRespostasQuestionarios()              // Todas as respostas
salvarRespostaQuestionario(resposta)     // Salvar resposta
getRespostasDosPaciente(pacienteId)      // Respostas de um paciente
getUltimaRespostaPaciente(pacienteId)    // Última resposta
```

**Consultas:**
```javascript
getConsultasHistorico()                  // Todas as consultas
salvarConsultaHistorico(consulta)        // Salvar consulta
getConsultasDoPaciente(pacienteId)       // Consultas de um paciente
getUltimaConsultaPaciente(pacienteId)    // Última consulta
```

**Medicações:**
```javascript
getMedicacoes()                          // Todas as medicações
salvarMedicacao(medicacao)               // Salvar medicação
getMedicacoesDoPaciente(pacienteId)      // Medicações ativas
deletarMedicacao(medicacaoId)            // Remover medicação
confirmarTomouMedicacao(id, horario)     // Registrar tomada
getMedicacoesAtrasadas(pacienteId)       // Medicações não tomadas hoje
```

---

## 📱 Rotas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/questionarios/:pacienteId` | Questionarios.tsx | Página principal de questionários |
| `/questionarios/:pacienteId/:comorbidade` | Questionarios.tsx | Questionário específico |
| `/paciente/dashboard` | PacienteDashboard.tsx | Dashboard do paciente |

---

## ✅ Como Integrar no Seu Fluxo

### 1. No Cadastro de Paciente (NewPatient.tsx)
```typescript
import { integrarCadastroComQuestionarios } from "@/utils/integrationUtils";
import { questionariosConfig } from "@/data/questionariosConfig";

// Após salvar o paciente
integrarCadastroComQuestionarios(
  novoPaciente,
  user?.name || "Profissional",
  user?.specialty || "Médico",
  questionariosConfig
);
```

### 2. No Dashboard do Paciente
```typescript
import { getRespostasDosPaciente, getMedicacoesDoPaciente } from "@/store/questionarioStore";
import HistoricoQuestionarios from "@/components/HistoricoQuestionarios";
import MedicacoesReminder from "@/components/MedicacoesReminder";

// Carregar dados
const respostas = getRespostasDosPaciente(pacienteId);
const medicacoes = getMedicacoesDoPaciente(pacienteId);

// Renderizar
<HistoricoQuestionarios respostas={respostas} />
<MedicacoesReminder medicacoes={medicacoes} />
```

### 3. Adicionar Medicações
```typescript
import { salvarMedicacao } from "@/store/questionarioStore";
import { RemindRemedicacao } from "@/data/types";

const novaMedicacao: RemindRemedicacao = {
  id: uuid.v4(),
  pacienteId: "cpf_do_paciente",
  medicacao: "Losartana 50mg",
  dose: "1 comprimido",
  frequencia: "diaria",
  horasDia: ["08", "20"],  // 8h e 20h
  dataInicio: new Date().toISOString(),
  tomarAgora: true,
  registrosTomadas: []
};

salvarMedicacao(novaMedicacao);
```

---

## 🎓 Exemplos de Questões

### Hipertensão
- "Você aferiu sua pressão recentemente?" → Sim/Não
- "Qual o valor da sua pressão arterial? (Sistólica)" → categorias
- "Teve dor de cabeça nas últimas 24h?" → Sim/Não
- "Tomou sua medicação hoje?" → Sim/Não

### Diabetes
- "Você aferiu sua glicemia recentemente?" → Sim/Não
- "Qual o valor da sua glicemia em jejum?" → categorias
- "Sua glicemia está controlada?" → Sim/Não/Não sei

### Odontológico
- "A dor está controlada com a medicação?" → Sim/Não/Não estou tomando
- "Teve sangramento que não parou em 10min?" → Sim/Não (⚠️ URGENTE)
- "Teve febre ou inchaço no rosto?" → Sim/Não (⚠️ URGENTE)

---

## 🚨 Alertas e Notificações

### Classificação de Risco
- **CRÍTICO** (15+ pontos): 🚨 "PROCURE ATENDIMENTO MÉDICO IMEDIATAMENTE!"
- **MUITO ALTO** (10-14): 🔴 "Risco muito elevado. Procure atendimento em até 24h"
- **ALTO** (6-9): 🟠 "Risco elevado. Entre em contato com seu médico"
- **MÉDIO** (3-5): 🟡 "Risco moderado. Continue o monitoramento"
- **BAIXO** (0-2): 🟢 "Risco controlado. Continue assim!"

### Medicações Atrasadas
- Sistema verifica horários todos os dias
- Destaque em vermelho se atrasadas
- Botão de confirmação rápida

---

## 🔐 Armazenamento

Dados armazenados em:
- `vigie_respostas_questionarios` - Respostas
- `vigie_historico_consultas` - Consultas
- `vigie_medicacoes_reminders` - Medicações

**Nota:** Usar localStorage apenas para demo. Em produção, integrar com backend.

---

## 📊 Próximas Melhorias

- [ ] Integração com backend/database persistente
- [ ] Notificações push para reminders
- [ ] Exportação de relatórios PDF
- [ ] Gráficos de evolução de risco
- [ ] Integração com wearables/sensores
- [ ] IA para análise preditiva
- [ ] Compartilhamento seguro com profissional

---

## 🆘 Troubleshooting

**P: Questionários não aparecem após cadastro?**
R: Verifique se `integrarCadastroComQuestionarios` está sendo chamado.

**P: Medicações não salvam?**
R: Certifique-se que `pacienteId` está preenchido corretamente.

**P: Dashboard não mostra histórico?**
R: Limpe localStorage e cadastre um novo paciente.

---

**Desenvolvido para Vigie Saúde** © 2026
