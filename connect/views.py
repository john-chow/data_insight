# -*- coding: utf-8 -*-
# Create your views here.

from __future__ import division
import os, re

from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import simplejson as json
from django.template import RequestContext
from django.shortcuts import render_to_response

from widget.forms import ConnDbForm
from widget.models import ExternalDbModel
from connect.sqltool import SqlTool, SqlToolAdapter
from common.tool import MyHttpJsonResponse
from common.log import logger
from common.head import DEFAULT_DB_INFO, REGEX_FOR_NUMBER, REGEX_FOR_DATE

import pdb


# 登陆数据库信息的hash key到SqlTool对象之间的映射表
HK_ST_MAP   = {}

def stCreate():
    return SqlTool()


def stRestore(hk):
    if not hk:
        return False

    st = HK_ST_MAP.get(hk)
    if not st:
        st = SqlTool().restore(hk)

    return st


def genConnHk(kind, ip, port, db, user, pwd):
    str = u'{kind}_{ip}_{port}_{db}_{user}_{pwd}'
    cnt = str.format(   \
        kind = kind, user = user, pwd = pwd, \
        ip = ip,   port = port, db = db   \
    )
    return hash(cnt)


def connectDb(request):
    """
    连接数据库
    """
    logger.debug("function connectDb() is called")

    if u'POST' == request.method:
        [ip, port, db, user, pwd, kind] \
                = map(lambda x: request.POST.get(x)  \
                        , [u'ip', u'port', u'db', u'user', u'pwd', u'kind'])

        st = stCreate()
        succ, msg = st.connDb( \
            kind = 'postgres', ip = ip, port = port, db = db, user = user, pwd = pwd \
        )

        if succ:
            kind    = u'postgres'
            hk  = genConnHk(ip = ip, port = port, db = db, user = user, pwd = pwd, kind = kind)
            HK_ST_MAP[hk] = st
            request.session[u'hk'] = hk

            ExternalDbModel.objects.get_or_create(pk = hk, \
                m_kind = kind, m_user = user, m_pwd = pwd, \
                m_ip = ip, m_port = port, m_db = db \
            )

            return HttpResponseRedirect(u'/connect/table')
        else:
            err_dict = {u'succ': False, u'msg': msg}
            return MyHttpJsonResponse(err_dict)

    else:
        f           = ConnDbForm()
        form_str    = f.as_p()
        res_dict    = {u'succ': True, u'data': form_str}
        return MyHttpJsonResponse(res_dict)


@csrf_exempt
def selectTables(request):
    """
    选择数据表
    """
    logger.debug("function selectTables() is called")

    if u'POST' == request.method:
        chosen_tables   = request.POST.getlist(u'table', u'[]')

        hk  = request.session.get(u'hk')
        st  = stRestore(hk)
        tables_list = st.listTables()

        # 注意传多个来怎么办
        unkonwn_tables = list(set(chosen_tables) - set(tables_list))

        if 0 == len(unkonwn_tables):
            request.session[u'tables']  =   chosen_tables
            st.reflectTables(chosen_tables)
            logger.debug('redirect to widget/create')
            return HttpResponseRedirect(u'/widget/create')
        else:
            res_dict = {u'succ': False, u'msg': u'xxxxx'}
            return HttpResponse(res_dict, content_type='application/json')
    else:
        hk  = request.session.get(u'hk')
        st  = stRestore(hk)
        tables_list = st.listTables()

        return MyHttpJsonResponse( {u'succ': True, \
                                    u'data': json.dumps(tables_list)} )



@require_http_methods(['GET'])
def getTableInfo(request):
    """
    获取数据表信息
    """
    logger.debug("function getTableInfo() is called")

    hk = request.session.get('hk')
    if not hk:
        return MyHttpJsonResponse(  \
            {u'succ': False, u'msg': u'Connect db first'}   \
        )

    try:
        st = stRestore(hk)
    except Exception, e:
        return MyHttpJsonResponse(  \
            {u'succ': False, u'msg': u'Connect db first'}   \
        )

    tables = json.loads(request.GET.get(u'tables'))
    tables_info_list = st.getTablesInfo(tables)

    res_dict = {u'succ': True, u'data': tables_info_list}
    return MyHttpJsonResponse(res_dict)


@login_required
def uploadFile(request):
    if 'POST' == request.method:
        f   = request.FILES['file']
        spliter  = request.POST.get('spliter')
        spliter  = ','
        st  = stCreate()
        st.connDb(**DEFAULT_DB_INFO)
        t = createTableAccdFile(f, spliter, st)
        copyFileContentsIntoTable(f, spliter, st, t)
        return MyHttpJsonResponse({'succ': True})
    else:
        context = RequestContext(request)
        return render_to_response('connect/upload.html', context)


def createTableAccdFile(f, spliter, st):
    """
    根据文件中数据创建数据表
    """
    table_name = f.name.split('.')[0]

    # 读取第一行，默认是表的字段名
    column_heads    = readColumnHead(f, spliter)
    column_types    = judgeColumnType(f, spliter)
    if len(column_heads) != len(column_types):
        raise Exception('xxxxxxxxxxxxx')

    # 根据用户指定的类型
    st_col_list = []
    for col, type in zip(column_heads, column_types):
        st_col = SqlToolAdapter().defColumn(col, type)
        st_col_list.append(st_col)

    t = st.createTable(table_name, *tuple(st_col_list))
    return t


def copyFileContentsIntoTable(f, spliter, st, t):
    """
    把文件中数据拷贝进入数据表
    """
    # 越过第一行列信息
    f.seek(0)
    f.readline()

    line = f.readline()
    while line:
        line_data       = [w.strip() for w in line.split(spliter)]
        ins = t.insert().values(tuple(line_data))
        try:
            st.conn.execute(ins)
        except Exception, e:
            pass
        finally:
            line = f.readline()


def readColumnHead(f, spliter = ','):
    pos = f.tell()
    f.seek(0)
    column_heads    = [w.strip() for w in f.readline().split(spliter)]
    f.seek(pos)
    return column_heads


def judgeColumnType(f, spliter = ','):
    """
    取每列头10条记录
    依次判断是否是时间型、数字型、字符串型
    已超过90%的为标注
    """

    # 越过列头信息
    f.seek(0)
    column_num = len(f.readline().split(spliter))

    test_data_mul_rows = []
    i = 0
    while(i < 10):
        column_data_one_row = [w.strip() for w in f.readline().split(spliter)]
        if (len(column_data_one_row)) < column_num:
            continue
        test_data_mul_rows.append(column_data_one_row)
        i += 1

    test_data_mul_cols = [[row[i] for row in test_data_mul_rows] \
                                    for i in range(column_num)]

    cols_types = []
    for test_data_one_col in test_data_mul_cols:
        col_type = judgeGroupType(test_data_one_col)
        cols_types.append(col_type)

    return cols_types


def judgeGroupType(data_list):
    total_num = len(data_list)
    time_count, int_count = 0, 0

    for data in data_list:
        # 检查是否是时间
        if re.match(REGEX_FOR_DATE, data):
            time_count  += 1
        # 检查是否是数值类型
        elif re.match(REGEX_FOR_NUMBER, data):
            int_count   += 1

    # 阀值为80%
    if time_count / total_num > 0.8:
        type = 'datetime'
    elif int_count / total_num > 0.8:
        type = 'float'
    else:
        type = 'str'

    return type
    



