
declare
  v_shop public.shops%rowtype;
  v_issued_today bigint := 0;
  v_waiting_count bigint := 0;
  v_serving_count bigint := 0;
  v_on_hold_count bigint := 0;
  v_avg_service_min numeric;
  v_services jsonb := '[]'::jsonb;
  v_currently_serving jsonb := '[]'::jsonb;
begin
  if p_shop_id is null or p_shop_id <= 0 then
    raise exception using errcode = '22023', message = 'shop_id must be a positive integer';
  end if;

  select s.*
    into v_shop
    from public.shops as s
   where s.shopid = p_shop_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'Shop not found';
  end if;

  if not v_shop.isactive then
    raise exception using errcode = 'P0002', message = 'Shop is inactive';
  end if;

  select count(*)
    into v_issued_today
    from public.tokens as t
   where t.shop_id = p_shop_id
     and t.date = current_date;

  select
    count(*) filter (where upper(ts.status_name) = 'WAITING'),
    count(*) filter (where upper(ts.status_name) = 'SERVING'),
    count(*) filter (where upper(ts.status_name) = 'ON_HOLD')
    into v_waiting_count, v_serving_count, v_on_hold_count
    from public.tokens as t
    join public.token_status as ts on ts.status_id = t.status_id
   where t.shop_id = p_shop_id
     and t.date = current_date;

  select avg(extract(epoch from (t.complete_time - t.start_time)) / 60.0)
    into v_avg_service_min
    from public.tokens as t
    join public.token_status as ts on ts.status_id = t.status_id
   where t.shop_id = p_shop_id
     and upper(ts.status_name) = 'COMPLETED'
     and t.start_time is not null
     and t.complete_time is not null
     and t.complete_time >= t.start_time
     and t.complete_time >= now() - interval '30 days';

  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'serviceId', sv.service_id,
               'name', sv.service_name,
               'price', sv.price,
               'estimatedTimeMin', sv.estimated_time_min
             ) order by sv.service_name
           ),
           '[]'::jsonb
         )
    into v_services
    from public.services as sv
   where sv.shop_id = p_shop_id
     and sv.is_active;

  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'tokenNumber', t.token_str,
               'serviceName', sv.service_name,
               'startedAt', t.start_time,
               'estimatedDurationMin', coalesce(sv.estimated_time_min::numeric, v_avg_service_min),
               'elapsedMin', case
                 when t.start_time is null then null
                 else greatest(0, floor(extract(epoch from (now() - t.start_time)) / 60.0)::integer)
               end,
               'remainingMin', case
                 when t.start_time is null or coalesce(sv.estimated_time_min::numeric, v_avg_service_min) is null then null
                 else ceil(
                   greatest(
                     0::numeric,
                     coalesce(sv.estimated_time_min::numeric, v_avg_service_min) * 60
                     - greatest(0::numeric, extract(epoch from (now() - t.start_time))::numeric)
                   ) / 60
                 )::integer
               end,
               'expectedFinishAt', case
                 when t.start_time is null or coalesce(sv.estimated_time_min::numeric, v_avg_service_min) is null then null
                 else t.start_time + (coalesce(sv.estimated_time_min::double precision, v_avg_service_min::double precision) * interval '1 minute')
               end
             ) order by t.start_time nulls last, t.token_number
           ),
           '[]'::jsonb
         )
    into v_currently_serving
    from public.tokens as t
    join public.token_status as ts on ts.status_id = t.status_id
    left join public.services as sv on sv.service_id = t.service_id
   where t.shop_id = p_shop_id
     and t.date = current_date
     and upper(ts.status_name) = 'SERVING';

  return jsonb_build_object(
    'shop', jsonb_build_object(
      'shopId', v_shop.shopid,
      'name', v_shop.shopname,
      'description', v_shop.description,
      'address', v_shop.address,
      'city', v_shop.city,
      'state', v_shop.state,
      'pincode', v_shop.pincode,
      'phone', v_shop.phone,
      'email', v_shop.email,
      'image', v_shop.shopimage,
      'operatingHours', v_shop.operating_hours,
      'isActive', v_shop.isactive,
      'queueOpen', coalesce(v_shop.isqueueopen, false)
    ),
    'capacity', jsonb_build_object(
      'dailyMax', v_shop.maxdailytokens,
      'issuedToday', v_issued_today,
      'remainingToday', case
        when v_shop.maxdailytokens is null then null
        else greatest(0, v_shop.maxdailytokens::bigint - v_issued_today)
      end,
      'unlimited', v_shop.maxdailytokens is null,
      'atCapacity', case
        when v_shop.maxdailytokens is null then false
        else v_issued_today >= v_shop.maxdailytokens
      end
    ),
    'queue', jsonb_build_object(
      'waitingCount', v_waiting_count,
      'servingCount', v_serving_count,
      'onHoldCount', v_on_hold_count,
      'currentlyServing', v_currently_serving,
      'shopAverageServiceMinLast30Days', case
        when v_avg_service_min is null then null
        else round(v_avg_service_min, 1)
      end
    ),
    'services', v_services
  );
end;
