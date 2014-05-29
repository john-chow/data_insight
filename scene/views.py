# -*- coding: utf-8 -*-

from scene.models import SceneModel, ScnToWiRelationModel
from widget.models import WidgetModel
from common.tool import cvtDateTimeToStr
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.utils import simplejson as json
from django.db import IntegrityError
from datetime import datetime
from common.tool import MyHttpJsonResponse, GetUniqueIntId
from django.contrib.auth.decorators import login_required
from django.template import RequestContext, Template
from django.shortcuts import render_to_response
from django.shortcuts import get_object_or_404
import pdb

def sceneList(request, template_name):
    """
    场景列表
    """
    if 'GET' == request.method:
        search = request.GET.get('search' , '')
        sort = request.GET.get('sort' , '-1')
        page = request.GET.get('page' , '1')
        order = "m_create_time" if int(sort) == 1 else "-m_create_time"
        sceneList = SceneModel.objects.filter(m_name__contains=search,m_status=True).order_by(order)
        context = RequestContext(request)
        print sceneList
        data = {
            "sceneList": sceneList,
            "search": search,
            "sort": sort,
            "page": page,
            "allCount": len(sceneList)
        }
        return render_to_response(template_name, data, context)
    else:
        raise Http404()

@login_required
def sceneCreate(request):
    """
    创建场景
    """
    if u'POST' == request.method:
        widgets, layout = map(lambda x: json.loads(request.POST.get(x, '[]')), \
                                                ('widgets', 'layout')) 
        owner = request.user.username
        scene = SceneModel.objects.create(m_owner = owner, m_layout = layout)

        try:
            for wi in widgets:
                widget = WidgetModel.objects.get(pk = wi.get(u'id'))
                ScnToWiRelationModel.objects.create(m_scn = scene, m_wi = widget, m_stamp = wi.get(u'stamp'))
        except WidgetModel.DoesNotExist:
            return MyHttpJsonResponse({u'succ': False})

        return MyHttpJsonResponse({u'succ': True, u'scn_id': scene.pk})
        
    else:
        # 全部已被允许可用的组件
        context = RequestContext(request)
        allow_use_widgets = WidgetModel.objects.filter(m_is_distributed = True) \
                                        .values('pk', 'm_name', 'm_owner', 'm_create_time')
        dict = {u'allowed_widgets': allow_use_widgets}
        return render_to_response('scene/add.html', dict, context)


@login_required
def sceneEdit(request, scn_id):
    """
    编辑场景
    """
    if u'POST' == request.method:
        pass
    else:
        context = RequestContext(request)
        allow_use_widgets = WidgetModel.objects.filter(m_is_distributed = True) \
                                        .values('pk', 'm_name', 'm_owner', 'm_create_time')

        scene = get_object_or_404(SceneModel, pk = scn_id)
        scn_wi_rla_set = scene.s2r_set.all()

        dict = {u'allowed_widgets': allow_use_widgets, u'sw_rla_set': scn_wi_rla_set}
        return render_to_response('scene/add.html', dict, context)
@login_required
def sceneOp(request, op):
    """
    修改某个场景的发布状态
    场景删除
    """
    if u'POST' == request.method:
        id = request.POST.get('id')
        page = request.POST.get('page','')
        search = request.POST.get('search' , '')
        sort = request.POST.get('sort' , '-1')
        scene = SceneModel.objects.get(pk = id)
        if (op == 'dis'):
            scene.m_is_distributed = not scene.m_is_distributed
        else:
            scene.m_status = False
        scene.save()
        return HttpResponseRedirect(u'/scene/?page='+page+"&search="+search+"&sort="+sort)
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
            scene = SceneModel.objects.get(pk=id)
            if(op == 'dis'):
                scene.m_is_distributed = True
            elif(op == 'undis'):
                scene.m_is_distributed = False
            else:
                scene.m_status = False
            scene.save()
        page = request.POST.get('page','')
        return HttpResponseRedirect(u'/scene/batch?page='+page)
    else:
        raise Http404()

def sceneDelete(request):
    """
    删除场景
    """
    try:
        obj = SceneModel.objects.get(pk=request.POST.get(u'id')).delete()
    except IntegrityError, e:
        return MyHttpJsonResponse({
            u'succ': False, u'msg': 'no exist'
        })
    return MyHttpJsonResponse({u'succ': True})


"""
def getScenesList(sub_id):
    try:
        subject = SubjectModel.objects.get(pk=sub_id)
    except SubjectModel.DoesNotExist:
        raise Exception(u'Cant find subject, id = %s'.format(sub_id))

    scenes = subject.m_scenes.all()
    aaa = scenes.values()
    return MyHttpJsonResponse({u'succ': True, u'data': aaa})


    
def addScene(request, kind):
    sub_id, scn_id = map(lambda x: request.POST.get(x), ['sub_id', 'scn_id'])
    try:
        sub = SubjectModel.objects.get(pk=sub_id)
        scn = SceneModel.objects.get(pk=scn_id)
        SubToScnRelationModel.objects.create(
            m_sub=sub, m_scn=scn, m_order=request.POST.get(u'order')
        )
    except IntegrityError, e:
        return MyHttpJsonResponse({
            u'succ': False, u'msg': 'no exist'
        })

    return MyHttpJsonResponse({u'succ': True})



def rmScene(request, kind):
    sub_id, scn_id = map(lambda x: request.POST.get(x), ['sub_id', 'scn_id'])
    try:
        sub = SubjectModel.objects.get(pk=sub_id)
        scn = SceneModel.objects.get(pk=scn_id)
        SubToScnRelationModel.objects.get(
            m_sub=sub, m_scn=scn
        ).delete()
    except IntegrityError, e:
        return MyHttpJsonResponse({
            u'succ': False, u'msg': 'no exist'
        })

    return MyHttpJsonResponse({u'succ': True})


def orderScenes(request):
    sub_id = request.POST.get(u'sub_id')
    scns_id_order_dict = request.POST.get(u'orders')

    try:
        sub = SubjectModel.objects.get(pk=sub_id)
        for scn_id, order_number in scns_id_order_dict.items():
            scn = SceneModel.objects.get(pk=scn_id)
            relation = SubToScnRelationModel.objects.get(
                m_sub = sub, m_scn = scn
            )
            relation.save(order = order_number)
    except Exception, e:
        pass

    return MyHttpJsonResponse({u'succ': True})
"""
