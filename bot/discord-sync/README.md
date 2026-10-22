# IROS - fichas do Discord

Bot separado do site e do GitHub Pages. O fluxo é somente Discord → IROS. Lê os pontos restantes, os cinco atributos e o nível de experiência das mensagens. Não altera as fichas no Discord nem importa nomes, vida, concentração, inventário ou história. Quando explicitamente habilitado, também envia avisos de detecção e implementação Cryptum somente ao canal e à sala configurados.

## Primeiro: listar os canais

1. No Discord Developer Portal, crie a aplicação e o bot e adicione-o ao servidor `1065076970636980293`.
2. Para listar canais, dê somente **Ver canais** nas categorias necessárias. Para ler as fichas depois, adicione **Ler histórico de mensagens** nos canais de ficha e ative **Message Content Intent** no portal. Não é necessário Administrador nem Enviar mensagens.
3. Instale Node.js 22.12 ou superior. Dentro desta pasta, execute `npm install`.
4. Copie `.env.example` para `.env` e preencha `DISCORD_BOT_TOKEN` **somente no computador que executará o bot**. Não envie o token por chat, não coloque em `site/` e não faça commit. A listagem não precisa de credencial Firebase.
5. Execute `npm run channels`. A lista mostra nome, categoria e ID de cada canal visível. Uma cópia fica em `channel-inventory.local.json`, ignorada pelo Git. Canais privados invisíveis ao bot não aparecerão.
6. Confira a relação canal → módulo antes de habilitar a sincronização. MOD-07 já foi identificado pelo usuário; os demais canais foram identificados no servidor, e o vínculo de jander com MOD-42 foi confirmado pelo mestre.

## Sincronização

Copie `config.example.json` para `config.json` e adicione os canais da lista. Cada canal deve corresponder a um único módulo. Opcionalmente fixe `messageIds` (IDs das mensagens da ficha em ordem) e `authorIds` (autores autorizados). Ao fixar mensagens, o bot não precisa percorrer o histórico.

O parser aceita o formato da ficha enviada: `ATRIBUTOS`, `PONTOS DE ATRIBUTOS RESTANTES: 0`, `CORPO - Força e Vigor` e na linha seguinte `Valor: 0`, repetido para Mente, Reflexo, Influência e Energia. Também aceita o valor na mesma linha do atributo. Se um dos seis campos faltar ou estiver ambíguo, os atributos ficam indisponíveis no IROS; nenhum zero é inventado.

`npm start` inicia em **simulação** com `DRY_RUN=true`. Observa criação, edição e exclusão de mensagens e confere o histórico periodicamente para recuperar alterações após reconexão. Nenhuma gravação é feita no Firebase nesse modo.

Para gravar, configure `FIREBASE_DATABASE_URL`, uma credencial de serviço em `GOOGLE_APPLICATION_CREDENTIALS` fora de `site/` e `DRY_RUN=false`. O processo grava somente em `irosRooms/<sala>/state/settings/characterAttributes/<módulo>`. As regras atuais protegem `settings` contra escrita de jogadores; o servidor usa Firebase Admin. A credencial Admin tem privilégios de servidor e deve ficar fora do repositório e do site. Para hospedagem permanente, execute o bot em um serviço Node separado; GitHub Pages não executa bots.

O IIM usa os atributos sincronizados em novas consultas `STATUS`/`FICHA`, preservando o resto do diagnóstico narrativo. Respostas antigas continuam sendo registros da consulta que as gerou. Se o módulo ainda não tem vínculo com uma ficha, o comportamento atual permanece.

## Validação local sem credenciais

Na raiz do projeto: `node tests/discord-attributes.cjs`. Os testes não se conectam ao Discord ou Firebase e não enviam mensagens.

## Referências oficiais

- [Discord: Gateway e intents](https://docs.discord.com/developers/events/gateway)
- [Discord: mensagens e conteúdo](https://docs.discord.com/developers/resources/message)
- [Firebase Admin: configuração de servidor](https://firebase.google.com/docs/admin/setup)

## Nível e avisos de implementação

A leitura inclui `NÍVEL DE EXPERIÊNCIA`, apresentado no IIM como **NÍVEL DE ASSIMILAÇÃO**. O bot não altera o nível nem concede pontos. Campos ausentes permanecem não indexados.

`implementationNotices` no `config.json` pode conter `enabled`, `room` e `channelId`. O canal precisa permitir Ver canal e Enviar mensagens ao bot. A configuração local de teste acompanha somente `teste-firebase-2010` e envia para `#anotaçoes` em `-COMUNICAÇÃO INTERNA-`; o canal público não está habilitado.

Somente detecções de amostra e implementações concluídas após iniciar o bot geram avisos. Cada amostra assimilada registra 100 pontos compartilhados para progressão de nível, sem aumentar automaticamente os atributos ou o nível. Cada evento recebe um registro de envio no Firebase Admin e uma identificação estável no Discord para evitar duplicação. Reiniciar o bot não republica eventos antigos. A máquina que executa o bot precisa permanecer ligada para enviar avisos e ler atualizações. `--once` só atualiza os parâmetros e encerra, sem enviar avisos.
