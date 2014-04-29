# -*- coding: utf-8 -*-

# Create your views here.
from whichdb.models import UsedDb
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import simplejson as json
from django.template import RequestContext, Template

from whichdb.forms import ConnDbForm
from common.head import *
from common.tool import *
import pdb

def showDbForChosen(request):
	if 'POST' == request.method:
		form = ConnDbForm(request.POST)
		if form.is_valid():
			return HttpResponseRedirect('/main/')
	else:
		form = ConnDbForm

	data = {
		'form':				form
		, 'supported_dbs':	SUPPORTED_DBS
	}
	context = RequestContext(request)

	return render_to_response('list_dbs.html', data, context)



def connectDb(request):
	if u'POST' == request.method:
		if connDb(request, source=u'post'):
			request.session[u'ip'] 		= request.POST.get('ip', 	'')
			request.session[u'port'] 	= request.POST.get('port', 	'')
			request.session[u'db'] 		= request.POST.get('db', 	'')
			request.session[u'user'] 	= request.POST.get('user', 	'')
			request.session[u'pwd'] 	= request.POST.get('pwd', 	'')

			return HttpResponseRedirect(u'/login/tables')
		else:
			err_dict = {u'succ': False, u'msg': u'无法连接数据库'}
			return MyHttpJsonResponse(err_dict)

	else:
		f 			= ConnDbForm()
		form_str 	= f.as_p()
		res_dict 	= {u'succ': True, u'data': form_str}
		return MyHttpJsonResponse(res_dict)



def selectTables(request):
	if u'POST' == request.method:
		chosen_tables 	= request.POST.getlist(u'table', u'[]')
		tables_list 	= getTableList(request)

		# 注意传多个来怎么办
		unkonwn_tables = list(set(chosen_tables) - set(tables_list))

		if 0 == len(unkonwn_tables):
			request.session[u'tables'] 	= 	chosen_tables
			print 'redirect to main'
			return HttpResponseRedirect(u'/main/')
		else:
			res_dict = {u'succ': False, u'msg': u'xxxxx'}
			return HttpResponse(res_dict, content_type='application/json')
	else:
		tables_list = getTableList(request)
		return MyHttpJsonResponse( {u'succ': True, \
									u'data': json.dumps(tables_list)} )



def getTableList(request):
	print '********		getTableList  *********'
	conn 			= connDb(request)
	if not conn:
		print 'redirect to login'
		return HttpResponseRedirect(u'http://10.1.50.125:9000/')
	cursor 			= conn.cursor()
	cursor.execute(u"SELECT table_name FROM information_schema.tables \
												WHERE table_schema='public'")
	results 		= cursor.fetchall()
	table_list 		= [ q[0] for q in results ]
	return table_list


def test(request):
	return HttpResponse("Just for test")


