## Objetivo

Os palpites de outros usuários devem ficar visíveis somente quando a janela para palpitar já tiver encerrado, ou seja, quando faltarem 5 minutos ou menos para o início da partida (mesma regra que já bloqueia inserir/editar palpites). Antes disso, cada usuário continua vendo apenas o próprio palpite.

## Alteração

### Banco de dados (regra de acesso à tabela `predictions`)

Substituir a regra atual "Authenticated see all predictions" (que libera tudo) por uma nova regra de leitura que permite ver palpites de outros usuários apenas se a partida estiver a 5 minutos ou menos do início (ou já tiver começado/terminado). O usuário continua sempre podendo ver os próprios palpites pela política já existente "Users see own predictions".

Em SQL, a condição equivale a:

```text
match_date <= now() + interval '5 minutes'
```

### Frontend

Nenhuma mudança. A página de detalhes da partida e os hooks já tentam buscar todos os palpites; o banco simplesmente devolverá apenas os que o usuário tem permissão de ver.

## Resultado

- Partida "Em Breve" com mais de 5 min para começar: cada um vê só o próprio palpite.
- Partida "Em Breve" a 5 min ou menos do início: todos os palpites ficam visíveis.
- Partida em andamento ou finalizada: todos os palpites visíveis (sem mudança).
