# --*-- coding: utf-8 --*--

from sqlalchemy import create_engine, inspect, Table, MetaData, types, func, select
from sqlalchemy import *

from widget.models import ExternalDbModel
from common.log import logger

import pdb

class SqlTool():
    """
    这是一个负责操作数据库的类
    """

    cnt             = ''
    engine          = None
    conn            = None
    insp            = None
    rf              = {}

    def __init__(self, kwargs = None):
        if kwargs:
            self.connDb(**kwargs)


    def __str__(self):
        str = u'sqltool:        {0}'
        if self.engine and self.engine.name:
            return str.format('unconn')
        else:
            return str.format(self.engine.name)


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
            if name in self.rf.keys():
                continue

            try:
                obj = Table(name, meta, autoload = True, autoload_with = self.engine)
            except exc.NoSuchTableError:
                raise Exception(u'No such table, name = {0}'.format(name))
            else:
                self.rf[name] = obj


    def getTablesInfo(self, tables):
        tables_info_list = []
        for t in tables:
            if t not in self.rf.keys():
                self.reflectTables([t])

            info = self.insp.get_columns(t)
            dm_list, me_list, tm_list   = [], [], []
            for i in info:
                i_type    = i[u'type']

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


    def exeSelect(self, selects, filter = [], groups = [], **kwargs):

        """
        执行查询语句
        """
        if not selects or len(selects) <= 0:
            raise Exception(u'no selected content')

        select_obj  = self.cvtSelect(selects)
        group_part  = self.cvtGroup(groups)

        sql_obj     = select_obj
        if group_part:
            sql_obj = sql_obj.group_by(*group_part)

        logger.info(u'{0}'.format(str(sql_obj)))
        results = self.conn.execute(sql_obj).fetchall()
        return results


    def cvtSelect(self, selects):
        sel_list    = []
        for s in selects:
            """
            if not (u'table' in s and u'col' in s):
                raise Exception(u'please check column and table error')

            t_str, c_str    = s[u'table'], s[u'column']
            """
            t_str, c_str    = s[0], s[1]
            table           = self.rf.get(t_str)

            if not table.c.has_key(c_str):
                raise Exception(u'can''t recongnize column name of {0}' \
                                    .format(c_str))

            sel_obj = table.c.get(c_str)

            cmd    = s[3]
            if cmd and u'rgl' != cmd:
                f       = self.cvtFunc(cmd)
                sel_obj = f(sel_obj)

            sel_list.append(sel_obj)

        return select(sel_list)



    def cvtFilter(self):
        pass


    def cvtJoin(self, joins):
        join_style  = joins[u'style']

        # 连接至少需要2个表
        if len(joins[u'data']) < 2:
            return None

        for idx, j_unit in enumerate(joins[u'data']):
            t_str, c_str = j_unit.get(u'table'), j_unit.get(u'column')
            table   = self.rf.get(t_str)
            column  = getattr(table.c, c_str)

            if 0 == idx:
                my_join       = table
                prev_column     = getattr(table.c, c_str)
            else:
                my_join = my_join.join(table, prev_column == column)

        return my_join




    def cvtGroup(self, groups):
        group_list  = []
        for g in groups:
            """
            if not (u'table' in g and u'column' in g):
                raise Exception(u'please check column and table error')

            t_str, c_str    = g[u'table'], g[u'col']
            """
            t_str, c_str    = g[0], g[1]
            table   = self.rf.get(t_str)

            if not table.c.has_key(c_str):
                raise Exception(u'can''t recongnize column name of {0}' \
                                    .format(c_str))

            grp_obj = table.c.get(c_str)
            group_list.append(grp_obj)

        if 0 < len(group_list):
            return tuple(group_list)
        else:
            return None



    def cvtFunc(self, func_str):
        if u'sum'   == func_str:
            f   = func.sum
        elif u'count'   == func_str:
            f   = func.count
        elif u'avg' == func_str:
            f   = func.avg
        else:
            return False

        return f


    def createTable(self, name):
        """
        新建数据表
        """
        pass

    def dropTable(self, name):
        """
        删除数据表
        """
        pass


