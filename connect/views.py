# -*- coding: utf-8 -*-
# Create your views here.


from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import simplejson as json
from django.template import RequestContext
from django.shortcuts import render_to_response
from django_sse.redisqueue import send_event

from widget.forms import ConnDbForm
from widget.models import ExternalDbModel
from connect.file import Text, Excel
from connect.sqltool import PysqlAgent, stRestore, stStore
from common.tool import MyHttpJsonResponse
from common.log import logger
from common.head import DEFAULT_DB_INFO

import pdb


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

        st = PysqlAgent()
        succ, msg = st.connDb( \
            kind = 'postgres', ip = ip, port = port, db = db, user = user, pwd = pwd \
        )

        if succ:
            kind    = u'postgres'
            hk  = genConnHk(ip = ip, port = port, db = db, user = user, pwd = pwd, kind = kind)
            stStore(hk, st)
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
#这个接口需要前端配合，具体需要上传内容看本函数中代码即可
def uploadFile(request):
    if 'POST' == request.method:
        f   = request.FILES['file']
        st  = PysqlAgent()
        st.connDb(**DEFAULT_DB_INFO)
        file_name = f.name.split('.')[0]
        if 'excel' != request.POST.get('type'):
            #sheets  = request.POST.getlist('sheets')
            Excel(f, file_name).reflectToTables(st)
            #sheets  = ['Sheet1', 'Sheet2']
            #Excel(f, file_name).reflectToTables(st, sheets)
        else:
            spliter  = request.POST.get('spliter')
            spliter  = ','
            tx = Text(st, f, file_name)
            tx.setSpliter(spliter)
            tx.reflectToTable()
        return MyHttpJsonResponse({'succ': True})
    else:
        context = RequestContext(request)
        return render_to_response('connect/upload.html', context)


def pushToClient(request):
    """
    主动推送信息到前端
    """
    logger.warning('123414')
    send_event('myevent', 'xxxxxxx', channel = 'foo')
    return HttpResponse('zzzzz')




