from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import simplejson as json
from django.template import RequestContext, Template
from django.contrib.auth import authenticate, login, logout
from user.form import UserForm

import pdb


def login(request):
	context = RequestContext(request)
	if u'POST' == request.method:
		user 	= request.POST.get(u'username')
		pwd		= request.POST.get(u'password')	
		user 	= authenticate(username=user, password=pwd)
		if user is not None:
			if user.is_active:
				login(request, user)
				return HttpResponseRedirect('/')
			else:
				context_dict = {u'not_allowe': True}
				return render_to_response(u'user_login.html', context_dict, context)
		else:
			context_dict = {u'not_allowe': True}
			return render_to_response(u'user_login.html', context_dict, context)


	else:
		context = RequestContext(request)
		return render_to_response(u'user_login.html', context)


def register(request):
	pass
"""
	context = context(request)
	context_dict = {}
	if u'POST' == request.method:


	else:
		context_dict['form'] = UserForm
		return render_to_response(u'user_register.html', context_dict, context)
"""
