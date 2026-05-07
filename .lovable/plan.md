## Objetivo

Impedir que admins excluam partidas que já tenham qualquer palpite registrado, preservando o histórico dos participantes.

## Mudanças

### 1. Banco de dados
- Remover o `ON DELETE CASCADE` da foreign key `predictions.match_id → matches.id` e substituir por `ON DELETE RESTRICT`. Assim, qualquer tentativa de excluir uma partida com palpites será bloqueada pelo próprio banco — uma trava real, à prova de bypass pela UI.

### 2. Tela de Admin (`src/pages/AdminPage.tsx`)
- Antes de chamar o delete, consultar a contagem de palpites da partida.
- Se houver palpites: bloquear a ação e exibir um toast de erro claro, ex.: *"Não é possível excluir: esta partida já possui X palpite(s)."*
- Se não houver palpites: seguir com a exclusão normalmente (mantendo a confirmação atual).
- Tratar também o erro vindo do banco (caso a checagem prévia falhe por concorrência), traduzindo a mensagem do Postgres em algo amigável.

## Comportamento resultante

- Partida sem palpites → exclusão funciona como hoje.
- Partida com 1+ palpites → exclusão é bloqueada na UI e no banco. Admin precisaria primeiro remover os palpites manualmente (fora do fluxo atual) para poder excluir a partida.
