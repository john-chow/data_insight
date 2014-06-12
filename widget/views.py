# -*- coding: utf-8 -*-
# Create your views here.

from datetime import datetime
from collections import OrderedDict
import psycopg2 as pysql
import datetime as dt
import time
import pdb

from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.db import IntegrityError, DatabaseError
from django.template import RequestContext
from django.shortcuts import render_to_response, get_object_or_404
from django.utils import simplejson as json
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.http import Http404
from django.views.decorators.csrf import csrf_exempt

from widget.models import WidgetModel, ExternalDbModel
from widget.echart import EChartManager
from widget.forms import ConnDbForm
from common.tool import MyHttpJsonResponse
from common.log import logger


@login_required
def widgetList(request, template_name):
    """
    组件列表
    """
    if 'GET' == request.method:
        search = request.GET.get('search' , '')
        sort = request.GET.get('sort' , '-1')
        page = request.GET.get('page' , '1') 
        order = "m_create_time" if int(sort) == 1 else "-m_create_time"
        widgetList = WidgetModel.objects.filter(m_name__contains=search,m_status=True).order_by(order)
        context = RequestContext(request)
        data = {
            "widgetList": widgetList,
            "search": search,
            "sort": sort,
            "page": page,
            "allCount": len(widgetList)
        }
        return render_to_response(template_name, data, context)
    else:
        raise Http404()

@login_required
def widgetCreate(request):
    """
    组件创建
    """
    logger.debug("function widgetList() is called")

    if u'POST' == request.method:
        extent_data = json.loads(request.POST.get('data', '{}'))

        [table, x, y, color, size, graph, image, name] \
            = map(lambda arg: extent_data.get(arg, u''), \
                    ['table', 'x', 'y', 'color', 'size', 'graph', 'image', 'name'])

        db_conn_pk = request.session.get('db_pk')
        external_conn = ExternalDbModel.objects.get(pk = db_conn_pk)


        try:
            widget = WidgetModel.objects.create( 
                m_name='组件', m_table = table, m_x=x, m_y=y, \
                m_color = color, m_size = size, m_graph = graph, \
                m_external_db = external_conn, m_pic = image  \
            )
        except DatabaseError, e:
            logger.error(e[0])
            return MyHttpJsonResponse({u'succ': False   \
                                        , u'msg': u'无法保存到数据库'})
        return MyHttpJsonResponse({u'succ': True, u'wiId': widget.pk, \
                                    u'msg': u'保存成功'})
    else:
        context = RequestContext(request)
        dict = {}
        return render_to_response(u'add.html', dict, context)

@login_required
def widgetOp(request, op):
    """
    修改某个组件的发布状态
    组件删除
    """
    if u'POST' == request.method:
        id = request.POST.get('id')
        page = request.POST.get('page','')
        search = request.POST.get('search' , '')
        sort = request.POST.get('sort' , '-1')
        widget = WidgetModel.objects.get(pk = id)
        if (op == 'dis'):
            widget.m_is_distributed = not widget.m_is_distributed
        else:
            widget.m_status = False
        widget.save()
        return HttpResponseRedirect(u'/widget/?page='+page+"&search="+search+"&sort="+sort)
    else:
        raise Http404()
@login_required
def batachOp(request, op):
    """
    组件批量发布
    组件批量取消发布
    组件批量删除
    """
    if u'POST' == request.method:
        id_list = request.POST.get('list')
        arr = id_list.split(',')
        for id in arr:
            widget = WidgetModel.objects.get(pk=id)
            if(op == 'dis'):
                widget.m_is_distributed = True
            elif(op == 'undis'):
                widget.m_is_distributed = False
            else:
                widget.m_status = False
            widget.save()
        page = request.POST.get('page','')
        return HttpResponseRedirect(u'/widget/batch?page='+page)
    else:
        raise Http404()
@login_required
def widgetEdit(request, widget_id):
    """
    组件编辑
    """
    logger.debug("function widgetEdit() is called")

    if u'POST' == request.method:
        extent_data = json.loads(request.POST.get('data', '{}'))
        
        [x, y, color, size, graph, table, image] \
            = map(lambda arg: extent_data.get(arg, u''), \
                    ['x', 'y', 'color', 'size', 'graph', 'table', 'image'])
        logger.info("widget is %s".format(widget_id))

        try:
            WidgetModel.objects.filter(pk = widget_id) \
                                .update(m_x = x, m_y = y, m_color = color, \
                                        m_size = size, m_graph = graph, m_table = table, 
                                        m_pic = image)
        except Exception, e:
            return MyHttpJsonResponse({u'succ': False, u'msg': u'异常情况'})
        else:
            return MyHttpJsonResponse({u'succ': True, u'msg': u'修改成功'})

    else:
        context = RequestContext(request)

        widget_model = get_object_or_404(WidgetModel, pk = widget_id)
        request.session[u'widget_id'] = widget_id
        # 以后要去掉，没必要记在session里面
        request.session[u'tables'] = [widget_model.m_table]
        request.session[u'db_pk'] = widget_model.m_external_db.pk

        # 有没有直接把Model里面全部属性转换成dict的办法？ 
        extent_data = widget_model.getExtentDict()

        # 删掉空值的属性
        to_del_key = []
        for key in extent_data:
            if not extent_data[key]:
                to_del_key.append(key)

        for key in to_del_key:
            del extent_data[key]

        data = {u'id': widget_id
                , u'content': json.dumps(extent_data)}
        return render_to_response(u'add.html', data, context)


@require_http_methods(['GET'])
def widgetShow(request, widget_id):
    """ 
    获得该widget的图像数据
    """
    try:
        widget_model = WidgetModel.objects.select_related().get(pk = widget_id)
        extent_data = widget_model.getExtentDict()
        conn_arg = widget_model.m_external_db.getConnTuple()
    except WidgetModel.DoesNotExist:
        return HttpResponse({u'succ': False, u'msg': u'xxxxxxxxxxxx'})
    except ExternalDbModel.DoesNotExist:
        return HttpResponse({u'succ': False, u'msg': u'yyyyyyyyyyyy'})
    else:
        image_data = genWidgetImageData(extent_data, conn_arg)
        return MyHttpJsonResponse({u'succ': True, u'widget_id':widget_id, u'data': image_data})


def connectDb(request):
    """
    连接数据库
    """
    logger.debug("function connectDb() is called")

    if u'POST' == request.method:
        args_list = map(lambda x: request.POST.get(x, u'') \
                                , [u'ip', u'port', u'db', u'user', u'pwd'])

        if connDb(*tuple(args_list)):
            [ip, port, db, user, pwd] = args_list

            conn_model, created = ExternalDbModel.objects.get_or_create( \
                m_ip = ip, m_port = port, m_db = db, m_user = user, m_pwd = pwd \
            )

            # 把数据库连接信息放进session
            request.session[u'db_pk'] = conn_model.pk

            return HttpResponseRedirect(u'/widget/tables')
        else:
            err_dict = {u'succ': False, u'msg': u'无法连接数据库'}
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
        tables_list     = getTableList(request)

        # 注意传多个来怎么办
        unkonwn_tables = list(set(chosen_tables) - set(tables_list))

        if 0 == len(unkonwn_tables):
            request.session[u'tables']  =   chosen_tables
            logger.debug('redirect to widget/create')
            return HttpResponseRedirect(u'/widget/create')
        else:
            res_dict = {u'succ': False, u'msg': u'xxxxx'}
            return HttpResponse(res_dict, content_type='application/json')
    else:
        tables_list = getTableList(request)
        return MyHttpJsonResponse( {u'succ': True, \
                                    u'data': json.dumps(tables_list)} )


def getTableList(request):
    """
    获取数据表的列表
    """
    logger.debug("function getTableList() is called")

    conn    = findDbConn(request)
    if not conn:
        logger.debug('redirect to login')
        return HttpResponseRedirect(u'http://10.1.50.125:9000/')
    cursor          = conn.cursor()
    cursor.execute(u"SELECT table_name FROM information_schema.tables \
                                                WHERE table_schema='public'")
    results         = cursor.fetchall()
    table_list      = [ q[0] for q in results ]
    return table_list


def showDbForChosen(request):
    """
    显示选择的数据表
    """
    logger.debug("function showDbForChosen() is called")

    if 'POST' == request.method:
        form = ConnDbForm(request.POST)
        if form.is_valid():
            return HttpResponseRedirect('/widget/create')
    else:
        form = ConnDbForm

    data = {
        'form':             form
        , 'supported_dbs':  SUPPORTED_DBS
    }
    context = RequestContext(request)

    return render_to_response('widget/list.html', data, context)


def getTableInfo(request):
    """
    获取数据表信息
    """
    logger.debug("function getTableInfo() is called")

    conn  = findDbConn(request)
    if not conn:
        logger.debug('redirect to login')
        #return HttpResponseRedirect(u'http://10.1.50.125:9000/')
        return HttpResponseRedirect(reverse('widget.showDbForChosen'))
    cursor          = conn.cursor()

    tables = request.session.get(u'tables')
    data_list = []
    for t in tables:
        cursor.execute( \
            u"SELECT columns.column_name,columns.data_type \
            FROM information_schema.columns \
            WHERE columns.table_schema = 'public' \
            AND columns.table_name = '{0}'".format(t) \
        )

        results             = cursor.fetchall()

        dm_list, me_list    = [], []
        for name, type in results:
            xxx_list = me_list if (u'int' in type \
                                    or u'double' in type \
                                    or u'real' in type \
                                    ) \
                                else dm_list
            #logger.info("type is {0}".format(type))
            xxx_list.append(name)

            data = {
                u'name':        t
                , u'dm':        dm_list
                , u'me':        me_list
            }

        data_list.append(data)

    res_dict = {u'succ': True, u'data': data_list}
    return MyHttpJsonResponse(res_dict)


def reqDrawData(request):
    """
    生成chart的数据
    """
    logger.debug("function reqDrawData() is called")

    if 'POST' == request.method:
        extent_data = json.loads(request.POST.get(u'data', u'{}'), 
                                    object_pairs_hook=OrderedDict)

        rsu = checkExtentData(extent_data)
        if not rsu[0]:
            return MyHttpJsonResponse({u'succ': False, u'msg': rsu[1]})

        try:
            db_pk = request.session[u'db_pk']
            conn_arg = ExternalDbModel.objects.get(pk = db_pk).getConnTuple()
            data = genWidgetImageData(extent_data, conn_arg)
        except Exception, e:
            logger.debug("catch Exception: %s" % e)
            error_dict = {u'succ': False, u'msg': str(e)}
            return MyHttpJsonResponse(error_dict)
        else:
            backData = {u'succ': True, u'data': data}
            return MyHttpJsonResponse(backData)
    else:
        return

def checkExtentData(extent_data):
    """
    检查各维度数据是否符合画图的标准
    """
    [x, y, color, size, graph] = \
            map(lambda i: extent_data.get(i, []), \
                    ['x', 'y', 'color', 'size', 'graph'] \
                )

    # 必须选择画某种图形
    if not graph:
        return (False, u'Please choose graph')

    x_len, y_len = map(lambda i: len(i) if isinstance(i, list) else 0,
                                    (x, y))

    """
    if x_len > 1:
        return (False, u'uuuuuuuuu')
    if y_len > 1:
        return (False, u'vvvvvvvvv')
    """

    # 这么写好像不行的吧
    def check_size_color_graph(i):
        if i != None and (not isinstance(i, str)):
            return (False, u'aaaaaaaa')
    map(check_size_color_graph, (color, size, graph))

    """
    if color != None and (not isinstance(color, str)):
        return (False, u'aaaaaaaaaaa')
    if size != None and (not isinstance(size, string)):
        return (False, u'bbbbbbbbbb')
    if not isinstance(graph, string):
        return (False, u'ccccccccc')
    """

    return (True, '')



def makeupFilterSql(filter_list):
    """
    根据筛选器生成对应的SQL
    """
    logger.debug("function makeupFilterSql() is called")

    if type(filter_list) != list \
        or 0 == len(filter_list):
        return u''

    sens = []
    for filter_dict in filter_list:
        property = filter_dict.get(u'property')
        calc     = filter_dict.get(u'calc', '')

        val_list = json.loads( filter_dict.get(u'val_list') )

        lll = []
        for x in val_list:
            x = x if type(x) == u'unicode' else unicode(x)  
            lll.append( property + u'=' + x ) 

        sens.append( u' or '.join(lll) ) 
    
    return u'where ' + u' and '.join(sens)



def genWidgetImageData(extent_data, conn_arg):
    """
    生成返回前端数据
    """
    logger.debug("function genWidgetImageData() is called")

    # 地图先特殊对待
    if 'china_map' == extent_data.get(u'graph') or \
            'world_map' == extent_data.get(u'graph'):
        data = formatData('', '', '', '', extent_data.get(u'graph'))
        return {u'type': 'map', u'data': data}

    shape_list, shape_in_use    = judgeWhichShapes(extent_data)
    shape_in_use                = extent_data.get(u'graph', u'bar')
    chart_data                  = getDrawData(extent_data, shape_in_use, conn_arg)

    return {u'type': shape_in_use, u'data': chart_data}


def getDrawData(extent_data, shape_in_use, conn_arg):
    """
    获取画图参数
    """
    logger.debug("function getDrawData() is called")

    # 先看请求里面分别有多少个文字类和数字类的属性
    msn_list, msu_list, group_list = calc_msu_msn_list(extent_data)

    # 从数据库中找出该图形要画得数据
    data_from_db = searchDataFromDb(extent_data, conn_arg, msu_list, msn_list, group_list)

    # 为echart格式化数据
    echart_data = formatData(data_from_db, msu_list, msn_list, group_list, shape_in_use)

    return echart_data

    


def calc_msu_msn_list(extent_data):
    """ 
    计算出 measure_list, mension_list
    这里每个List里面单元的构造是 (name, kind, cmd, x_y)
    name: 表示属性名字; 
    kind: 表示是文字列还是数字列，0表示
    cmd:  表示运算符号，'sum','avg'等等
    x_y:  表示属于哪个轴，值有x、y，还有'group'
    """
    logger.debug("function calc_msu_msn_list() is called")

    [col_kind_attr_list, row_kind_attr_list] = \
            map( lambda i: extent_data.get(i, []), \
                    (u'x', u'y') \
                ) 

    msn_list, msu_list = [], []

    len_col_attr_list = len(col_kind_attr_list)
    for idx, attr_kind_cmd in enumerate(col_kind_attr_list + row_kind_attr_list):
        attr_kind_cmd_tuple = tuple(map(lambda x: attr_kind_cmd[x], \
                                        [u'attr', u'kind', u'cmd']))

        col_row_flag = u'col' if idx < len_col_attr_list else u'row'
        tmp_attr_list = msn_list if u'rgl' == attr_kind_cmd_tuple[2] \
                                        else msu_list
        tmp_attr_list.append( attr_kind_cmd_tuple + (col_row_flag,) )

    # xxx
    group_list = []
    color_attr = extent_data.get( u'color', u'' )
    if color_attr:
        group_list.append( (color_attr, 2, u'', u'group') )


    return msn_list, msu_list, group_list
    


def searchDataFromDb(extent_data, conn_arg, msu_list, msn_list, group_list):
    """
    要保证select的顺序是 measure、mension、group
    """
    logger.debug("function searchDataFromDb() is called")

    [col_kind_attr_list, row_kind_attr_list] = \
            map( lambda i: extent_data.get(i, []), \
                    (u'x', u'y') \
                ) 


    # echart 最多支持 1*2 的属性
    col_len, row_len =  len(col_kind_attr_list), len(row_kind_attr_list) 

    filters_list    = json.loads( extent_data.get(u'filter', u'[]') )
    filter_sentence = makeupFilterSql(filters_list)


    # 处理 msu_list
    sel_str_list, group_str_list, combine_flag = [], [], False
    for (attr_name, kind, cmd, x_y) in msu_list:
        if 'sum' == cmd:
            sel_str_list.append('sum("{0}") "{0}"'.format(attr_name))
            combine_flag = True
        elif 'avg' == cmd:
            sel_str_list.append('avg("{0}") "{0}"'.format(attr_name))
            combine_flag = True
        else:
            sel_str_list.append('"{0}"'.format(attr_name))


    # 处理 msn_list
    for (attr_name, kind, cmd, x_y) in msn_list:
        if combine_flag:
            group_str_list.append('"{0}"'.format(attr_name))
        else:
            sel_str_list.append('"{0}"'.format(attr_name))

    # 处理 group_list
    group_str_list.extend([attr_name for (attr_name, _, _, __) in group_list])
    sel_str_list += group_str_list

    # 以第一个类目属性做group by参数，其他的全部做成where条件
    sql_template = u'select {attrs} from "{table}" {filter} {option}'
    table_name   = extent_data[u'table']

    group_str = u''
    if len(group_str_list) > 0 and combine_flag:
        group_str = 'group by ' + u','.join(group_str_list)

    sel_str = u', '.join(sel_str_list)
    sql     = sql_template.format(attrs=sel_str, table=table_name, \
                                    filter=filter_sentence, option=group_str)

    logger.info("sql is       {0}".format(sql))

    conn        = connDb(*conn_arg)
    cursor      = conn.cursor()
    cursor.execute(sql)
    data        = cursor.fetchall()
    
    return data


def judgeWhichShapes(extent_data):
    """
    判断生成图形的类型
    """
    shape_list = []
    
    return (shape_list, '')



def formatData(data_from_db, msu_list, msn_list, group_list, shape_in_use):
    """
    格式化数据
    """
    logger.debug("function formatData() is called")

    echart = EChartManager().get_echart(shape_in_use)
    return echart.makeData(data_from_db, msu_list, msn_list, group_list)


def findDbConn(request):
    """
    找到数据库连接对象
    """
    db_conn_pk      = request.session.get(u'db_pk', u'')
    db_conn_model   = ExternalDbModel.objects.get(pk = db_conn_pk)
    conn_arg        = db_conn_model.getConnTuple()
    return connDb(*conn_arg)


def connDb(ip, port, db, user, pwd):
    """
    连接数据库函数
    """
    ip      = ip if ip else u'127.0.0.1'
    port    = port if port else u'5432'

    conn_str = u'host={i} port={p} dbname={d} user={u} password={pw}'\
                    .format(i=ip, p=port, d=db, u=user, pw=pwd)

    try:
        conn = pysql.connect(conn_str)

    except Exception, e:
        return None
    else:
        return conn


    




