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
from widget.factor import FactorFactory, EXPRESS_FACTOR_KEYS_TUPLE
from connect.models import FieldsInfoModel
from connect.file import Text, Excel
from connect.sqltool import SqlExecutorMgr, SqlExecutor
from common.tool import MyHttpJsonResponse, logExcInfo, resolveBackboneReq
from common.log import logger
from common.head import ConnNamedtuple, ConnArgsList, DEFAULT_DB
import common.protocol as Protocol

import pdb


def genConnHk(nt):
    str = '{kind}_{ip}_{port}_{db}_{user}_{pwd}'
    cnt = str.format(   \
        kind = nt.kind, user = nt.user, pwd = nt.pwd, \
        ip = nt.ip,   port = nt.port, db = nt.db   \
    )
    return hash(cnt)


def connectDb(nt):
    if not isinstance(nt, ConnNamedtuple):
        return False, 'xxxxxxxxxx'

    hk  = genConnHk(nt)
    st = SqlExecutorMgr.stCreate()
    succ, msg = st.connDb(nt)
    return succ, msg, hk, st


def handleConn(request):
    """
    连接数据库
    """
    if 'POST' == request.method:
        post_data = json.loads(request.POST.get('data'))
        if not post_data:
            return MyHttpJsonResponse({'succ': False, 'msg': 'xxxxx'})

        conn_list = map(lambda x: post_data.get(x), ConnArgsList)
        #conn_list[-1] = 'postgres'
        conn_nt = ConnNamedtuple(*conn_list)
        succ, msg, hk, st = connectDb(conn_nt)

        if succ:
            request.session['hk'] = hk
            SqlExecutorMgr.stStore(hk, st)

            ExternalDbModel.objects.get_or_create(pk = hk, \
                m_kind = conn_nt.kind, m_user = conn_nt.user, m_pwd = conn_nt.pwd, \
                m_ip = conn_nt.ip, m_port = conn_nt.port, m_db = conn_nt.db \
            )

            return HttpResponseRedirect('/connect/table')

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
    if 'POST' == request.method:
        tables_str   = request.POST.get('table', '[]')
        chosen_tables = json.loads(tables_str)

        hk  = request.session.get('hk')
        st  = SqlExecutorMgr.stRestore(hk)
        tables_list = st.listTables()

        # 注意传多个来怎么办
        unkonwn_tables = list(set(chosen_tables) - set(tables_list))

        if 0 == len(unkonwn_tables):
            map(lambda x: st.getStorage().reflect(x), chosen_tables)
            return HttpResponseRedirect( \
                '/connect/field/' + '?tables={}'.format(tables_str) \
            )
        else:
            res_dict = {'succ': False, 'msg': 'xxxxx'}
            return HttpResponse(res_dict, content_type='application/json')
    else:
        hk  = request.session.get('hk')
        st  = SqlExecutorMgr.stRestore(hk)
        tables_list = st.listTables()

        return MyHttpJsonResponse( {'succ': True, \
                                    'data': json.dumps(tables_list)} )


@login_required
def handleField(request):
    """
    处理自定义数据表请求
    """
    hk = request.session.get('hk')
    st = SqlExecutorMgr.stRestore(hk)
    try:
        conn = ExternalDbModel.objects.get(pk = hk)
    except ExternalDbModel.DoesNotExist, e:
        return MyHttpJsonResponse({'succ': False, 'msg': 'xxxxx'})

    user = request.user

    if 'POST' == request.method:
        tablename = request.POST.get('tableName')
        fields = json.loads(request.POST.get('fields'))
        if not tablename:
            return MyHttpJsonResponse({'succ': False, 'msg': 'yyyyy'})
        if not fields or 0 == len(fields):
            return MyHttpJsonResponse({'succ': True})

        try:
            model, created = FieldsInfoModel.objects.get_or_create( \
                m_user = user, m_conn = conn, m_table = tablename \
            )

            types = json.loads(model.m_types) if model.m_types else {}
            nicknames = json.loads(model.m_nicknames) if model.m_nicknames else {}
            for item in fields:
                fieldname = item[Protocol.FieldName]
                types[fieldname] = item[Protocol.FieldType]
                nicknames[fieldname] = item[Protocol.FieldNickname]

                model.m_types = json.dumps(types)
                model.m_nicknames = json.dumps(nicknames)
                model.save()

        except Exception, e:
            return MyHttpJsonResponse({'succ': False, 'msg': 'xxxxx'})

        return MyHttpJsonResponse({'succ': True})

    else:
        tables_str = request.GET.get('tables')
        tables = json.loads(tables_str)
        if (not tables) or len(tables) < 1:
            return MyHttpJsonResponse({'succ': False, 'msg': 'yyyyy'})

        data = []
        for t in tables:
            models = FieldsInfoModel.objects.filter( \
                m_user = user, m_conn = conn, m_table = t \
            )

            types_dict = st.statFieldsType(t)
            nicknames_dict = dict(zip(types_dict.keys(), [''] * len(types_dict)))

            if len(models) > 0 :
                model = models[0]
                types_dict.update(model.getTypesDict())
                nicknames_dict.update(model.getNicknamesDict())

            fields_list     = types_dict.keys()
            types_list      = types_dict.values()
            nicknames_list  = [nicknames_dict[i] for i in fields_list]
            each_data = {
                'fields':       fields_list
                , 'types':      types_list
                , 'nicknames':  nicknames_list
            }
            data.append(each_data)

        return MyHttpJsonResponse({'succ': True, 'data': json.dumps(data)})


@login_required
@require_http_methods(['GET'])
def handleDistinct(request):
    req = json.loads(request.GET.get(Protocol.FilterColumn))
    info = map(lambda x: (x, req.get(x)), EXPRESS_FACTOR_KEYS_TUPLE)
    factor = FactorFactory.make(dict(info))

    try:
        hk  = request.session.get('hk')
        st  = SqlExecutorMgr.stRestore(hk)
        sql_obj = st.getSwither().makeSelectSql( \
            [factor], [], [], distinct = True \
        )
        data = st.execute(sql_obj).fetchall()
        result = zip(*data)[0]
    except ExternalDbModel.DoesNotExist, e:
        logExcInfo()
        resp = {'succ': False, 'msg': 'yyyyyyyyy'}
    except Exception, e:
        logExcInfo()
        resp = {'succ': False, 'msg': 'xxxxxxxxx'}
    else:
        resp = {'values': result}
    finally:
        return MyHttpJsonResponse(resp)


@login_required
#这个接口需要前端配合，具体需要上传内容看本函数中代码即可
@require_http_methods(['POST'])
def uploadFile(request):
    post = request.POST
    f   = request.FILES['file']
    st  = SqlExecutor()
    st.connDb(DEFAULT_DB)
    filename = f.name.split('.')[0]
    if 'excel' == post.get('type'):
        #sheets  = post.getlist('sheets')
        Excel(f, filename).reflectToTables(st)
        #sheets  = ['Sheet1', 'Sheet2']
        #Excel(f, filename).reflectToTables(st, sheets)
    else:
        spliter  = post.get('spliter')
        spliter  = ','
        tx = Text(st, f, filename)
        tx.setSpliter(spliter)
        tx.reflectToTable()
    return MyHttpJsonResponse({'succ': True})


def pushToClient(request):
    """
    主动推送信息到前端
    """
    logger.warning('123414')
    send_event('myevent', 'xxxxxxx', channel = 'foo')
    return HttpResponse('zzzzz')


