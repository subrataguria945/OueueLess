

def insert_users_query(
    name,   
    email,
    phone,
    password_hash,
    google_id,
    profile_image,
    is_email_verified,
    is_active
):
    query = """
        CALL sp_insert_user(
            %s, %s, %s, %s, %s, %s, %s, %s,
            NULL, NULL, NULL
        );
    """

    params = (
        name,
        email,
        phone,
        password_hash,
        google_id,
        profile_image,
        is_email_verified,
        is_active
    )
    return query, params


def insert_user_data(conn,query, params):
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)

            result = cur.fetchone()

            if result:
                user_id, status_code, status_message = result
                print(result)
                print("User ID:", user_id)
                print("Status Code:", status_code)
                print("Message:", status_message)
                return result

        

    except Exception as e:
        conn.rollback()
        print("Error inserting user:", e)

    finally:
        conn.commit()
    

# CALL sp_insert_user(
#     'Kushal Jain',
#     'kushal@example.com',
#     '9876543210',
#     'hashed_password_here',
#     NULL,
#     NULL,
#     FALSE,
#     TRUE,
#     NULL,
#     NULL,
#     NULL
# );    