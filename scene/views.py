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

def sceneList(request):
    """
    场景列表
    """
    now = datetime.now()
    data = {
            'now':              now
    }
    context = RequestContext(request)
    return render_to_response('scene/list.html', data, context)


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
        subject = SubjectModel.objects.get(m_id=sub_id)
    except SubjectModel.DoesNotExist:
        raise Exception(u'Cant find subject, id = %s'.format(sub_id))

    scenes = subject.m_scenes.all()
    aaa = scenes.values()
    return MyHttpJsonResponse({u'succ': True, u'data': aaa})


    
def addScene(request, kind):
    sub_id, scn_id = map(lambda x: request.POST.get(x), ['sub_id', 'scn_id'])
    try:
        sub = SubjectModel.objects.get(m_id=sub_id)
        scn = SceneModel.objects.get(m_id=scn_id)
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
        sub = SubjectModel.objects.get(m_id=sub_id)
        scn = SceneModel.objects.get(m_id=scn_id)
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
        sub = SubjectModel.objects.get(m_id=sub_id)
        for scn_id, order_number in scns_id_order_dict.items():
            scn = SceneModel.objects.get(m_id=scn_id)
            relation = SubToScnRelationModel.objects.get(
                m_sub = sub, m_scn = scn
            )
            relation.save(order = order_number)
    except Exception, e:
        pass

    return MyHttpJsonResponse({u'succ': True})
"""
