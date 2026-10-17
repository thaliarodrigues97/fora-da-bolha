# Validação com Supabase real

Use um projeto de teste e navegadores com identidades distintas.

- A e B de lados opostos recebem a mesma sala; C não entra nessa sala.
- A e B do mesmo lado esperam. O primeiro do lado oposto é pareado com quem chegou antes.
- Entradas simultâneas não criam duas salas ativas para a mesma identidade.
- Encerrar enquanto há pareamento deixa o usuário fora da fila e da sala.
- Uma terceira identidade não consegue ler mensagens, listar perfis alheios ou enviar na sala de A/B, inclusive via API direta.
- Envio direto nas tabelas e RPC sem autenticação são negados.
- Mensagens com HTML aparecem como texto; mensagens acima de 1.000 caracteres e envios em menos de 1 s são negados pelo servidor.
- Altere `expires_at` pelo SQL Editor para alguns segundos no futuro. Verifique o encerramento e a recusa de envio via RPC após o prazo. Recarregar não renova o prazo.
- Denunciar grava a denúncia, encerra a sala e impede novo pareamento das duas identidades.
- Fila sem heartbeat é removida em uma chamada posterior após 25 s.
- Ajuste temporariamente o limite de salas para 1 e confirme espera por capacidade; restaure 80 após o teste.
- Desconecte e reconecte a rede: mensagens enviadas pelo outro participante aparecem sem duplicação após sincronização.
- Confirme entrega Realtime e regras RLS no projeto, comportamento em celular e quotas no painel.
