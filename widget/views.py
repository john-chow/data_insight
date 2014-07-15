# -*- coding: utf-8 -*-
# Create your views here.

import os
from collections import OrderedDict
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
from widget.factor import ElementFactor, EXPRESS_FACTOR_KEYS_TUPLE
from connect.views import stRestore
from common.tool import MyHttpJsonResponse, logExcInfo
import common.protocol as Protocol
from common.log import logger

import pdb


@login_required
@require_http_methods(['GET'])
def widgetList(request, template_name):
    """
    组件列表
    """
    search = request.GET.get('search' , '')
    sort = request.GET.get('sort' , '-1')
    page = request.GET.get('page' , '1') 
    order = "m_create_time" if int(sort) == 1 else "-m_create_time"
    widgetList = WidgetModel.objects.filter(m_name__contains=search,m_status=True) \
                                                                    .order_by(order)
    context = RequestContext(request)
    data = {
        "widgetList": widgetList,
        "search": search,
        "sort": sort,
        "page": page,
        "allCount": len(widgetList)
    }
    return render_to_response(template_name, data, context)


@login_required
def widgetCreate(request):
    """
    组件创建
    """
    logger.debug("function widgetList() is called")

    if u'POST' == request.method:
        req_data = json.loads(request.POST.get('data', '{}'))

        [tables, x, y, color, size, graph, image, name] \
            = map(lambda arg: req_data.get(arg, u''), \
                    ['tables', 'x', 'y', 'color', 'size', 'graph', 'image', 'name'])

        try:
            tables = json.dumps(tables)
        except ValueError, e:
            return MyHttpJsonResponse({u'succ': False, u'msg': u'arguments error'})

        hk = request.session.get(u'hk')
        external_conn = ExternalDbModel.objects.get(pk = hk)

        try:
            widget = WidgetModel.objects.create( 
                m_name='组件', m_table = tables, m_x=x, m_y=y, \
                m_color = color, m_size = size, m_graph = graph, \
                m_external_db = external_conn, m_pic = image  \
            )
        except DatabaseError, e:
            logger.error(e[0])
            return MyHttpJsonResponse({u'succ': False   \
                                        , u'msg': u'无法保存到数据库'})
        else:
            saveStyleArgs(request, widget)

        return MyHttpJsonResponse({u'succ': True, u'wiId': widget.pk, \
                                    u'msg': u'保存成功'})
    else:
        hk      = request.session.get(u'hk')
        st      = stRestore(hk)

        tables  = request.session.get('tables')

        context = RequestContext(request)
        dict = {u'content': json.dumps({u'tables': tables})}
        return render_to_response(u'add.html', dict, context)


def saveStyleArgs(request, widget_model = None):
    pass



@login_required
@require_http_methods(['POST'])
def widgetOp(request, op):
    """
    修改某个组件的发布状态
    组件删除
    """
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


@login_required
@require_http_methods(['POST'])
def batachOp(request, op):
    """
    组件批量发布
    组件批量取消发布
    组件批量删除
    """
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


@login_required
def widgetEdit(request, widget_id, template_name):
    """
    组件编辑
    """
    logger.debug("function widgetEdit() is called")

    if u'POST' == request.method:
        req_data = json.loads(request.POST.get('data', '{}'))
        
        [x, y, color, size, graph, tables, image] \
            = map(lambda arg: req_data.get(arg, u''), \
                    ['x', 'y', 'color', 'size', 'graph', 'tables', 'image'])

        try:
            tables = json.dumps(tables)
            WidgetModel.objects.filter(pk = widget_id) \
                                .update(m_x = x, m_y = y, m_color = color, \
                                        m_size = size, m_graph = graph, \
                                        m_table = tables, \
                                        m_pic = image)
        except ValueError, e:
            return MyHttpJsonResponse({u'succ': False, u'msg': u'arguments error'})
        except Exception, e:
            return MyHttpJsonResponse({u'succ': False, u'msg': u'异常情况'})
        else:
            return MyHttpJsonResponse({u'succ': True, u'msg': u'修改成功'})

    else:
        context = RequestContext(request)

        widget_model = get_object_or_404(WidgetModel, pk = widget_id)
        request.session[u'widget_id'] = widget_id

        # 有没有直接把Model里面全部属性转换成dict的办法？ 
        req_data = widget_model.getExtentDict()
        style_data  = widget_model.m_skin.getSkinDict() \
                                    if widget_model.m_skin else {}
        image_data  = dict(req_data, **style_data)

        # 删掉空值的属性
        to_del_key = []
        for key in req_data:
            if not req_data[key]:
                to_del_key.append(key)

        for key in to_del_key:
            del req_data[key]

        data = {u'id': widget_id
                , u'content': json.dumps(image_data)}
        return render_to_response(template_name, data, context)


@require_http_methods(['GET'])
def widgetShow(request, widget_id):
    """ 
    获得该widget的图像数据
    """
    try:
        widget_model    = WidgetModel.objects.select_related().get(pk = widget_id)
        req_data     = widget_model.getExtentDict()
        skin_id         = request.GET.get(u'skin_id')
    except WidgetModel.DoesNotExist:
        return HttpResponse({u'succ': False, u'msg': u'xxxxxxxxxxxx'})
    except ExternalDbModel.DoesNotExist:
        return HttpResponse({u'succ': False, u'msg': u'yyyyyyyyyyyy'})
    else:
        hk              = widget_model.m_external_db.m_hk
        st              = stRestore(hk)
        st.reflectTables(json.loads(widget_model.m_table))
        image_data      = genWidgetImageData(req_data, hk)
        style_data      = widget_model.m_skin.getSkinDict() \
                                        if widget_model.m_skin else {}
        image_data['style'] = style_data
        return MyHttpJsonResponse({u'succ': True, u'widget_id':widget_id, u'data': image_data})



@require_http_methods(['POST'])
def saveDrawAuxInfo(request):
    """
    保存组件图形的辅助信息，如名字，是否更新，皮肤
    """
    info_data = json.loads(request.POST.get('data'))
    wi_id, name, skin_id, update_info = map(lambda x: info_data.get(x), \
                                        ['id', 'name', 'skin_id', 'update_info'])
    if not wi_id:
        return MyHttpJsonResponse({'succ': False})

    if_update, update_period = True, update_info.period \
                                        if update_info else False, 0

    startWatchUpdate(wi_id)
    
    WidgetModel.objects.filter(pk = wi_id).update( \
        m_name = name, m_skin = skin_id, m_if_update = if_update, \
        m_update_period = update_period \
    )

    return MyHttpJsonResponse({'succ': True})


def startWatchUpdate(wi_id):
    """
    开始针对性进行监视更新情况
    """
    hk = request.session.get(u'hk')
    st = stRestore(hk)

    widget_model = WidgetModel.objects.get(pk = wi_id)
    req_data = widget_model.getExtentDict()
    origin_sql_obj = transReqDataToSqlObj(req_data, st)

    if 0:
        # 如果不是随时间更新，那么相当于重画，推送消息给前端让其去取新内容
        pass
    else:
        # 如果是随时间更新，那么既有可能取sum、avg之类，又有可能直接取新值
        if 0:
            pass
        else: 
            pass

    



@require_http_methods(['POST'])
def reqDrawData(request):
    """
    获取能画出chart的数据
    """
    logger.debug("function reqDrawData() is called")
    req_data = json.loads(request.POST.get(u'data', u'{}'), 
                                object_pairs_hook=OrderedDict)

    rsu = checkExtentData(req_data)
    if not rsu[0]:
        return MyHttpJsonResponse({u'succ': False, u'msg': rsu[1]})

    try:
        hk      = request.session[u'hk']
        data    = genWidgetImageData(req_data, hk)
    except Exception, e:
        logger.debug("catch Exception: %s" % e)
        logExcInfo()
        error_dict = {u'succ': False, u'msg': str(e)}
        return MyHttpJsonResponse(error_dict)
    else:
        backData = {u'succ': True, u'data': data}
        return MyHttpJsonResponse(backData)


@require_http_methods(['POST'])
def reqUpdateData(request):
    '''
    获取在已画出chart之后的更新数据
    '''
    pass


@require_http_methods(['POST'])
def reqTimelyData(request, wi_id):
    '''
    获取及时的新数据
    '''
    hk = request.session.get(u'hk')
    st = stRestore(hk)

    widget_model = WidgetModel.objects.get(pk = wi_id)
    if not widget_model.m_if_update:
        return MyHttpJsonResponse({'succ': False})

    req_data = widget_model.getExtentDict()
    # 找出时间对应列对象
    time_column_factor = findTimeColumnFromAxis(req_data)
    time_column_obj = st.sql_relation.getColumnObj(time_column_factor)
    origin_sql_obj = transReqDataToSqlObj(req_data, st)

    # 分查询条件里面，有没有聚合运算
    if widget_model.hasAggreate():
        sql_obj = select([]).over(f()).order_by()
        origin_sql_obj.over(f()).order_by(time_column_obj)
    else:
        sql_obj = origin_sql_obj.order_by(time_column_obj)

    results = st.execute(sql_obj).fetchone()
    return MyHttpJsonResponse({'succ': True, 'data': results})


def findTimeColumnFromAxis(req_data):
    pass


def checkExtentData(req_data):
    """
    检查各维度数据是否符合画图的标准
    """
    [x, y, color, size, graph] = \
            map(lambda i: req_data.get(i, []), \
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


def genWidgetImageData(req_data, hk):
    """
    生成返回前端数据
    """
    logger.debug("function genWidgetImageData() is called")
    st = stRestore(hk)

    # 地图先特殊对待
    if 'china_map' == req_data.get(u'graph') or \
            'world_map' == req_data.get(u'graph'):
        data = formatData('', '', '', '', req_data.get(u'graph'))
        return {u'type': 'map', u'data': data}

    shape_list, shape_in_use    = judgeWhichShapes(req_data)
    shape_in_use                = req_data.get(u'graph', u'bar')

    # 获取画出图形所必须相关数据
    msu_factor_list, msn_factor_list, group_factor_list = classifyFactors(req_data)
    sql_obj         = transReqDataToSqlObj(req_data, st)
    data_from_db    = st.conn.execute(sql_obj).fetchall()
    echart_data     = formatData(data_from_db, msu_factor_list, msn_factor_list, \
                                                    group_factor_list, shape_in_use)

    return {u'type': shape_in_use, u'data': echart_data}


def transReqDataToSqlObj(req_data, st):
    """
    获取画图参数
    """
    logger.debug("function transReqDataToSqlObj() is called")

    # 先看请求里面分别有多少个文字类和数字类的属性
    msn_factor_list, msu_factor_list, group_factor_list \
                                = classifyFactors(req_data)

    # 从数据库中找出该图形要画得数据
    factor_list = msu_factor_list + msn_factor_list

    sql_obj = st.makeSelectSql(**mapFactorToSqlPart(factor_list, group_factor_list))

    return sql_obj


def extractFactor(req_data):
    '''
    解析获得各维度上的Factor对象
    '''
    [col_kind_attr_list, row_kind_attr_list] = \
            map( lambda i: req_data.get(i, []), \
                    (u'x', u'y') \
                ) 


    # 获取轴上属性Factor对象
    axis_factor_list = []
    for idx, col_element in enumerate(col_kind_attr_list + row_kind_attr_list):
        element_dict = {key:col_element[key] for key in EXPRESS_FACTOR_KEYS_TUPLE}
        factor = ElementFactor(**element_dict)
        if idx < len(col_kind_attr_list):
            factor.setBelongToAxis('col')
        else:
            factor.setBelongToAxis('row')

        axis_factor_list.append(factor)


    # 获取选择器上属性Factor对象
    group_factor_list = []
    color_dict = req_data.get(Protocol.Color)
    if color_dict:
        color_attr_table = color_dict.get(u'table', u'')
        color_attr_column = color_dict.get('column', u'')
        color_dict = dict(zip(EXPRESS_FACTOR_KEYS_TUPLE, \
                                (color_attr_table, color_attr_column, -1, u'')))
        factor = ElementFactor(**color_dict)
        factor.setBelongToAxis('group')
        group_factor_list.append(factor)

    return axis_factor_list, group_factor_list



def classifyFactors(req_data):
    """ 
    计算出 measure_list, mension_list
    这里每个List里面单元的构造是 (name, kind, cmd, x_y)
    name: 表示属性名字; 
    kind: 表示是文字列还是数字列，0表示
    cmd:  表示运算符号，'sum','avg'等等
    x_y:  表示属于哪个轴，值有x、y，还有'group'
    """
    logger.debug("function classifyFactors() is called")

    axis_factor_list, group_factor_list = extractFactor(req_data)

    # 找到轴上文字列和时间列，其并集就是msn_factor_list

    msn_factor_list = [axis_factor for axis_factor in axis_factor_list \
                                if 'rgl' == axis_factor.getProperty('cmd') \
                                    or 2 == axis_factor.getProperty('kind')]
    msu_factor_list = [axis_factor for axis_factor in axis_factor_list \
                                if 'rgl' != axis_factor.getProperty('cmd') \
                                    and 0 == axis_factor.getProperty('kind')]

    return msn_factor_list, msu_factor_list, group_factor_list
    


def mapFactorToSqlPart(factor_list, group_list):
    """
    按照对所处select语句中的位置部分
    对所有x、y、group等部分的变量做分类
    """

    # 轴上面的数字列一定存在sql语句中select段
    # 轴上面的文字列一定存在sql语句中的select段和group段
    # 选择区别里面的数字列不存在sql语句中，它只是做值域范围设定用的
    # 选择区别里面的文字列存在sql语句中的select段和group段

    select_factors, group_factors  = [], []
    for factor in factor_list:
        kind    = factor.getProperty(Protocol.Kind)
        if 0 == kind:
            select_factors.append(factor)
        else:
            select_factors.append(factor)
            group_factors.append(factor)

    for factor in group_list:
        select_factors.append(factor)
        group_factors.append(factor)       

    return {
        'selects':          select_factors
        , 'groups':         group_factors
    }

    '''
    st  = stRestore(hk)
    sql_obj = st.makeSelectSql(selects = select_factors, groups = group_factors)
    resultes = st.conn.execute(sql_obj).fetchall()
    return resultes
    '''


def searchLatestData(hk, factor_list, group_list):
    """
    根据时间列，获取最新数据
    """
    select_factors, group_factors  = [], []
    for factor in factor_list:
        kind    = factor.getProperty(Protocol.Kind)
        if 0 == kind:
            select_factors.append(factor)
        elif 1 == kind:
            select_factors.append(factor)
            group_factors.append(factor)
        else:
            select_factors.append(factor)
            group_factors.append(factor)


    for factor in group_list:
        select_factors.append(factor)
        group_factors.append(factor)       

    st  = stRestore(hk)
    resultes = st.exeSelect(selects = select_factors, groups = group_factors) \
                    .fetchone()
    return resultes

    
    


def judgeWhichShapes(req_data):
    """
    判断生成图形的类型
    """
    shape_list = []
    
    return (shape_list, '')



def formatData(data_from_db, msu_factor_list, msn_factor_list, group_list, shape_in_use):
    """
    格式化数据
    """
    logger.debug("function formatData() is called")

    echart = EChartManager().get_echart(shape_in_use)
    return echart.makeData(data_from_db, msu_factor_list, msn_factor_list, group_list)



