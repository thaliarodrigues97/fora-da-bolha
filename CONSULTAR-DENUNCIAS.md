# Conversas denunciadas

As mensagens já são persistidas em `public.messages`. O prazo de 30 minutos encerra o envio, mas não apaga o histórico. A consulta `supabase/CONVERSAS-DENUNCIADAS.sql` mostra somente salas que possuem denúncia.

O resultado inclui os dois apelidos, quem denunciou, quem foi denunciado, motivo, detalhes e cada mensagem em ordem, com autor, horário e identificador. Se a sala tiver várias denúncias, a mais recente é exibida junto da quantidade total. Uma sala denunciada sem mensagens ainda aparece.

A consulta é somente leitura e deve ser executada como administrador no SQL Editor. Não foi criada uma API pública nem concedido acesso de visitantes às conversas. Os critérios para avaliar uma denúncia e eventuais providências são humanos; a consulta não determina se houve ilegalidade.

O filtro não apaga conversas sem denúncia nem muda a política de retenção. O armazenamento atual continua descrito na página de privacidade. Para consultar uma sala denunciada específica, descomente o filtro pelo UUID no arquivo SQL.

Consulta privada salva e favoritada no SQL Editor: **Denúncias e conversas — Fora da Bolha**.

https://supabase.com/dashboard/project/byydyqkwcakkcuvynzna/sql/e66e1aa4-74cd-4e0e-92c5-2197ed760d1c

Apelidos das salas anteriores à captura histórica podem refletir o perfil disponível no momento do preenchimento; veja `origem_dos_apelidos`. O identificador do remetente ajuda a distinguir apelidos iguais, mas não verifica a identidade civil da pessoa.
