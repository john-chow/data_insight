# -*-coding: utf-8 -*-

# Create your views here.

from django.views.decorators.http import require_http_methods

from skin.models import SkinModel
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


def skinList(request, cat):
    cat_id      = cvtCatToId(cat)
    pass

def skinCreate(request):
    pass


@require_http_methods(['GET'])
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
        
    

def skinDelete(request):
    pass



