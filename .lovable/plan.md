## Objetivo

Remover criação livre de ligas. Usuário passa a ver todas as ligas cadastradas e pode **solicitar acesso**. Donos da liga (ex.: dono da Patropi) aprovam ou rejeitam as solicitações.

## Mudanças

### 1. Banco — nova tabela `league_join_requests`

Campos: `league_id`, `user_id`, `status` ('pending' | 'approved' | 'rejected'), `created_at`, `decided_at`, `decided_by`.

Índice único parcial em `(league_id, user_id)` onde `status = 'pending'` para impedir solicitações duplicadas em aberto.

RLS:
- Usuário pode **inserir** solicitação para si mesmo (apenas se ainda não for membro e não tiver pendente).
- Usuário **vê suas próprias** solicitações.
- Dono da liga (`leagues.owner_id = auth.uid()`) **vê e atualiza** solicitações da sua liga.

Função SECURITY DEFINER `approve_join_request(request_id uuid)`:
- Valida que quem chama é dono da liga.
- Insere em `league_members` (ignora se já existir) e marca a solicitação como `approved`.

Função `reject_join_request(request_id uuid)`: idem para rejeição.

### 2. Tela `/leagues` (`src/pages/LeaguesPage.tsx`)

- **Remover** botões "Criar liga" e "Entrar em liga".
- **Adicionar** botão único: **"Visualizar Ligas"**, que abre um modal listando todas as ligas cadastradas (nome + descrição + nº de participantes).
- Para cada liga na lista, mostrar status do usuário atual:
  - **Membro** → badge "Você participa".
  - **Pendente** → badge "Solicitação enviada" (desabilitado).
  - **Não membro** → botão "Solicitar acesso".
- Manter o restante da página (ranking da liga selecionada) como está.

### 3. Painel do dono da liga

Dentro da seção de detalhes da liga (visível apenas se `user.id === league.owner_id`), adicionar um card **"Solicitações pendentes"** listando cada solicitação com nome do usuário e botões **Aprovar** / **Rejeitar**.

### 4. Hooks novos em `src/hooks/useLeagues.ts`

- `useAllLeagues()` — lista todas as ligas + status do usuário (membro / pendente / nenhum).
- `useRequestJoinLeague()` — insere solicitação.
- `usePendingRequests(leagueId)` — lista solicitações pendentes (para o dono).
- `useApproveRequest()` / `useRejectRequest()` — chamam as RPCs.

Remover usos de `useCreateLeague` e `useJoinLeague` da UI (manter exportados ou apagar — decido apagar para limpar).

## Observações

- Ligas continuam podendo ser criadas via banco/admin se necessário; só a UI é bloqueada.
- A política RLS atual de `leagues` já permite que qualquer autenticado liste ligas (`Anyone can lookup leagues to join`), então o modal funciona sem mudanças adicionais.
