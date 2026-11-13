-- -- Drop previous procedure signatures if they exist
-- DROP PROCEDURE IF EXISTS public.sp_manage_password(integer, text, text, text, text);
-- DROP PROCEDURE IF EXISTS public.sp_manage_password(integer, text, text, text);

-- -- Clean Procedure without OTP logic
-- CREATE OR REPLACE PROCEDURE public.sp_manage_password(
--     IN p_user_id integer, 
--     IN p_action text, 
--     IN p_old_password text, 
--     IN p_new_password text, 
--     OUT p_status_code text, 
--     OUT p_status_message text
-- )
-- LANGUAGE plpgsql
-- AS $procedure$
-- DECLAREAND ownerid = p_owner_id
--     v_current_hash TEXT;
--     v_user_status BOOLEAN;
-- BEGIN
--     p_status_code := 'ERR';
--     p_status_message := 'Operation failed.';

--     -- 1. Validate user ID
--     IF p_user_id IS NULL OR p_user_id <= 0 THEN
--         p_status_code := 'ERR_INVALID_USER';
--         p_status_message := 'Invalid user ID.';
--         RETURN;
--     END IF;

--     -- 2. Validate action
--     IF UPPER(TRIM(COALESCE(p_action, ''))) NOT IN ('CHANGE', 'RESET') THEN
--         p_status_code := 'ERR_INVALID_ACTION';
--         p_status_message := 'Action must be CHANGE or RESET.';
--         RETURN;
--     END IF;

--     -- 3. Validate new password
--     IF p_new_password IS NULL
--        OR LENGTH(TRIM(p_new_password)) = 0 THEN
--         p_status_code := 'ERR_INVALID_PASSWORD';
--         p_status_message := 'New password is required.';
--         RETURN;
--     END IF;

--     -- 4. Lock user row to prevent concurrent password changes
--     SELECT passwordhash, status
--     INTO v_current_hash, v_user_status
--     FROM public.users
--     WHERE userid = p_user_id
--     FOR UPDATE;

--     IF NOT FOUND THEN
--         p_status_code := 'ERR_USER_NOT_FOUND';
--         p_status_message := 'User does not exist.';
--         RETURN;
--     END IF;

--     -- =========================================
--     -- CHANGE PASSWORD (Logged-in user)
--     -- =========================================
--     IF UPPER(TRIM(p_action)) = 'CHANGE' THEN

--         -- Only active users can change password
--         IF v_user_status IS DISTINCT FROM TRUE THEN
--             p_status_code := 'ERR_INACTIVE_USER';
--             p_status_message :=
--                 'Inactive users cannot change password. Use Forgot Password.';
--             RETURN;
--         END IF;

--         -- Old password is required
--         IF p_old_password IS NULL OR p_old_password = '' THEN
--             p_status_code := 'ERR_OLD_PASSWORD_REQUIRED';
--             p_status_message := 'Old password is required.';
--             RETURN;
--         END IF;

--         -- Verify old password
--         IF v_current_hash IS NULL
--            OR crypt(p_old_password, v_current_hash) <> v_current_hash THEN
--             p_status_code := 'ERR_WRONG_PASSWORD';
--             p_status_message := 'Old password is incorrect.';
--             RETURN;
--         END IF;

--         -- Update password
--         UPDATE public.users
--         SET passwordhash = crypt(p_new_password, gen_salt('bf')),
--             updatedat = CURRENT_TIMESTAMP
--         WHERE userid = p_user_id;

--         p_status_code := 'SUCCESS';
--         p_status_message := 'Password changed successfully.';

--         RETURN;
--     END IF;

--     -- =========================================
--     -- RESET PASSWORD (Token already verified in Backend)
--     -- =========================================
--     IF UPPER(TRIM(p_action)) = 'RESET' THEN

--         -- Directly update password
--         UPDATE public.users
--         SET passwordhash = crypt(p_new_password, gen_salt('bf')),
--             updatedat = CURRENT_TIMESTAMP
--         WHERE userid = p_user_id;

--         p_status_code := 'SUCCESS';
--         p_status_message := 'Password reset successfully.';

--         RETURN;
--     END IF;

-- EXCEPTION
--     WHEN OTHERS THEN
--         p_status_code := 'ERR_SYSTEM';
--         p_status_message := 'An unexpected database error occurred.';
-- END;
-- $procedure$;



CREATE OR REPLACE PROCEDURE public.sp_create_shop
(
    IN p_owner_id INTEGER,
    IN p_user_id INTEGER,
    IN p_shop_name VARCHAR,
    IN p_description VARCHAR,
    IN p_address VARCHAR,
    IN p_city VARCHAR,
    IN p_state VARCHAR,
    IN p_pincode VARCHAR,
    IN p_phone VARCHAR,
    IN p_email VARCHAR,
    IN p_shop_image VARCHAR,
    IN p_opening_time TIME,
    IN p_closing_time TIME,

    OUT p_shop_id INTEGER,
    OUT p_status_code INTEGER,
    OUT p_status_message VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN

    -- Initialize output parameters
    p_shop_id := NULL;
    p_status_code := 0;
    p_status_message := NULL;


    -- 1. Validate Owner ID
    IF p_owner_id IS NULL OR p_owner_id <= 0 THEN

        p_status_code := 0;
        p_status_message := 'Invalid Owner ID.';
        RETURN;

    END IF;


    -- 2. Check Owner Exists
    IF NOT EXISTS
    (
        SELECT 1
        FROM public.owners
        WHERE ownerid = p_owner_id
    ) THEN

        p_status_code := 0;
        p_status_message := 'Owner does not exist.';
        RETURN;

    END IF;


    -- 3. Validate User ID
    IF p_user_id IS NULL OR p_user_id <= 0 THEN

        p_status_code := 0;
        p_status_message := 'Invalid User ID.';
        RETURN;

    END IF;


    
-- 4. Check User Exists, Active and Belongs to Owner
IF NOT EXISTS
(
    SELECT 1
    FROM public.users
    WHERE userid = p_user_id
      AND status = TRUE
      AND ownerid = p_owner_id
      AND roleid = 2
) THEN

    p_status_code := 0;
    p_status_message := 'User is invalid, inactive, or does not belong to this owner.';
    RETURN;

END IF;



    -- 5. Validate Shop Name
    IF p_shop_name IS NULL OR TRIM(p_shop_name) = '' THEN

        p_status_code := 0;
        p_status_message := 'Shop name is required.';
        RETURN;

    END IF;


    -- 6. Validate Address
    IF p_address IS NULL OR TRIM(p_address) = '' THEN

        p_status_code := 0;
        p_status_message := 'Shop address is required.';
        RETURN;

    END IF;


    -- 7. Validate City
    IF p_city IS NULL OR TRIM(p_city) = '' THEN

        p_status_code := 0;
        p_status_message := 'City is required.';
        RETURN;

    END IF;


    -- 8. Insert New Shop
    INSERT INTO public.shops
    (
        ownerid,
        userid,
        shopname,
        description,
        address,
        city,
        state,
        pincode,
        phone,
        email,
        shopimage,
        openingtime,
        closingtime,
        isactive,
        createdat,
        updatedat
    )
    VALUES
    (
        p_owner_id,
        p_user_id,
        TRIM(p_shop_name),
        p_description,
        TRIM(p_address),
        TRIM(p_city),
        p_state,
        p_pincode,
        p_phone,
        p_email,
        p_shop_image,
        p_opening_time,
        p_closing_time,
        TRUE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING shopid INTO p_shop_id;


    -- 9. Success Response
    p_status_code := 1;
    p_status_message := 'Shop created successfully.';


EXCEPTION

    WHEN OTHERS THEN

        p_shop_id := NULL;
        p_status_code := -1;
        p_status_message := SQLERRM;

END;
$$;

