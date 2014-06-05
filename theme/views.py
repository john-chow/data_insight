# -*- coding: utf-8 -*-
# Create your views here.
from theme.models import ThemeModel, TheToScnRelationModel
from common.tool import cvtDateTimeToStr
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.db import IntegrityError
from datetime import datetime
from common.tool import MyHttpJsonResponse, GetUniqueIntId
from django.template import RequestContext, Template
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
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
        themeList = ThemeModel.objects.filter(m_name__contains=search,m_status=True).order_by(order)
        context = RequestContext(request)
        print themeList
        data = {
            "themeList": themeList,
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
    主题创建
    """
    pass

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
        return HttpResponseRedirect(u'/theme/?page='+page+"&search="+search+"&sort="+sort)
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
def themeEdit(request):
    """
    主题编辑
    """
    pass
def view(request, id):
    """
    某个主题浏览界面
    """
    if u'GET' == request.method:
        context = RequestContext(request)
        return render_to_response("theme/view.html", {}, context)
    else:
        raise Http404()