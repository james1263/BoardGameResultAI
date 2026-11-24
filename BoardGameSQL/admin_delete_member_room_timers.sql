-- admin_delete_member 加入清除 room_timers（2026-11-24）
-- 有這個人的計時器整列刪除：他在 order_user_ids、remaining 有他的 id，或 updated_by 是他。
-- 型別不變，create or replace 會保留原權限，不需要重新 revoke／grant。
CREATE OR REPLACE FUNCTION public.admin_delete_member(p_user uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  if p_user = auth.uid() then
    raise exception '不能刪除自己';
  end if;
  if exists (select 1 from public.admin_users where user_id = p_user) then
    raise exception '不能刪除管理者';
  end if;

  -- 新增：別人對這個人心得／留言按的讚
  delete from public.note_likes
   where note_id in (
     select id from public.game_notes where user_id = p_user
     union
     select id from public.gathering_notes where user_id = p_user
   );

  -- 新增：聚會房間計時器（有這個人的整列刪除）
  delete from public.room_timers
   where p_user::text = any (order_user_ids::text[])
      or remaining ? p_user::text
      or updated_by = p_user;

  delete from public.game_play_sessions where user_id = p_user;
  delete from public.game_ratings where user_id = p_user;
  delete from public.gathering_attendees where user_id = p_user;
  delete from public.loyalty_redemptions where user_id = p_user;
  delete from public.player_contacts where user_id = p_user;
  delete from public.user_game_status where user_id = p_user;
  delete from public.vip_members where user_id = p_user;
  delete from public.vip_attempts where user_id::text = p_user::text;

  delete from auth.users where id = p_user;
end;
$function$;
