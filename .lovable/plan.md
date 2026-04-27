## Situação atual

Verifiquei a regra "só permitir palpite antes do início da partida" e ela **não está totalmente garantida**:

- **Frontend (`src/components/MatchCard.tsx`)**: a edição é liberada quando `match.status === "upcoming"`. Como o status só muda para `finished` quando o admin marca manualmente, uma partida cujo horário já passou (mas ainda está como `scheduled`) **continua aceitando palpites**.
- **Backend (RLS da tabela `predictions`)**: as políticas atuais (`Users insert own predictions` e `Users update own predictions`) **não checam o horário da partida**. Qualquer usuário autenticado pode inserir/editar um palpite via API mesmo depois do jogo começar.
- **Tela de Admin**: também usa `match.status === "upcoming"` para ordenação, então jogos passados ainda não finalizados aparecem como "próximos" (apenas estético).

## O que vai mudar

### 1. Backend — bloquear no banco (fonte da verdade)

Atualizar as políticas RLS de `predictions` para exigir que `match_date > now()`:

- Substituir a policy de INSERT por: só permite inserir se `auth.uid() = user_id` **E** a partida referenciada tem `match_date > now()`.
- Substituir a policy de UPDATE de forma equivalente.
- DELETE pode ser mantido como está (ou também restringido — vou manter restringido a antes do início, pra evitar "apagar pra reinserir").

### 2. Frontend — refletir a regra na UI

- `MatchCard`: calcular `matchStarted = Date.now() >= horário da partida` e considerar `canEdit = editable && status === "upcoming" && !matchStarted`.
- Quando a partida já começou e ainda está sem placar, mostrar o palpite salvo (somente leitura) ou "Sem palpite" + legenda "Palpites encerrados", em vez do formulário.
- `useSavePrediction`: tratar erro vindo do banco (RLS) com toast amigável "Palpites já encerrados para esta partida".

### 3. Admin

- Sem mudança de regra, apenas garantir que o filtro/ordenação continue funcionando. Não mexer.

## Detalhes técnicos

Migração SQL:

```sql
DROP POLICY "Users insert own predictions" ON public.predictions;
DROP POLICY "Users update own predictions" ON public.predictions;

CREATE POLICY "Users insert predictions before kickoff"
  ON public.predictions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id AND m.match_date > now()
    )
  );

CREATE POLICY "Users update predictions before kickoff"
  ON public.predictions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id AND m.match_date > now()
    )
  );
```

Frontend: ajustar `MatchCard.tsx` (cálculo de `matchStarted` a partir de `match.date + match.time` em horário de Brasília) e a mensagem exibida quando `isUpcoming && matchStarted`.

## Resultado esperado

- Antes do horário do jogo: usuário pode criar/editar palpite normalmente.
- A partir do horário do jogo: formulário some, aparece o palpite gravado (ou "Sem palpite") + selo "Palpites encerrados". Qualquer tentativa via API é bloqueada pelo banco.
