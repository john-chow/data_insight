#-*-coding: utf-8 -*-
'''
本文件是用数据库触发器实现事件机制，所有触发器是事件的一种具体实现方式
故: 所有trigger继承model
'''
import time

from widget.factor import FactorFactory
from connect.sqltool import SqlExecutorMgr
from monitor.models import EventModel
from monitor.template import *
from common.log import logger
from widget.factor import SeriesFactor, RangeFactor, TimeFactor
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
    def __init__(self, evModel, hk):
        self.ev = evModel
        self.st = SqlExecutorMgr.stRestore(hk)


class TriggerPsgModel(TriggerBaseModel):
    def __init__(self, evModel, hk):
        TriggerBaseModel.__init__(self, evModel, hk)

        lf_str, rf_str = self.ev.getFactors()
        lfactor, rfactor = map(lambda x: FactorFactory.restore(x), (lf_str, rf_str))

        self.condition = PsgCondition( \
            lfactor, rfactor, self.ev.m_operator \
        )

        self.addWarning_template    = PSG_NEW_WARNING
        self.callback_template      = PSG_NEW_TRIGGER_CALLBACK
        self.aggreate_template      = PSG_NEW_PRE_FUNCTION
        self.trigger_template       = PSG_NEW_TRIGGER
        self.dropWarning_template   = PSG_DROP_WARNING
        self.drop_callback_template = PSG_DROP_TRIGGER_CALLBACK 
        self.drop_trigger_template  = PSG_DROP_TRIGGER 
        self.drop_aggerate_template = PSG_DROP_PRE_FUNCTION


    def on(self):
        self.readyAggreFunc()
        left_str, operator, right_str = self.condition.express()

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
        self.off()
        self.on()


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
        all = self.condition.getAllExprs()
        logger.warning(all)
        [(if_func_left, lexpr), (if_func_right, rexpr)] = all

        if if_func_right:
            sql = str(self.st.getSwither().makeSelectSql(selects = [self.condition.rfactor]))
            aggreate_sql = self.aggreate_template.format(sql = sql, func = rexpr)
            self.st.conn.execute(aggreate_sql)
            setattr(self, 'rexpr', rexpr)
        if if_func_left:
            sql = str(self.st.getSwither().makeSelectSql(selects = [self.condition.lfactor]))
            aggreate_sql = self.aggreate_template.format(sql = sql, func = lexpr)
            self.st.conn.execute(aggreate_sql)
            setattr(self, 'lexpr', lexpr)


    def stopAggreFunc(self):
        '''
        解除准备函数运算的函数
        '''
        if hasattr(self, 'lexpr'):
            drop_left_aggreate_sql = \
                self.drop_aggerate_template.format(func = getattr(self, 'lexpr'))
            self.st.conn.execute(drop_left_aggreate_sql)
            delattr(self, 'lexpr')
        if hasattr(self, 'rexpr'):
            drop_right_aggreate_sql = \
                self.drop_aggerate_template.format(func = getattr(self, 'rexpr'))
            self.st.conn.execute(drop_right_aggreate_sql)
            delattr(self, 'rexpr')
            


'''
条件控制表达式基类
'''
class Condition():
    def __init__(self, lf, rf, operator):
        self.lfactor         = lf
        self.rfactor         = rf
        self.operator   = operator

    def __str__(self):
        '''
        用字符串表示
        '''
        pass



'''
Postgres里面关于是否记录触发器的条件类
'''
class PsgCondition(Condition):
    def express(self):
        if_func_left, lexpr = self.getExpr(self.lfactor)
        if_func_right, rexpr = self.getExpr(self.rfactor)
        lexpr = (lexpr + '()') if if_func_left else lexpr
        rexpr = (rexpr + '()') if if_func_right else rexpr
        return lexpr, self.operator, rexpr

    def getAllExprs(self):
        return [self.getExpr(x) for x in (self.lfactor, self.rfactor)]


    def getExpr(self, factor):
        '''
        用来把条件表达式某部分转换成sql里的变量形式
        用来标记是哪部分
        '''
        fragment = factor.mapIntoSql()

        # 对于求全部行的，求新增行，或者常值型的，方法各不一样
        if isinstance(factor, (SeriesFactor, RangeFactor)):
            return False, fragment
        elif 'ElementFactor' == factor.__class__.__name__ \
                and 'rgl' == factor.cmd:
            return False, 'TD["new"][fragment]'
        else:
            logger.info('factor type is {}'.format(type(factor)))
            # 定义一个sql函数去求得全部行的xx结果
            funcname = 'prefunc' + str(int(time.time()))
            return True, funcname



class Orc():
    pass


class Msql():
    pass


