#-*-coding: utf-8 -*-
'''
本文件是用数据库触发器实现事件机制，所有触发器是事件的一种具体实现方式
故: 所有trigger继承model
'''
import time

from widget.factor import Factor
from connect.sqltool import PysqlAgentManager
from monitor.models import EventModel
from common.log import logger
import pdb

# 触发器名称前缀
TRIGGER_NAME_PREFIX = 'trigger'

# 触发器回调函数的名称前缀
TRIGGER_CALLBACK_PREFIX = 'callback'

# 向数据表中增加报警记录的函数名称前缀
ADD_WARNING_PREFIX = 'addwarning'


'''
触发器基类
'''
class TriggerBaseModel():
    def __init__(self, evModel):
        self.ev = evModel
        self.st = PysqlAgentManager.stRestore(self.ev.m_conn_db.m_hk)


'''
条件控制表达式基类
'''
class Condition():
    def __init__(self, lf, rf, operator):
        self.lf         = lf
        self.rf         = rf
        self.operator   = operator

    def __str__(self):
        '''
        用字符串表示
        '''
        pass

    def strLeft(self):
        pass

    def strRight(self):
        pass




class TriggerPsgModel(TriggerBaseModel):
    def __init__(self, evModel):
        TriggerBaseModel.__init__(self, evModel)
        self.condition = PsgCondition( \
            self.ev.getLRFactor('left'), \
            self.ev.getLRFactor('right'), \
            self.ev.m_operator \
        )

        self.addWarning_template = \
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

        self.callback_template = \
            '''
            CREATE OR REPLACE FUNCTION {callbackfunc}()
            RETURNS TRIGGER AS $$
            DECLARE
            BEGIN
                IF ({left}{oper}{right}) THEN
                    PERFORM {warnfunc}({evid}, {left});
                END IF;
                RETURN NULL;
            END;
            $$
            LANGUAGE plpgsql VOLATILE
            COST 100;
            '''

        self.aggreate_template = \
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

        self.trigger_template = \
            '''
            CREATE TRIGGER {triggername} AFTER INSERT OR DELETE OR UPDATE 
            ON {table} FOR EACH ROW 
            EXECUTE PROCEDURE {callbackfunc}();
            '''

        self.dropWarning_template = \
            'DROP FUNCTION {warnfunc}(Integer, Float);'

        self.drop_callback_template = \
            'DROP FUNCTION {callbackfunc}();'

        self.drop_trigger_template = \
            'DROP TRIGGER {triggername} ON {table} CASCADE;'

        self.drop_aggerate_template = \
            'DROP FUNCTION {func}();'


    def on(self):
        self.readyAggreFunc()
        left_str, operator, right_str = self.condition.extract()

        sql_trigger = self.trigger_template.format( \
            triggername = TRIGGER_NAME_PREFIX + str(self.ev.pk), \
            table = self.ev.m_table, \
            callbackfunc = TRIGGER_CALLBACK_PREFIX + str(self.ev.pk) \
        )
        sql_callback = self.callback_template.format( \
            evid = self.ev.pk, left = left_str, \
            oper = operator, right = right_str, \
            callbackfunc = TRIGGER_CALLBACK_PREFIX + str(self.ev.pk), \
            warnfunc = ADD_WARNING_PREFIX + str(self.ev.pk) \
        )
        sql_addWarning = self.addWarning_template.format( \
            warnfunc = ADD_WARNING_PREFIX + str(self.ev.pk) \
        )

        self.st.conn.execute(sql_addWarning)
        self.st.conn.execute(sql_callback)
        self.st.conn.execute(sql_trigger)


    def modify(self):
        '''
        由于postgres的trigger本身修改，只支持名字、owner之类
        故，修改操作变更为先删除后再新建
        '''
        self.remove()
        self.create()


    def off(self):
        sql_drop_callback = self.drop_callback_template.format( \
            callbackfunc = TRIGGER_CALLBACK_PREFIX + str(self.ev.pk) \
        )
        sql_drop_trigger = self.drop_trigger_template.format( \
            triggername = TRIGGER_NAME_PREFIX + str(self.ev.pk), \
            table = self.ev.m_table \
        )
        sql_dropWarning = self.dropWarning_template.format( \
            warnfunc = ADD_WARNING_PREFIX + str(self.ev.pk) \
        )
        self.st.conn.execute(sql_drop_trigger)
        self.st.conn.execute(sql_drop_callback)
        self.st.conn.execute(sql_dropWarning)
        self.stopAggreFunc()


    def readyAggreFunc(self):
        '''
        准备用来进行函数运算(sum)之类的函数
        '''
        if_func_left, str_left = self.condition.strLeft()
        if_func_right, str_right = self.condition.strRight()
        if if_func_right:
            sql = str(self.st.makeSelectSql(selects = [self.condition.rf]))
            aggreate_sql = self.aggreate_template.format(sql = sql, func = str_right)
            self.st.conn.execute(aggreate_sql)
            self.right_func = str_right
        if if_func_left:
            sql = str(self.st.makeSelectSql(selects = [self.condition.lf]))
            aggreate_sql = self.aggreate_template.format(sql = sql, func = str_left)
            self.st.conn.execute(aggreate_sql)
            self.left_func = str_left


    def stopAggreFunc(self):
        '''
        解除准备函数运算的函数
        '''
        if hasattr(self, 'left_func'):
            drop_left_aggreate_sql = \
                self.drop_aggerate_template.format(func = getattr(self, 'left_func'))
            self.st.conn.execute(drop_left_aggreate_sql)
            delattr(self, 'left_func')
        if hasattr(self, 'right_func'):
            drop_right_aggreate_sql = \
                self.drop_aggerate_template.format(func = getattr(self, 'right_func'))
            self.st.conn.execute(drop_right_aggreate_sql)
            delattr(self, 'right_func')
            

'''
Postgres里面关于是否记录触发器的条件类
'''
class PsgCondition(Condition):
    def __str__(self):
        left_str, operator, right_str = self.extract()
        return left_str + operator + right_str

    def extract(self):
        if_func_left, left_str = self.strLeft()
        if_func_right, right_str = self.strRight()
        left_str = (left_str + '()') if if_func_left else left_str
        right_str = (right_str + '()') if if_func_right else right_str
        return left_str, self.operator, right_str


    def strLeft(self):
        return self.strPart('left')

    def strRight(self):
        return self.strPart('right')

    def strPart(self, i):
        '''
        用来把条件表达式某部分转换成sql里的变量形式
        用来标记是哪部分
        '''
        part_factor = self.lf if 'left' == i else self.rf
        factor_var = part_factor.cvtToSqlVar()

        # 对于求全部行的，求新增行，或者常值型的，方法各不一样
        if 'NumericFactor' == part_factor.__class__.__name__:
            return False, factor_var
        elif 'ElementFactor' == part_factor.__class__.__name__ \
                and 'rgl' == part_factor.cmd:
            return False, 'TD["new"][factor_var]'
        else:
            # 定义一个sql函数去求得全部行的xx结果
            func_prex = 'left' if 'left' == i else 'right'
            return True, func_prex + str(int(time.time()))



class Orc():
    pass


class Msql():
    pass


