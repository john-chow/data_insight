# -*- coding: utf-8 -*-
# Create your views here.
from django.template import RequestContext, Template
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from common.log import logger
import pdb

def index(request):
    """
    跳转到首页
    """
    data = {}
    context = RequestContext(request)
    return render_to_response('index.html', data, context)
    
def pretest(request):
    """
    测试函数
    """
    if u'POST' == request.method:
        f   = request.FILES['pretest']
        fs  = request.POST.get(u'fs')

        pdb.set_trace()

        for chunk in f.chunks():
            aa = chunk.split(fs)

        return HttpResponse({})

    else:
        context = RequestContext(request)
        return render_to_response('pretest.html', context)
