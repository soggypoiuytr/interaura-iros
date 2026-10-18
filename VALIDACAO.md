# Validação — 18/10/2026

Base: ZIP completo de 100.081.999 bytes fornecido pelo proprietário, extraído sem remover as mídias ou a lore. As 71 mídias são conferidas com o manifesto de hashes original do pacote. A senha narrativa foi restaurada conforme a decisão final da conversa anterior.

## Firebase real

Sala separada `validacao-1810`, com painel autenticado pelo proprietário e duas sessões independentes de participantes no navegador. O conteúdo de teste não foi colocado na sala padrão da partida.

- Login real do mestre e registro autorizado em `/masters/{uid}` confirmados.
- Conta anônima sem UID autorizado impedida de conceder permissão administrativa.
- Controlador exclusivo e botão de aquisição desabilitado para o segundo participante.
- Espectador entrando depois recebe a área de trabalho e o terminal atuais.
- Recusa de IIM libera novamente o campo de comando e aparece como resposta da unidade.
- Aprovação de conexão retorna identidade MOD-07, interface neural e aviso de interferência externa.
- Solicitação e aprovação de `OCULAR ACTIVATE` confirmadas.
- Cabo conectado gera ícone e anúncio; desconexão encerra a IIM.
- Mensagem personalizada e notificação recebidas no terminal.
- Bloqueio e revalidação pela condição do sistema confirmados.
- Histórico de comandos e aberturas recebido pelo painel.
- Liberação pelo mestre não é revertida pelo heartbeat anterior.
- Fechamento do controlador deixa o controle disponível; outro participante retoma a sessão sem reiniciar a narrativa.
- Resposta secreta `KRYTUX > EU AINDA ESTOU AQUI.` preservada.
- Eventos de som e arquivos de áudio observados no fluxo real do Firebase.

As falhas encontradas durante a validação foram corrigidas (campos indefinidos no snapshot, bootstrap após retomada e replay de formulários no espectador). A nova versão foi novamente conferida no navegador. A revisão final do console não apresentou novos erros.

## Automação

`npm test`: integridade das 71 mídias, caminhos e letras maiúsculas/minúsculas, sintaxe dos scripts, credencial e KRYTUX, preservação da árvore de regras SDAI, exclusividade de controle, prazo, autorização de ações administrativas e três clientes locais sem eco de eventos.

## Publicação

O workflow publica `site/` diretamente e executa os testes antes de enviar o artefato. Não usa as partes incompletas de `release/`. Nenhum serviço pago foi ativado. A validação pós-deploy deve confirmar o workflow e abrir as duas páginas públicas.
