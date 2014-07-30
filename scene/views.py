# -*- coding: utf-8 -*-

from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.utils import simplejson as json
from django.db import IntegrityError
from datetime import datetime
import time
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.template import RequestContext, Template
from django.shortcuts import render_to_response, get_object_or_404

from scene.models import SceneModel, ScnToWiRelationModel
from widget.models import WidgetModel
from skin.models import SkinModel
from common.tool import MyHttpJsonResponse
from common.head import SCENE_SKIN_PATH

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
        owner = request.user.username
        name, snapshot, layout, skin_id = map(lambda x: request.POST.get(x), \
                                        ('name', 'image', 'layout', 'skin'))
        widgets = json.loads(request.POST.get('widgets'))

        # 没有组件拒绝保存，没有意义
        if not widgets:
            return MyHttpJsonResponse({u'succ': False, u'msg': 'no widgets'})

        try:
            skin    = SkinModel.objects.get(m_number = skin_id)
        except SkinModel.DoesNotExist, e:
            return MyHttpJsonResponse({'succ': False, 'msg': '没有皮肤'})

        scene = SceneModel.objects.create(  \
            m_name = name, m_owner = owner, m_layout = layout   \
            , m_snapshot = snapshot, m_skin = skin    \
        )

        rla_list = []
        for wi in widgets:
            widget = WidgetModel.objects.get(pk = wi.get(u'id'))
            rla = ScnToWiRelationModel( \
                m_scn = scene, m_wi = widget, m_stamp = wi.get(u'stamp') \
            )
            rla_list.append(rla)
        ScnToWiRelationModel.objects.bulk_create(rla_list)

        return MyHttpJsonResponse({u'succ': True, u'scn_id': scene.pk, u'msg': u'保存成功'})
        
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
        name, snapshot, layout, skin_id = map(lambda x: request.POST.get(x), \
                                                ('name', 'image', 'layout', 'skin'))
        widgets = json.loads(request.POST.get(u'widgets'))

        # 没有组件拒绝保存，没有意义
        if not widgets:
            return MyHttpJsonResponse({u'succ': False, u'msg': 'no widgets'})

        try:
            skin    = SkinModel.objects.get(m_number = skin_id)
            scene   = SceneModel.objects.get(pk = scn_id)
        except SkinModel.DoesNotExist, e:
            return MyHttpJsonResponse({'succ': False, 'msg': ''})
        except SceneModel.DoesNotExist, e:
            return MyHttpJsonResponse({'succ': False, 'msg': ''})

        rla_list = []
        for wi in widgets:
            widget = WidgetModel.objects.get(pk = wi.get(u'id'))
            rla = ScnToWiRelationModel( \
                m_scn = scene, m_wi = widget, m_stamp = wi.get(u'stamp') \
            )
            rla_list.append(rla)

        SceneModel.objects.filter(pk = scn_id)  \
                    .update(m_name = name, m_layout = layout, \
                            m_snapshot = snapshot, m_skin = skin)

        # 删掉以前所有关联，重新全部建立
        ScnToWiRelationModel.objects.filter(m_scn = scene).delete()
        ScnToWiRelationModel.objects.bulk_create(rla_list)
            
        return MyHttpJsonResponse({u'succ': True, u'scn_id': scn_id, u'msg': u'编辑成功'})

    else:
        context = RequestContext(request)
        allow_use_widgets = WidgetModel.objects.filter(m_is_distributed = True) \
                                        .values('pk', 'm_name', 'm_owner', 'm_create_time')

        scene = get_object_or_404(SceneModel, pk = scn_id)
        scn_wi_rla_set = scene.s2r_set.all()
        scn_skin_data   = json.dumps(scene.m_skin.getSkinDict())

        dict = {u'scene': scene
                , u'allowed_widgets': allow_use_widgets
                , u'sw_rla_set': scn_wi_rla_set
                , u'scn_skin':  scn_skin_data
            }
        return render_to_response('scene/add.html', dict, context)

def sceneSave(request, scn_id):
    owner = request.user.username
    widgets, layout = map(lambda x: json.loads(request.POST.get(x, '[]')), \
                                            ('widgets', 'layout')) 
    # 没有组件拒绝保存，没有意义
    if (not scn_id) and (not widgets):
        return MyHttpJsonResponse({u'succ': False, u'msg': 'no widgets'})

    if scn_id:
        scene = SceneModel.objects.get(pk = scn_id)
    else:
        scene = SceneModel.objects.create(m_owner = owner, m_layout = layout)

    rla_list = []
    for wi in widgets:
        widget = WidgetModel.objects.get(pk = wi.get(u'id'))
        rla = ScnToWiRelationModel( \
            m_scn = scene, m_wi = widget, m_stamp = wi.get(u'stamp') \
        )
        rla_list.append(rla)

    if widgets:
        # 如果是更改，那么先删除以前所有的关联
        if scn_id:
            ScnToWiRelationModel.objects.filter(m_scn = scene).delete()

        ScnToWiRelationModel.objects.bulk_create(rla_list)

    return MyHttpJsonResponse({u'succ': True, u'scn_id': scene.pk, u'msg': u'保存成功'})


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
    
def sceneView(request, id):
    scence = SceneModel.objects.get(pk = id)
    dict = {
        u'scene' : scence    
    }
    context = RequestContext(request)
    return render_to_response('scene/view.html', dict, context)

def sceneImgUpload(request):
    if request.method == 'POST':
        callback = request.GET.get('CKEditorFuncNum')
        try:
            path = "static/upload/" + time.strftime("%Y%m%d%H%M%S",time.localtime())
            f = request.FILES["upload"]
            file_name = path + "_" + f.name
            des_origin_f = open(file_name, "wb+")  
            for chunk in f.chunks():
                des_origin_f.write(chunk)
            des_origin_f.close()
        except Exception, e:
            print e
        res = "<script>window.parent.CKEDITOR.tools.callFunction("+callback+",'/"+file_name+"', '');</script>"
        return HttpResponse(res)
    else:
        raise Http404()

