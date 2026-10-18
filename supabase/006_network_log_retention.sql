-- Limpeza diária dos registros técnicos vencidos; não apaga mensagens.
create extension if not exists pg_cron;
select cron.schedule('fora-da-bolha-purge-network-logs','17 3 * * *',
 'select private.purge_expired_network_logs();');
select jobname,schedule,active from cron.job where jobname='fora-da-bolha-purge-network-logs';
