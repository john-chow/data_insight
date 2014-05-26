# -*- coding: utf-8 -*-

from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import simplejson as json
from django.template import RequestContext, Template
from django.contrib.auth import authenticate, login, logout
from account.forms import AccountForm
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt

import pdb

@csrf_exempt
def mylogin(request):
	"""
	登录函数
	"""
	context = RequestContext(request)
	if u'POST' == request.method:
		user 	= request.POST.get(u'username')
		pwd		= request.POST.get(u'password')	
		html_next	= request.POST.get(u'next','/')	
		user 	= authenticate(username=user, password=pwd)
		if user is not None:
			if user.is_active:
				login(request, user)
				return HttpResponseRedirect(html_next)
			else:
				context_dict = {u'not_allowed': True}
				return render_to_response(u'account/login.html', context_dict, context)
		else:
			context_dict = {u'not_allowed': True}
			return render_to_response(u'account/login.html', context_dict, context)

	else:
		html_next	= request.GET.get(u'next','')
		context = RequestContext(request)
		return render_to_response(u'account/login.html',{'next':html_next}, context)

@csrf_exempt
def myregister(request):
	"""
	注册函数
	"""
	context = RequestContext(request)
	context_dict = {}
	if request.is_ajax():
		response_data = {}
		username = request.POST.get(u'param')
		print username
		try:
			user = User.objects.get(username=username)
		except User.DoesNotExist:
			print u'新建用户'
			response_data['info'] = '' 
			response_data['status'] = 'y' 
			return HttpResponse(json.dumps(response_data), mimetype="application/json")
		else:
			print u'该用户名已经存在'
			response_data['info'] = u'该用户名已经使用' 
			response_data['status'] = 'n' 
			return HttpResponse(json.dumps(response_data), mimetype="application/json")
	else:
		if u'POST' == request.method:
			user_form = AccountForm(data = request.POST)
			if user_form.is_valid():
				user = user_form.save()
				user.set_password(request.POST.get(u'password'))
				user.save()
				return HttpResponseRedirect('/')
			else:
				print '1111111111'
		else:
			user_form = AccountForm()
		context_dict['form'] = user_form
	return render_to_response(u'account/register.html', context_dict, context)



