# -*- coding: utf-8 -*-
# Create your views here.
from theme.models import ThemeModel, TheToScnRelationModel
from scene.models import SceneModel
from common.tool import cvtDateTimeToStr
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.db import IntegrityError
from datetime import datetime
from common.tool import MyHttpJsonResponse, GetUniqueIntId
from django.template import RequestContext, Template
from django.shortcuts import render_to_response
import pdb

def themeList(request):
	"""
	主题列表
	"""
	now = datetime.now()
	data = {
			'now':				now
	}
	context = RequestContext(request)
	return render_to_response('theme/list.html', data, context)
def themeCreate(request):
	"""
	主题创建
	"""
	pass
def themeDelete(request):
	"""
	主题删除
	"""
	pass
def themeEdit(request):
	"""
	主题编辑
	"""
	pass
def themeAdd(request):
	"""
	添加主题
	"""
	now = datetime.now()
	sceneList = SceneModel.objects.all
	data = {
			'allowed_scenes':				sceneList,
	}
	now = datetime.now()
	context = RequestContext(request)
	return render_to_response('theme/add.html', data, context)