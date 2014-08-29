#-*-coding: utf-8 -*-

'''
postgres数据库里面关于触发器的语句模板
'''

PSG_NEW_WARNING = \
    '''
    CREATE OR REPLACE FUNCTION {warnfunc}(ev_id Integer, result Float)
    RETURNS void AS $$
        import psycopg2 as pysql
        from datetime import datetime
        conn = pysql.connect( \
            'host=10.1.50.125 port=5432 dbname=mytableau user=postgres password=123456' \
        )
        cursor  = conn.cursor()
        cursor.execute( \
            'insert into warning (result, ifnotify, event_id) \
                values ({{r}}, False, {{v}})' \
                    .format(r = result, v = ev_id) \
        )
        conn.commit()
        conn.close()
    $$
    LANGUAGE plpythonu VOLATILE
    COST 100;
    ''' 


PSG_NEW_TRIGGER = \
    '''
    CREATE TRIGGER {triggername} AFTER INSERT OR DELETE OR UPDATE 
    ON {table} FOR EACH ROW 
    EXECUTE PROCEDURE {callbackfunc}();
    '''


PSG_NEW_TRIGGER_CALLBACK = \
    '''
    CREATE OR REPLACE FUNCTION {callbackfunc}()
    RETURNS TRIGGER AS $$
    DECLARE
    BEGIN
        IF ({left}{right}) THEN
            PERFORM {warnfunc}({evid}, {left});
        END IF;
        RETURN NULL;
    END;
    $$
    LANGUAGE plpgsql VOLATILE
    COST 100;
    '''


PSG_NEW_PRE_FUNCTION = \
    '''
    CREATE OR REPLACE FUNCTION {func}()
    RETURNS FLOAT AS $$
    BEGIN
        return ({sql});
    END;
    $$
    LANGUAGE plpgsql VOLATILE
    COST 100;
    '''


PSG_DROP_TRIGGER = \
    'DROP TRIGGER {triggername} ON {table} CASCADE;'

PSG_DROP_WARNING = \
    'DROP FUNCTION {warnfunc}(Integer, Float);'

PSG_DROP_TRIGGER_CALLBACK = \
    'DROP FUNCTION {callbackfunc}();'

PSG_DROP_PRE_FUNCTION = \
    'DROP FUNCTION {func}();'




