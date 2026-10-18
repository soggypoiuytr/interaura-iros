# INTERAURA - IROS INT-JP-04

Terminal narrativo multiplayer da Interaura. O site público funciona no GitHub Pages; a posse do computador, as ações, o áudio, o terminal e as decisões do mestre são sincronizados pelo Firebase Realtime Database.

## Arquivos de publicação

A pasta `web/` é a versão pronta para hospedagem. O HTML principal foi separado dos arquivos de imagem e áudio porque a versão autônoma ultrapassa o limite de 100 MB por arquivo do GitHub.

- `web/index.html`: terminal dos jogadores e observadores.
- `web/master.html`: painel privado do mestre.
- `web/firebase-config.js`: configuração pública do Firebase.
- `web/database.rules.json`: regras do Realtime Database.
- `web/assets/`: imagens, ícones e sons.

## Firebase

1. Crie um projeto no Firebase.
2. Ative **Authentication > Anonymous** para jogadores e observadores.
3. Ative **Authentication > Email/Password** e crie a conta do mestre.
4. Crie um **Realtime Database**.
5. Copie a configuração do aplicativo Web para `web/firebase-config.js`.
6. Publique `web/database.rules.json` nas regras do Realtime Database.
7. No banco, crie `masters/UID_DO_MESTRE = true`, usando o UID da conta do mestre.

O painel não concede permissões administrativas apenas por conhecer sua URL: confirmações do cabo IIM, aprovações e mensagens customizadas exigem um UID listado em `masters`.

Sem Firebase configurado, o projeto entra automaticamente em modo local para teste entre abas do mesmo navegador, usando `BroadcastChannel` e `localStorage`.

## Fluxo da sessão

1. O primeiro jogador informa personagem e player e assume o controle.
2. Os demais entram como observadores; a interface fica somente leitura, mas ações e sons são reproduzidos.
3. O controlador liga o computador e autentica Ariella Chiyomi.
4. O mestre abre `master.html`, conecta virtualmente o cabo físico da IIM e recebe solicitações do terminal.
5. Ao confirmar o cabo, o ícone da cadeira surge na bandeja, pisca, mostra o balão e toca o som de conexão.
6. Sem cabo, qualquer comando `IIM` retorna `ERRO IIM-01`.
7. `IIM CONNECT MOD-07` e comandos de alteração como `OCULAR ACTIVATE` aguardam confirmação do painel.

## Credencial narrativa

- Usuária: `A.CHIYOMI`
- Senha: `SAUDADE-0317-88`

Essa credencial pertence à narrativa do site e não protege o painel do mestre. A segurança real do painel usa Firebase Authentication e as regras do banco.

## Comando oculto

`KRYTUX` consulta o Reator Aurítico Krytux e recebe uma resposta direta do núcleo inteligente.

## Reconstrução

Na raiz de desenvolvimento:

```bash
python3 rebuild_interaura.py
python3 export_interaura_web.py
```

O primeiro comando atualiza o HTML autônomo. O segundo recria a pasta `web/` pronta para GitHub Pages.

