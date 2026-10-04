# con = psycopg2.connect(host="localhost", dbname="TASK", user="postgres", password="pgsql", port=5432)
import psycopg
from dotenv import load_dotenv
from Db_Initialization.create_query import create_user_table_query, create_shop_table_query
import os 

load_dotenv()

def create_all_tables():
    try:
        con = psycopg.connect(host=os.getenv("HOST"),dbname=os.getenv("postgres"),user=os.getenv("USER"),password=os.getenv("DB_PASSWORD"),port=os.getenv("PORT"))
        cur = con.cursor()
    except Exception as ex:
        print(ex.with_traceback())
    else:
        # create user table
        query = create_user_table_query()
        cur.execute(query)

        # create shop table
        query = create_shop_table_query()
        cur.execute(query)

        con.commit()
    finally:
        cur.close()
        con.close()
    
def insert_data_to_owners():
        try:
            con = psycopg.connect(host=os.getenv("HOST"),dbname=os.getenv("postgres"),user=os.getenv("USER"),password=os.getenv("DB_PASSWORD"),port=os.getenv("PORT"))
            cur = con.cursor()
        except Exception as ex:
            print(ex.with_traceback())
        else:
            query = "insert into owners (MaxShopCount,Backupid) values (101,NULL),(102,NULL),(103,NULL)"
            cur.execute(query)
            # print(cur.fetchone())
            con.commit()
        finally:
            cur.close()
            con.close()
# create_all_tables()
insert_data_to_owners()
