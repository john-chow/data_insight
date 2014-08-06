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
from connect.sqltool import PysqlAgentManager, PysqlAgent
from common.tool import MyHttpJsonResponse
from common.log import logger
from common.head import DEFAULT_DB_INFO, ConnNamedtuple, ConnArgsList

import pdb


def genConnHk(nt):
    str = u'{kind}_{ip}_{port}_{db}_{user}_{pwd}'
    cnt = str.format(   \
        kind = nt.kind, user = nt.user, pwd = nt.pwd, \
        ip = nt.ip,   port = nt.port, db = nt.db   \
    )
    return hash(cnt)


def connectDb(nt):
    if not isinstance(nt, ConnNamedtuple):
        return False, 'xxxxxxxxxx'

    hk  = genConnHk(nt)
    st = PysqlAgentManager.stRestore(hk) or PysqlAgentManager.stCreate()
    succ, msg = st.connDb(nt)
    return succ, msg, hk, st


def handleConn(request):
    """
    连接数据库
    """
    logger.warning("function handleConn() is called")

    if u'POST' == request.method:
        post_data = json.loads(request.POST.get('data'))
        if not post_data:
            return MyHttpJsonResponse({'succ': False, 'msg': 'xxxxx'})

        conn_list = map(lambda x: post_data.get(x), ConnArgsList)
        conn_list[-1] = 'postgres'
        conn_nt = ConnNamedtuple(*conn_list)
        succ, msg, hk, st = connectDb(conn_nt)

        if succ:
            request.session[u'hk'] = hk
            PysqlAgentManager.stStore(hk, st)

            ExternalDbModel.objects.get_or_create(pk = hk, \
                m_kind = conn_nt.kind, m_user = conn_nt.user, m_pwd = conn_nt.pwd, \
                m_ip = conn_nt.ip, m_port = conn_nt.port, m_db = conn_nt.db \
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
def handleTable(request):
    """
    选择数据表
    """
    logger.debug("function handleTable() is called")

    if u'POST' == request.method:
        chosen_tables   = request.POST.getlist(u'table', u'[]')

        hk  = request.session.get(u'hk')
        st  = PysqlAgentManager.stRestore(hk)
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
        st  = PysqlAgentManager.stRestore(hk)
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
        st = PysqlAgentManager.stRestore(hk)
    except Exception, e:
        return MyHttpJsonResponse(  \
            {u'succ': False, u'msg': u'Connect db first'}   \
        )

    tables = json.loads(request.GET.get(u'tables'))
    tables_info_list = st.getTablesInfo(tables)

    res_dict = {u'succ': True, u'data': tables_info_list}
    return MyHttpJsonResponse(res_dict)



@login_required
def handleFields(request):
    """
    关于某数据表中全部列信息
    """
    if 'POST' == request.method:
        pass
    else:
        pass



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




