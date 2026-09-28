-- Notificación por correo al dueño cuando entra un pedido nuevo.
-- Requiere haber desplegado la Edge Function "send-order-email" (ver
-- supabase/functions/send-order-email/index.ts) con los secretos
-- RESEND_API_KEY y WEBHOOK_SECRET configurados.
--
-- Antes de correr esto, reemplaza:
--   TU_PROJECT_REF   -> el REF de tu proyecto (Project Settings > API > Project URL)
--   TU_WEBHOOK_SECRET -> el mismo valor que pusiste como secreto WEBHOOK_SECRET
--
-- El correo de destino se toma de site_settings.email (el que configuras
-- en el panel admin, en Configuración > Correo de contacto).

create extension if not exists pg_net with schema extensions;

create or replace function notify_new_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_email text;
begin
  select email into v_owner_email from site_settings where id = true;

  if v_owner_email is not null and v_owner_email <> '' then
    perform net.http_post(
      url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/send-order-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-webhook-secret', 'TU_WEBHOOK_SECRET'
      ),
      body := jsonb_build_object('record', row_to_json(new), 'owner_email', v_owner_email)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists orders_notify_email on orders;
create trigger orders_notify_email
after insert on orders
for each row execute function notify_new_order();
