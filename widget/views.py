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
from connect.views import stRestore
from common.tool import MyHttpJsonResponse, logExcInfo
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


@login_required
def widgetCreate(request):
    """
    组件创建
    """
    logger.debug("function widgetList() is called")

    if u'POST' == request.method:
        extent_data = json.loads(request.POST.get('data', '{}'))

        [tables, x, y, color, size, graph, image, name] \
            = map(lambda arg: extent_data.get(arg, u''), \
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
def widgetEdit(request, widget_id):
    """
    组件编辑
    """
    logger.debug("function widgetEdit() is called")

    if u'POST' == request.method:
        extent_data = json.loads(request.POST.get('data', '{}'))
        
        [x, y, color, size, graph, tables, image] \
            = map(lambda arg: extent_data.get(arg, u''), \
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
        extent_data = widget_model.getExtentDict()
        style_data  = widget_model.m_skin.getSkinDict() \
                                    if widget_model.m_skin else {}
        image_data  = dict(extent_data, **style_data)

        # 删掉空值的属性
        to_del_key = []
        for key in extent_data:
            if not extent_data[key]:
                to_del_key.append(key)

        for key in to_del_key:
            del extent_data[key]

        data = {u'id': widget_id
                , u'content': json.dumps(image_data)}
        return render_to_response(u'add.html', data, context)


@require_http_methods(['GET'])
def widgetShow(request, widget_id):
    """ 
    获得该widget的图像数据
    """
    try:
        widget_model    = WidgetModel.objects.select_related().get(pk = widget_id)
        extent_data     = widget_model.getExtentDict()
        skin_id         = request.GET.get(u'skin_id')
    except WidgetModel.DoesNotExist:
        return HttpResponse({u'succ': False, u'msg': u'xxxxxxxxxxxx'})
    except ExternalDbModel.DoesNotExist:
        return HttpResponse({u'succ': False, u'msg': u'yyyyyyyyyyyy'})
    else:
        hk              = widget_model.m_external_db.m_hk
        st              = stRestore(hk)
        st.reflectTables(json.loads(widget_model.m_table))
        image_data      = genWidgetImageData(extent_data, hk)
        style_data      = widget_model.m_skin.getSkinDict() \
                                        if widget_model.m_skin else {}
        image_data['style'] = style_data
        return MyHttpJsonResponse({u'succ': True, u'widget_id':widget_id, u'data': image_data})


@require_http_methods(['POST'])
def reqDrawData(request):
    """
    生成chart的数据
    """
    logger.debug("function reqDrawData() is called")
    extent_data = json.loads(request.POST.get(u'data', u'{}'), 
                                object_pairs_hook=OrderedDict)

    rsu = checkExtentData(extent_data)
    if not rsu[0]:
        return MyHttpJsonResponse({u'succ': False, u'msg': rsu[1]})

    try:
        hk      = request.session[u'hk']
        data    = genWidgetImageData(extent_data, hk)
    except Exception, e:
        logger.debug("catch Exception: %s" % e)
        logExcInfo()
        error_dict = {u'succ': False, u'msg': str(e)}
        return MyHttpJsonResponse(error_dict)
    else:
        backData = {u'succ': True, u'data': data}
        return MyHttpJsonResponse(backData)


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


def genWidgetImageData(extent_data, hk):
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
    chart_data                  = getDrawData(extent_data, shape_in_use, hk)

    return {u'type': shape_in_use, u'data': chart_data}


def getDrawData(extent_data, shape_in_use, hk):
    """
    获取画图参数
    """
    logger.debug("function getDrawData() is called")

    # 先看请求里面分别有多少个文字类和数字类的属性
    msn_list, msu_list, group_list = calc_msu_msn_list(extent_data)

    # 从数据库中找出该图形要画得数据
    data_from_db = searchDataFromDb(extent_data, hk, msu_list, msn_list, group_list)

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
                                        [u'table', u'attr', u'kind', u'cmd']))

        col_row_flag = u'col' if idx < len_col_attr_list else u'row'
        tmp_attr_list = msn_list \
                            if u'rgl' == attr_kind_cmd_tuple[3] \
                                or 2 == attr_kind_cmd_tuple[2] \
                                        else msu_list
        tmp_attr_list.append( attr_kind_cmd_tuple + (col_row_flag,) )

    # xxx
    group_list = []
    color_dict = extent_data.get(u'color')
    if color_dict:
        color_attr_table = color_dict.get(u'table', u'')
        color_attr_column = color_dict.get('column', u'')
        group_list.append((color_attr_table, color_attr_column, -1, u'', u'group'))


    return msn_list, msu_list, group_list
    


def searchDataFromDb(extent_data, hk, msu_list, msn_list, group_list):
    """
    要保证select的顺序是 measure、mension、group
    """

    # 轴上面的数字列一定存在sql语句中select段
    # 轴上面的文字列一定存在sql语句中的select段和group段
    # 选择区别里面的数字列不存在sql语句中，它只是做值域范围设定用的
    # 选择区别里面的文字列存在sql语句中的select段和group段

    selects, groups  = [], []
    for axis_tuple in (msu_list + msn_list):
        kind    = axis_tuple[2]
        if 0 == kind:
            selects.append(axis_tuple)
        else:
            selects.append(axis_tuple)
            groups.append(axis_tuple)

    for group_tuple in group_list:
        selects.append(group_tuple)
        groups.append(group_tuple)       

    st  = stRestore(hk)
    resultes = st.exeSelect(selects = selects, groups = groups)
    return resultes



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



