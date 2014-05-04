from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import simplejson as json
from django.template import RequestContext, Template
from django.contrib.auth import authenticate, login, logout
from myuser.forms import UserForm

import pdb


def mylogin(request):
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
				context_dict = {u'not_allowed': True}
				return render_to_response(u'user_login.html', context_dict, context)
		else:
			context_dict = {u'not_allowed': True}
			return render_to_response(u'user_login.html', context_dict, context)

	else:
		context = RequestContext(request)
		return render_to_response(u'user_login.html', context)


def myregister(request):
	context = RequestContext(request)
	context_dict = {}
	if u'POST' == request.method:
		user_form = UserForm(data = request.POST)
		if user_form.is_valid():
			user = user_form.save()
			user.set_password(request.POST.get(u'password'))
			user.save()
			return HttpResponseRedirect('/')
		else:
			print '1111111111'
	else:
		user_form = UserForm()

	context_dict['form'] = user_form
	return render_to_response(u'user_register.html', context_dict, context)



