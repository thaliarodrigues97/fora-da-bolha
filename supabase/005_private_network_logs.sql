-- Registros técnicos privados de mensagens. Aplicar no projeto existente.
begin;
create schema if not exists private;
revoke all on schema private from public,anon,authenticated;
create table if not exists private.message_network_logs (
 message_id uuid primary key references public.messages(id) on delete cascade,
 room_id uuid not null references public.rooms(id),
 sender_id uuid not null references public.profiles(id),
 session_id uuid,
 received_at timestamptz not null,
 ip_address inet,
 ip_source text not null check(ip_source in ('supabase_cf_connecting_ip','unavailable')),
 preserve_until timestamptz,
 check ((ip_address is null)=(ip_source='unavailable'))
);
create index if not exists message_network_logs_room on private.message_network_logs(room_id,received_at);
create index if not exists message_network_logs_retention on private.message_network_logs(received_at);
alter table private.message_network_logs enable row level security;
revoke all on private.message_network_logs from public,anon,authenticated;

create or replace function private.capture_message_network()
returns trigger language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare headers jsonb; claims jsonb; client_ip inet; session_uuid uuid;
begin
 headers:=coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}'::jsonb);
 claims:=coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb);
 -- Somente o cabeçalho observado na borda do Supabase. Nunca usa IP do corpo
 -- da mensagem, nem escolhe o primeiro endereço de um X-Forwarded-For fornecido pelo cliente.
 begin
  client_ip:=nullif(headers->>'cf-connecting-ip','')::inet;
  if client_ip is not null and masklen(client_ip)<>(case family(client_ip) when 4 then 32 else 128 end) then client_ip:=null;end if;
 exception when invalid_text_representation then client_ip:=null;end;
 begin session_uuid:=nullif(claims->>'session_id','')::uuid;
 exception when invalid_text_representation then session_uuid:=null;end;
 insert into private.message_network_logs(message_id,room_id,sender_id,session_id,received_at,ip_address,ip_source)
 values(new.id,new.room_id,new.sender_id,session_uuid,new.created_at,client_ip,
  case when client_ip is null then 'unavailable' else 'supabase_cf_connecting_ip' end);
 return new;
end $$;
revoke all on function private.capture_message_network() from public,anon,authenticated;
create or replace trigger capture_message_network after insert on public.messages
for each row execute function private.capture_message_network();

create or replace function private.purge_expired_network_logs()
returns bigint language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare removed bigint;
begin
 delete from private.message_network_logs n
 where n.received_at<clock_timestamp()-interval '6 months'
 and (n.preserve_until is null or n.preserve_until<clock_timestamp());
 get diagnostics removed=row_count;
 return removed;
end $$;
revoke all on function private.purge_expired_network_logs() from public,anon,authenticated;
comment on table private.message_network_logs is 'IP observado na borda do Supabase no envio de cada mensagem. Não identifica por si só a pessoa física. Guarda padrão de seis meses; preservação até preserve_until definida pelo administrador.';
commit;
