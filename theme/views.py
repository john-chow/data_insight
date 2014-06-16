# -*- coding: utf-8 -*-
# Create your views here.
from theme.models import ThemeModel, TheToScnRelationModel
from scene.models import SceneModel
from django.http import HttpResponseRedirect
from common.tool import MyHttpJsonResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.utils import simplejson as json
from django.shortcuts import get_object_or_404
from common.log import logger
import pdb

def themeList(request, template_name):
    """
    主题列表
    """
    if 'GET' == request.method:
        search = request.GET.get('search' , '')
        sort = request.GET.get('sort' , '-1')
        page = request.GET.get('page' , '1')
        order = "m_create_time" if int(sort) == 1 else "-m_create_time"
        themeList = ThemeModel.objects.filter(m_name__contains=search,m_status=True)\
        #             .order_by(order)
        # scenceDict = {};
        # for theme in themeList:
        #     t2sRal = theme.t2r_set.all().order_by("m_order")
        #     for index,ral in enumerate(t2sRal):
        #         scenceDict[str(theme.pk) + "_" + str(index)] = ral.m_scn
        context = RequestContext(request)
        data = {
            "themeList": themeList,
            # "scenceDict": scenceDict,
            "search": search,
            "sort": sort,
            "page": page,
            "allCount": len(themeList)
        }
        return render_to_response(template_name, data, context)
    else:
        raise Http404()
def themeCreate(request):
    """
        添加主题
    """
    if request.method == u'GET':
        sceneList = SceneModel.objects.filter(m_is_distributed = True)\
                                                .values(u'pk', u'm_snapshot', u'm_name')
        data = {
                'allowed_scenes':                sceneList,
        }
        context = RequestContext(request)
        return render_to_response('theme/add.html', data, context)
    else:
        owner = request.user.username
        name, switch_effect = map(lambda x: request.POST.get(x), \
                                        ('name', 'switch_effect'))
        scences = json.loads(request.POST.get('scences'))
        print(name)
        theme = ThemeModel.objects.create(
            m_name=name, m_switch_effect=switch_effect, \
            m_owner=owner
        )

        rla_list = []
        for order, sc in enumerate(scences):
            scence = SceneModel.objects.get(pk = sc.get(u'id'))
            rla = TheToScnRelationModel( \
                m_sub = theme, m_scn = scence,m_order=sc.get(u'order')
            )
            rla_list.append(rla)
        TheToScnRelationModel.objects.bulk_create(rla_list)

        return MyHttpJsonResponse({u'succ': True, u'id': theme.pk, \
                                    u'msg': u'保存成功'})

@login_required
def themeOp(request, op):
    """
    修改某个场景的发布状态
    场景删除
    """
    if u'POST' == request.method:
        id = request.POST.get('id')
        page = request.POST.get('page','')
        search = request.POST.get('search' , '')
        sort = request.POST.get('sort' , '-1')
        theme = ThemeModel.objects.get(pk = id)
        if (op == 'dis'):
            theme.m_is_distributed = not theme.m_is_distributed
        else:
            theme.m_status = False
        theme.save()
        return HttpResponseRedirect(u'/theme/?page='+page+"&search="+search+\
                "&sort="+sort)
    else:
        raise Http404()
@login_required
def batachOp(request, op):
    """
    场景批量发布
    场景批量取消发布
    场景批量删除
    """
    if u'POST' == request.method:
        id_list = request.POST.get('list')
        arr = id_list.split(',')
        for id in arr:
            print id+"____"
            theme = ThemeModel.objects.get(pk=id)
            if(op == 'dis'):
                theme.m_is_distributed = True
            elif(op == 'undis'):
                theme.m_is_distributed = False
            else:
                theme.m_status = False
            theme.save()
        page = request.POST.get('page','')
        return HttpResponseRedirect(u'/theme/batch?page='+page)
    else:
        raise Http404()
def themeEdit(request, id):
    """
    主题编辑
    """
    if request.method == u'GET':
        logger.info("id:" + id)
        context = RequestContext(request)
        theme = get_object_or_404(ThemeModel, pk = id)
        sceneList = SceneModel.objects.filter(m_is_distributed = True)\
                                                .values(u'pk', u'm_snapshot', u'm_name')
        data = {
                'theme':                         theme,
                'allowed_scenes':                sceneList
        }
        return render_to_response('theme/add.html', data, context)
    else:
        name, switch_effect = map(lambda x: request.POST.get(x), \
                                        ('name', 'switch_effect'))
        scences = json.loads(request.POST.get('scences'))
        ThemeModel.objects.filter(pk = id).update(\
                                                  m_name = name, m_switch_effect = switch_effect)
        rla_list = []
        for sc in scences:
            scence = SceneModel.objects.get(pk = sc.get(u'id'))
            rla = TheToScnRelationModel( \
                m_sub = theme, m_scn = scence,m_order=sc.get(u'order')
            )
            rla_list.append(rla)
        TheToScnRelationModel.objects.filter(m_sub = theme).delete()
        TheToScnRelationModel.objects.bulk_create(rla_list)
        return MyHttpJsonResponse({u'succ': True, u'id': theme.pk, \
                                    u'msg': u'编辑成功'})
        
def view(request, id):
    """
    某个主题浏览界面
    """
    if u'GET' == request.method:
        logger.info("xxxxxxxxxxxxx")
        context = RequestContext(request)
        theme = get_object_or_404(ThemeModel, pk = id)
        theme_scene_rla_set = theme.t2r_set.all().order_by(u'm_order')
        data = {
            u"theme" : theme,
            u"theme_scene_rla" : theme_scene_rla_set
        }
        return render_to_response("theme/view.html", data, context)
    else:
        raise Http404()
