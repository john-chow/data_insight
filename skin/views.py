# -*-coding: utf-8 -*-

# Create your views here.

from django.views.decorators.http import require_http_methods
from django.template import RequestContext, Template
from django.shortcuts import render_to_response, get_object_or_404

from skin.models import SkinModel
from widget.models import WidgetModel
from common.log import logger
from common.tool import MyHttpJsonResponse

import pdb


def cvtCatToId(cat):
    """
    根据种类，把种类名称转换成种类id
    """
    if 'theme' == cat:
        cat_id  = 0
    elif 'scene' == cat:
        cat_id  = 1
    elif 'widget' == 2:
        cat_id  = 2
    else:
        cat_id  = -1

    return cat_id



@require_http_methods(['GET'])
def skinIndex(request):
    context = RequestContext(request)
    models = SkinModel.objects.all()
    widgets = WidgetModel.objects.all()
    data = {
        'skins':        models
        , 'widgets':    widgets
    }
    return render_to_response(
        'skin/index.html', data, context
    )


@require_http_methods(['POST'])
def skinCreate(request):
    data = request.POST.get('data')
    if not data:
        return MyHttpJsonResponse({
            'succ':     False
            , 'msg':    'no data'
        })

    name = request.POST.get('name')
    if not name:
        return MyHttpJsonResponse({
            'succ':     False
            , 'msg':    'need name'
        })

    model = SkinModel.create(
        m_name = name, m_cat = 2 
    )

    return MyHttpJsonResponse({
        'succ':     True
    })


def skinEdit(request, id):
    if 'POST' == request.method:
        model = SkinModel.find(id)
        name = request.POST.get('name')
        if name:
            model.m_name = name
            try:
                model.save()
            except Exception, e:
                return MyHttpJsonResponse({
                    'succ':     False
                    , 'msg':    'db excption'
                })

        data = request.POST.get('data')
        if data:
            model.saveSkinDict(data)

        return MyHttpJsonResponse({
            'succ':     True
        })
    else:
        model = SkinModel.find(id)
        data = model.getSkinDict()
        return MyHttpJsonResponse({
            'succ':     True
            , 'entity': {
                'name':     model.m_name
                , 'data':   data
            }
        })


@require_http_methods(['POST'])
def skinDelete(request, id):
    try:
        SkinModel.objects.filter(pk = id).delete()
    except Exception, e:
        return MyHttpJsonResponse({
            'succ':     False
            , 'msg':    'db exception'
        })

    return MyHttpJsonResponse({
        'succ':     True
    })


def skinDetail(request, cat, skin_number):
    """
    获取某皮肤的具体数据
    """
    cat_id  = cvtCatToId(cat)
    try:
        skin_model = SkinModel.objects.get(m_cat = cat_id, m_number = skin_number)
    except SkinModel.DoesNotExist, e:
        logger.warning('Can''t find skin')
        return MyHttpJsonResponse({'succ': False, 'msg': ''})

    skin_dict = skin_model.getSkinDict()
    return MyHttpJsonResponse({'succ': True, 'data': skin_dict})
        
    
def skinList(request):
    pass



