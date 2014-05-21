# -*- coding: utf-8 -*-
# Create your views here.
from django.template import RequestContext, Template
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
import pdb

def index(request):
	"""
	跳转到首页
	"""
	data = {}
	context = RequestContext(request)
	return render_to_response('index.html', data, context)
	
def test(request):
	"""
	测试函数
	"""
	data = {}
	context = RequestContext(request)
	return render_to_response('test.html', data, context)
