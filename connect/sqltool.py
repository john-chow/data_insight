# --*-- coding: utf-8 --*--
'''
本文件是用SqlAlchemy实现用Factor对象到数据库操作的转换过程
PysqlAgent实现用SqlAlchemy代理数据库操作的接口
SqlRelation实现由数据库及数据表到SqlAlchemy对象的映射模型
PysqlAgent和SqlRelation是聚合关系
'''


import sys
from sqlalchemy import create_engine, inspect, Table, MetaData, types, \
                        func, select, extract, Column
from sqlalchemy import *

from widget.models import ExternalDbModel
from widget.factor import ElementFactor
from common.log import logger
import common.protocol as Protocol

import pdb


# 登陆数据库信息的hash key到PysqlAgent对象之间的映射表
HK_ST_MAP   = {}

def stRestore(hk):
    if not hk:
        return False

    st = HK_ST_MAP.get(hk)
    if not st:
        st = PysqlAgent().restore(hk)

    return st

def stStore(hk, st):
    HK_ST_MAP[hk] = st



'''
实现由外部输入Factor对象转换为Sql过程
'''
class PysqlAgent():
    cnt             = ''
    engine          = None
    conn            = None
    insp            = None

    def __init__(self, kwargs = None):
        if kwargs:
            self.connDb(**kwargs)

        # 聚合SqlRelation，用来存储和实现
        self.sql_relation = SqlRelation()


    def active(self):
        """
        激活对象
        """
        if not (self.engine and self.conn and self.insp):
            self.engine     = create_engine(self.cnt, echo=True)
            self.conn       = self.engine.connect()
            self.insp       = inspect(self.engine)
        return self


    def restore(self, hk):
        '''
        恢复连接
        '''
        try:
            logger.info('restore hk = {0}'.format(hk))
            externdb = ExternalDbModel.objects.get(pk = hk)
        except ExternalDbModel.DoesNotExist:
            raise Exception(u'can''t resotre')
        else:
            self.connDb(externdb.m_kind, externdb.m_ip, externdb.m_port, \
                externdb.m_db, externdb.m_user, externdb.m_pwd    \
            )

        return self


    def connDb(self, kind, ip, port, db, user, pwd):
        """
        连接数据库
        """
        if not kind:
            return False, u'database kind missing'
        if not db:
            return False, u'database name missing'

        ip      = ip if ip else u'127.0.0.1'
        port    = port if port else 5432

        cnt = u'{kind}://{user}:{pwd}@{host}:{port}/{db}'.format(   \
            kind = kind, user = user, pwd = pwd, host = ip, \
            port = port, db = db   \
        )

        self.cnt    = cnt
        self.active()
        return True, u''


    def listTables(self):
        """
        列出数据库中所有表的名字
        """
        tables  = self.insp.get_table_names()
        return tables


    def reflectTables(self, tables):
        """
        建立sa的对象与实际表的映射关系
        """
        meta    = MetaData()
        for name in tables:
            # 建立过映射关系的不需要再建
            if name in self.sql_relation.rf.keys():
                continue

            try:
                obj = Table(name, meta, autoload = True, autoload_with = self.engine)
            except exc.NoSuchTableError:
                raise Exception(u'No such table, name = {0}'.format(name))
            else:
                self.sql_relation.registerNewTable(name, obj)


    def getTablesInfo(self, tables):
        '''
        获取某数据表中全部列的分类情况
        '''
        tables_info_list = []
        for t in tables:
            if t not in self.sql_relation.rf.keys():
                self.reflectTables([t])

            info = self.insp.get_columns(t)
            dm_list, me_list, tm_list   = [], [], []
            for i in info:
                i_type    = i['type']

                # 增加字段标记数字列和非数字列
                if isinstance(i_type, (types.Numeric, types.Integer)):
                    me_list.append(i[u'name'])
                elif isinstance(i_type, (types.Date, types.DateTime)):
                    tm_list.append(i[u'name'])
                else:
                    dm_list.append(i[u'name'])

            tables_info_list.append({
                u'name':    t
                , u'dm':    dm_list
                , u'tm':    tm_list
                , u'me':    me_list
            })

        return tables_info_list


    def makeSelectSql(self, selects, filter = [], groups = [], **kwargs):
        '''
        制作select形式的sql语句
        '''
        if not selects or len(selects) <= 0:
            raise Exception(u'no selected content')

        select_part  = self.sql_relation.cvtSelect(selects)
        group_part  = self.sql_relation.cvtGroup(groups)

        sql_obj = select(select_part)
        if group_part:
            sql_obj = sql_obj.group_by(*group_part)

        logger.info(u'{0}'.format(str(sql_obj)))
        return sql_obj


    def createTable(self, name, *cols):
        """
        新建数据表
        """
        metadata = MetaData()
        t = Table(name, metadata, *cols)
        metadata.create_all(self.engine)
        self.sql_relation.registerNewTable(name, t)
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



'''
实现数据库对象到SqlAlchemy对象的映射
'''
class SqlRelation():
    rf              = {}

    def cvtSelect(self, selects):
        '''
        转换sql语句中select后字段part
        '''
        sel_list    = []
        for factor in selects:
            table           = self.getTableObj(factor)
            _t, c_str, kind, cmd = factor.extract()
            if not table.c.has_key(c_str):
                msg = u'can''t recongnize column name of {0}'.format(c_str)
                logger.error(msg)
                raise Exception(msg)

            sel_obj = table.c.get(c_str)

            if 2 == int(kind):
                sel_obj = self.cvtTimeColumn(sel_obj, cmd)
            elif 0 == int(kind) and u'rgl' != cmd:
                f       = self.cvtFunc(cmd)
                sel_obj = f(sel_obj)

            sel_list.append(sel_obj)

        return sel_list


    def cvtGroup(self, groups):
        '''
        转换sql语句中group by后字段part
        '''
        group_list  = []
        for factor in groups:
            table   = self.getTableObj(factor)
            c_str, kind_str, cmd_str  = map(lambda x: factor.getProperty(x), \
                                            [Protocol.Attr, Protocol.Kind, Protocol.Cmd])
            if not table.c.has_key(c_str):
                raise Exception(u'can''t recongnize column name of {0}' \
                                    .format(c_str))

            col_obj = table.c.get(c_str)

            if 2 == kind_str:
                # 如果是时间列，那么需要额外处理
                grp_obj = self.cvtTimeColumn(col_obj, cmd_str)
            else:
                grp_obj = col_obj


            group_list.append(grp_obj)

        if 0 < len(group_list):
            return tuple(group_list)
        else:
            return None

    
    def cvtOrderByPart(self):
        '''
        转换sql语句中order by后字段part
        '''
        pass

    def cvtJoin(self, joins):
        join_style  = joins[u'style']

        # 连接至少需要2个表
        if len(joins[u'data']) < 2:
            return None

        for idx, j_unit in enumerate(joins[u'data']):
            t_str, c_str = j_unit.get(u'table'), j_unit.get(u'column')
            table   = self.getTableObj(t_str)
            column  = getattr(table.c, c_str)

            if 0 == idx:
                my_join       = table
                prev_column     = getattr(table.c, c_str)
            else:
                my_join = my_join.join(table, prev_column == column)

        return my_join


    def cvtTimeColumn(self, col_obj, time_str):
        if 'year'       == time_str:
            tc  =   extract('year', col_obj)
        elif 'month'    == time_str:
            tc  =   extract('month', col_obj)
        elif 'day'      == time_str:
            tc  =   extract('day', col_obj)
        elif 'hour'     == time_str:
            tc  =   extract('hour', col_obj)
        elif 'raw'      == time_str:
            tc  =   col_obj    
        elif 'max' == time_str or 'min' == time_str:
            f  =   self.cvtFunc(time_str)
            tc  = f(col_obj)
        else:
            logger.error(sys.exc_info())
            raise Exception('unknown time type')

        return tc


    def cvtFunc(self, func_str):
        if u'sum'   == func_str:
            f   = func.sum
        elif u'count'   == func_str:
            f   = func.count
        elif u'avg' == func_str:
            f   = func.avg
        elif u'max'    == func_str:
            f   =   func.max
        elif u'min'    == func_str:
            f   =   func.min
        else:
            logger.err('unknow func str, {0}', func_str)
            return False

        return f


    def getColumnObj(self, factor):
        """
        根据数据表名和列名获取列对象
        """
        table = self.getTableObj(factor)

        '''
        if not table:
            return None
        '''

        c_str = factor.getProperty(Protocol.Attr)

        if not table.c.has_key(c_str):
            msg = u'can''t recongnize column name of {0}'.format(c_str)
            logger.error(msg)
            raise Exception(msg)

        column = table.c.get(c_str)
        return column


    def getTableObj(self, factor):
        t_str = factor.extract()[0]

        '''
        if t_str not in self.rf.keys():
            self.reflectTables([t_str])
        '''

        return self.rf.get(t_str)


    def registerNewTable(self, name, table):
        """
        增加新表后，登记记录
        """
        #table_helper = new TableHelper()
        #setattr(table, 'helper', table_helper)
        self.rf[name] = table



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


