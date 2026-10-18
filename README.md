# INTERAURA — IROS INT-JP-04

Terminal narrativo preservado a partir de `interaura-iros-github.zip`, com 71 mídias verificadas por SHA-256. Publicação pelo GitHub Pages: a pasta `site/` contém o site completo; os pacotes antigos em `release/` são preservados, mas não participam do deploy.

## Endereços

- Jogadores: https://soggypoiuytr.github.io/interaura-iros/
- Mestre: https://soggypoiuytr.github.io/interaura-iros/master.html

## Firebase compartilhado com a SDAI

Projeto gratuito `aurality-94f7b`. A SDAI continua em `/rooms`; o IROS usa `/irosRooms/{sala}`. O arquivo `database.rules.json` inclui as regras originais da SDAI e as novas regras do IROS. A conta de mestre já autorizada pode registrar seu próprio UID em `/masters/{uid}: true` durante o login. Outras contas não podem conceder permissão a si mesmas.

A configuração pública fica em `site/firebase-config.js`. Não há senha administrativa no repositório. Cada aba recebe identidade própria e autenticação em memória. Controle exclusivo é adquirido por transação e renovado por heartbeat a cada 7 segundos; sem renovação, expira após 30 segundos. O mestre pode liberar o controle.

## Uso

Cada participante informa player e personagem. Um opera e os demais observam. Ao trocar de operador, a sessão é restaurada do snapshot compartilhado. A credencial narrativa é `A.CHIYOMI` / `SAUDADE-0317-88`; não é a senha real do mestre.

O painel permite confirmar o cabo da IIM, aprovar/recusar solicitações, enviar mensagens e notificações, alterar condições, suspender credenciais e programas, preparar respostas e consultar o histórico de comandos e pesquisas. `KRYTUX` permanece reservado à resposta original do reator.

A IIM inicia sem cabo. Somente depois da confirmação física pelo painel é possível solicitar `IIM CONNECT MOD-07`. A confirmação e a ativação ocular dependem da aprovação da unidade pelo painel. Para os jogadores, são respostas do sistema.

Use `?sala=CODIGO` nas duas páginas para outra sala. Sem o parâmetro, a sala é `int-jp-04`. O modo `?demo=1` é explícito e funciona somente entre abas do mesmo navegador. Falhas do Firebase não concedem acesso administrativo local automaticamente.

## Testes

`npm test` verifica integridade, caminhos e caixa dos nomes, sintaxe, preservação das regras da SDAI, autorização do IROS e concorrência em três clientes locais. Os testes de regras simulam expressões; não substituem o Firebase real. A validação no Firebase real está descrita em `VALIDACAO.md`.
