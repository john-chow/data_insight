# --*-- coding: utf-8 --*--
'''
本文件是用SqlAlchemy实现用Factor对象到数据库操作的转换过程
SqlExecutor实现用SqlAlchemy代理数据库操作的接口
Convertor实现由数据库及数据表到SqlAlchemy对象的映射模型
SqlExecutor和Convertor是聚合关系
'''


import sys

from sqlalchemy import create_engine, inspect, Table, MetaData, types, \
                        func, select, extract, Column, engine
from sqlalchemy.sql.functions import current_date
from sqlalchemy import *

from widget.models import ExternalDbModel
from widget.factor import Factor, OneValue, SeriesValue, RangeValue, TimeValue
from common.log import logger
from common.head import ConnNamedtuple
from common.tool import logExcInfo
import common.protocol as Protocol

import pdb


class SqlExecutorMgr(): 
    HK_ST_MAP   = {}

    @classmethod
    def stRestore(cls, hk):
        if not hk:
            return None

        if hk in cls.HK_ST_MAP:
            st = cls.HK_ST_MAP.get(hk)
        else:
            st = SqlExecutor(hk)

        return st

    @classmethod
    def stStore(cls, hk, st):
        cls.HK_ST_MAP[hk] = st

    @staticmethod
    def stCreate():
        st = SqlExecutor()
        return st



'''
实现由外部输入Factor对象转换为Sql过程
'''
class SqlExecutor():
    def __init__(self, hk = None):
        self.cnt = ''
        self.engine = {}
        self.conn = None
        self.insp = None
        self.rf = {}     

        # 聚合Convertor，用来存储和实现
        self.storage = Storage()
        self.sql_relation = Convertor(self.storage)

        if hk:
            self.restore(hk)


    def updateStatus(self):
        """
        激活对象
        """
        if not (self.engine and self.conn and self.insp):
            try:
                self.engine     = create_engine(self.cnt, echo=True)
                self.conn       = self.engine.connect()
                self.insp       = inspect(self.engine)
            except Exception, e:
                return False

            self.broadcast()

        return self


    def broadcast(self):
        self.storage.observe(self.engine)


    def restore(self, hk):
        '''
        恢复连接
        '''
        try:
            logger.info('restore hk = {0}'.format(hk))
            externaldb = ExternalDbModel.objects.get(pk = hk)
        except ExternalDbModel.DoesNotExist:
            raise Exception(u'can''t resotre')
        else:
            conn_nt = ConnNamedtuple( \
                ip = externaldb.m_ip, port = externaldb.m_port, \
                kind = externaldb.m_kind, db = externaldb.m_db, \
                user = externaldb.m_user, pwd = externaldb.m_pwd \
            )
            self.connDb(conn_nt)

        return self


    def connDb(self, conn_nt):
        """
        连接数据库
        """
        cnt = '{kind}://{user}:{pwd}@{host}:{port}/{db}'.format(   \
            kind = conn_nt.kind, user = conn_nt.user, pwd = conn_nt.pwd, \
            host = conn_nt.ip, port = conn_nt.port, db = conn_nt.db   \
        )

        self.cnt    = cnt
        if self.updateStatus():
            return True, ''
        else:
            return False, ''


    def listTables(self):
        """
        列出数据库中所有表的名字
        """
        tables  = self.insp.get_table_names()
        return tables


    def getTablesInfo(self, tables):
        '''
        获取某数据表中全部列的分类情况
        '''
        tables_info_list = []
        for t in tables:
            if t not in self.rf.keys():
                self.getStorage().reflect(t)

            info = self.insp.get_columns(t)
            dm_list, me_list, tm_list   = [], [], []
            for i in info:
                i_type    = i['type']

                # 增加字段标记数字列和非数字列
                if isinstance(i_type, (types.Numeric, types.Integer)):
                    me_list.append(i['name'])
                elif isinstance(i_type, (types.Date, types.DateTime)):
                    tm_list.append(i['name'])
                else:
                    dm_list.append(i['name'])

            tables_info_list.append({
                'name':    t
                , 'dm':    dm_list
                , 'tm':    tm_list
                , 'me':    me_list
            })

        return tables_info_list


    def statFieldsType(self, tablename):
        if tablename not in self.rf.keys():
            self.storage.reflect(tablename)

        info = self.insp.get_columns(tablename)
        fields_types = {}
        for item in info:
            fieldtype    = item['type']
            fieldname    = item['name']

            # 增加字段标记数字列和非数字列
            if isinstance(fieldtype, (types.Numeric, types.Integer)):
                fields_types[fieldname] = Protocol.NumericType
            elif isinstance(fieldtype, (types.Date, types.DateTime)):
                fields_types[fieldname] = Protocol.TimeType
            else:
                fields_types[fieldname] = Protocol.FactorType

        return fields_types


    def createTable(self, name, *cols):
        """
        新建数据表
        """
        metadata = MetaData()
        t = Table(name, metadata, *cols)
        metadata.create_all(self.engine)
        self.getStorage().register(name, t)
        return t


    def dropTable(cls, name):
        """
        删除数据表
        """
        pass

    def execute(self, sql_obj):
        """
        执行sql对象
        """
        return self.conn.execute(sql_obj)

    def getSwither(self):
        return self.sql_relation

    def getStorage(self):
        return self.storage


'''
实现数据库对象到SqlAlchemy对象的映射
'''
class Convertor():
    def __init__(self, storage):
        self.storage = storage

    def makeSelectSql(self, selects, filters = [], groups = [], **kwargs):
        '''
        制作select形式的sql语句
        '''
        if not selects or len(selects) <= 0:
            raise Exception('no selected content')

        select_part = self.cvtSelect(selects)
        sql_obj = select(select_part)

        if filters:
            where_part = self.cvtWhere(filters)
            sql_obj = sql_obj.where(where_part)

        if groups:
            group_part = self.cvtGroup(groups)
            sql_obj = sql_obj.group_by(*group_part)

        if kwargs.get('distinct'):
            sql_obj = sql_obj.distinct()

        logger.info(sql_obj.compile(compile_kwargs={"literal_binds": True}))
        return sql_obj


    def cvtFactor(self, factor):
        if not isinstance(factor, Factor):
            pass

        tablename, colname, kind, funcname = factor.extract()
        table = self.storage.getTable(tablename)
        if not table.c.has_key(colname):
            msg = 'can''t recongnize column name of {0}'.format(colname)
            logger.error(msg)
            raise Exception(msg)

        obj = table.c.get(colname)

        if Protocol.TimeType == kind:
            obj = self.cvtTimeField(obj, funcname)
        elif Protocol.NumericType == kind and Protocol.NoneFunc != funcname:
            f = self.cvtFunc(funcname)
            obj = f(obj)

        return obj


    def cvtClause(self, clause):
        lfactor, rfactor = clause.getLeft(), clause.getRight()
        if isinstance(rfactor, OneValue):
            lexpr = self.cvtFactor(lfactor)
            rexpr = rfactor.value
            return lexpr > rexpr
        elif isinstance(rfactor, RangeValue):
            lexpr = self.cvtFactor(lfactor)
            low, high = rfactor.low, rfactor.high
            return between(lexpr, low, high)
        elif isinstance(rfactor, SeriesValue):
            lexpr = self.cvtFactor(lfactor)
            values = rfactor.values
            return lexpr.in_(values)
        elif isinstance(rfactor, TimeValue):
            unit, number = rfactor.unit, rfactor.number
            return self.cvtLastPeriod(lfactor, unit, number)
        else:
            pass


    def cvtWhere(self, clauses):
        units = [self.cvtClause(item) for item in clauses]
        expr = and_(*units) if len(units) > 1 else units[0]
        return expr


    def cvtSelect(self, selects):
        '''
        转换sql语句中select后字段part
        '''
        return [self.cvtFactor(factor) for factor in selects]


    def cvtGroup(self, groups):
        '''
        转换sql语句中group by后字段part
        '''
        return [self.cvtFactor(factor) for factor in groups]

    
    def cvtOrderBy(self):
        '''
        转换sql语句中order by后字段part
        '''
        pass


    def cvtFunc(self, funcname):
        if 'sum'   == funcname:
            f   = func.sum
        elif 'count'   == funcname:
            f   = func.count
        elif 'avg' == funcname:
            f   = func.avg
        elif 'max'    == funcname:
            f   =   func.max
        elif 'min'    == funcname:
            f   =   func.min
        else:
            logger.err('unknow func str, {0}', funcname)
            return False

        return f


    def cvtJoin(self, joins):
        kind = joins.get(Protocol.Join.Kind)
        relations = joins.get(Protocol.Join.Related)

        if not kind:
            return None
        if not relations or len(relations) < 1:
            return None

        for idx, item in enumerate(relations):
            left_tname = item.get(Protocol.Join.Left.Table)
            right_tname = item.get(Protocol.Join.Right.Table)
            left_cname = item.get(Protocol.Join.Left.Attr)
            right_cname = item.get(Protocol.Join.Right.Attr)

            left_table = self.storage.getTable(left_tname)
            right_table = self.storage.getTable(right_tname)
            left_column = getattr(left_table.c, left_cname)
            right_column = getattr(right_table.c, right_cname)

            myjoin = left_table.join(right_table, left_column = right_column)

        return myjoin


    def cvtTimeField(self, obj, time_type):
        if 'year'       == time_type:
            tc  =   extract('year', obj)
        elif 'month'    == time_type:
            tc  =   extract('month', obj)
        elif 'day'      == time_type:
            tc  =   extract('day', obj)
        elif 'hour'     == time_type:
            tc  =   extract('hour', obj)
        else:
            logger.warning(sys.exc_info())
            tc = obj

        return tc


    def cvtLastPeriod(self, factor, unit, length):
        obj = self.cvtFactor(factor)
        if 'year' == unit:
            year_obj = self.cvtTimeField(obj, 'year')
            return (year_obj > extract('year', current_date(type_ = types.Date)) - length)
        elif 'month' == unit:
            year_obj = self.cvtTimeField(obj, 'year')
            month_obj = self.cvtTimeField(obj, 'month')
            year_dist, month_dist = length / 12, length % 12

            return and_( \
                year_obj >= (extract('year', current_date(type_ = types.Date)) - year_dist - 1) \
                , month_obj > ((extract('month', current_date(type_ = types.Date)) - month_dist + 12) % 12) \
            )

        elif 'day' == unit:
            pass
        else:
            pass



# 仓储类，用来记录被保存的数据表
class Storage():
    def __init__(self):
        self.rf = {}

    def observe(self, engine):
        self.engine = engine

    def reflect(self, name):
        """
        建立sa的对象与实际表的映射关系
        """
        meta    = MetaData()

        # 建立过映射关系的不需要再建
        if name in self.rf.keys():
            return

        try:
            obj = Table(name, meta, autoload = True, autoload_with = self.engine)
        except Exception, e:
            logExcInfo()
            raise Exception(u'No such table, name = {0}'.format(name))
        else:
            self.register(name, obj)


    def register(self, name, table):
        self.rf[name] = table


    def unregister(self, name):
        if name in self.rf.keys():
            del self.rf[name]


    def getTable(self, name):
        if name not in self.rf:
            self.reflect(name)

        table = self.rf.get(name)
        return table


    def getColumn(self, factor):
        """
        根据数据表名和列名获取列对象
        """
        tablename, columnname = map(lambda x: factor.get(x), \
                                    Protocol.Table, Protocol.Attr)
        table = self.getTable(tablename)
        if not table:
            return None
        if not table.c.has_key(columnname):
            msg = u'can''t recongnize column name of {0}'.format(c_str)
            logger.error(msg)
            return None
        column = table.c.get(columnname)
        return column


"""
支持外界拿sql_obj进行相应查询类
"""
class SqlObjReader():
    @classmethod
    def cvtType(cls, type):
        if "int" == type:
            return Integer
        elif "big_int" == type:
            return BigInteger
        elif "float" == type:
            return Float
        elif "str" == type:
            return VARCHAR(30)
        elif "small_char" == type:
            return VARCHAR(20)
        elif "mid_char" == type:
            return VARCHAR(100)
        elif "huge_char" == type:
            return TEXT()
        elif "date" == type:
            return Date()
        elif "datetime" == type:
            return DateTime()

    @classmethod
    def defColumn(cls, name, type, **kwargs):
        """
        定义数据表的列
        """
        st_type = cls().cvtType(type)
        col     = Column(name, st_type)        
        return col 


    @classmethod
    def isDateTime(cls, obj):
        type = obj.type
        if isinstance(type, types.DateTime):
            return True
        return False


