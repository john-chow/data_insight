# -*- coding: utf-8 -*-

# Create your views here.
from dbinfo.models import Smart
from django.utils import simplejson as json
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext

import psycopg2 as pysql
import vincent
import pandas as pd
from common.tool import *

import pdb


def getDbInfo(request):
	table = request.session.get('_table_')

	conn 			= connectDb(request)
	cursor 			= conn.cursor()
	cursor.execute('select * from %s' % table)
	results 		= cursor.fetchall()
	col_names 		= [ q[0] for q in cursor.description ]

	(dm_dict, me_dict) = ( {}, {} )
	for i, name in enumerate(col_names):
		val_list = list( set( 		\
			[ q[i] for q in results ] 	\
		) )

		tmp = val_list[0]
		if isinstance(tmp, int) or isinstance(tmp, float):
			me_dict[name] = None
		else:
			dm_dict[name] = json.dumps(val_list, default=date_handler)

	data = {
		'name':		table
		, 'dm':		dm_dict
		, 'me':		me_dict
	}

	return MyHttpJsonResponse(data)
			


def tryIntoDb(request):
	print 'try into db'

	if 'POST' == request.method:
		if connectDb(request):
			request.session[u'_ip_'] 		= request.POST.get('ip', 	'')
			request.session[u'_port_'] 		= request.POST.get('port', 	'')
			request.session[u'_db_'] 		= request.POST.get('db', 	'')
			request.session[u'_user_'] 		= request.POST.get('user', 	'')
			request.session[u'_pwd_'] 		= request.POST.get('pwd', 	'')
			request.session[u'_table_'] 	= request.POST.get('table', '')

			print 'redirect to indb'
			return HttpResponseRedirect('/indb/')
		else:
			msg = 'cant access into database'
			return MyHttpJsonResponse( {'succ': False, 'msg': msg} )
	else:
		context = RequestContext(request)
		return render_to_response('index.html', context)



def connectDb(request):
	# 提交表单时，用表单内容连接数据库
	if 'POST' == request.method:
		ip 		= request.POST.get('ip', 	'')
		port 	= request.POST.get('port', 	'')
		db 		= request.POST.get('db', 	'')
		user 	= request.POST.get('user', 	'')
		pwd 	= request.POST.get('pwd', 	'')
		table 	= request.POST.get('table', '')
	else:
		ip 		= request.session.get('_ip_', 		'')
		port 	= request.session.get('_port_', 	'')
		db 		= request.session.get('_db_', 		'')
		user 	= request.session.get('_user_', 	'')
		pwd 	= request.session.get('_pwd_', 		'')
		table 	= request.session.get('_table_', 	'')

	dbInput = (ip, port, db, user, pwd)

	try:
		conn = pysql.connect( 
			'host=%s port=%s dbname=%s user=%s password=%s' % \
			dbInput 
		)
	except Exception, e:
		return HttpResponseRedirect('/')
	else:
		return conn

	

def selectData(request):
	# 如果时间过了很久，这里要判断session是否失效了
	conn = connectDb(request)

	if not conn:
		raise Exception('Cant access into database')

	''' 拼凑sql语句中查询x、y列表部分 '''
	xList 		= request.session.setdefault('_x_', [])
	yList 		= request.session.setdefault('_y_', [])
	filterList 	= request.session.setdefault('_filter_', {})

	table 	= request.session['_table_']
	sel		= 'select %s from %s %s' 
	filterSen = ''
	selX = ''
	selY = ''
	
	if bool(filterList):
		filterSenList = request.session['_filter_'].values()
		filterSen	= 'where ' + ' and '.join(filterSenList)

	if bool(xList):
		selX	= ','.join(xList)

	if bool(yList):
		selY 	= ','.join(yList)
	
	sqlX = ''
	sqlY = ''

	cursor = conn.cursor()
	try:
		(resultsX, resultsY) = ([], [])

		if bool(selX):
			sqlX	= sel % (selX, table, filterSen)
			cursor.execute(sqlX)
			resultsX = cursor.fetchall()
		if bool(selY):
			sqlY	= sel % (selY, table, filterSen)
			cursor.execute(sqlY)
			resultsY = cursor.fetchall()

	except Exception, e:
		# 继续抛出异常
		raise Exception(e.msg)
		pass
	else:
		return (resultsX, resultsY)
	finally:
		conn.close()


def reqCol(request):
	return dealAxesReq(request, 'column')


def reqRow(request):
	return dealAxesReq(request, 'row')
	

def dealAxesReq(request, axes):
	axes_to_ss_dic = {
		'column':		'_col_'
		, 'row':		'_row_'
	}
	axes_ss 	= axes_to_ss_dic.get('axes')
	old_ss 		= request.session.setdefault(axes, u'[]')
	
	if 'POST' == request.method:
		tmp_list = json.loads( request.POST.get(axes) )
		request.session[axes_ss] = list( set(tmp_list) )

		try:
			data = generateBackData(request)
		except Exception, e:
			rollBackSession(request, axes_ss, old_ss)
			error_dict = {'succ': False, 'msg': e.msg}
			return MyHttpJsonResponse(error_dict)
		else:
			backData = {'succ': True, 'data': data}
			return MyHttpJsonResponse(backData)

	else:
		return
	

def rollBackSession(request, axes_ss, old_ss):
	request.session[axes_ss] = old_ss


def test():
	return 

	

def dealFilter(request, id):
	request.session.setdefault('_filter_', {})

	if 'POST' == request.method:
		post_data 		= request.POST
		ajax_cmd 		= post_data['cmd']
		if 'add' == ajax_cmd:
			id 				= post_data['id']
			proty			= post_data['property']
			val_list 		= json.loads( post_data['val_list'] )
			
			lll 	= [ (proty + '=' + str(x)) for x in val_list ]
			sen 	= ' or '.join(lll)
			request.session['_filter_'][id] = sen
		elif 'rm' == ajax_cmd:
			id				= post_data['id']			
			if request.session['_filter_'].has_key(id):
				del request.session['_filter_'][id]
				
			else:
				backData = {'succ': False, 'msg': 'Something not exist that you delete'}
				return MyHttpJsonResponse(backData)
	
	else:
		print 'request.method is %s' % request.method

	data = generateBackData(request)
	backData = {'succ': True, 'data': data}

	return MyHttpJsonResponse(backData)


def addCalcFilter(request):
	filters = json.loads( request.POST.get('f') )
	request.session.setdefault('_filter_', {})


def generateBackData(request):
	(xList, yList) = selectData(request)
	perpareBackData(xList, yList)

	data = readJsonFile('')
	return data

	
		
def perpareBackData(xList, yList):
	if bool(xList):
		dataList = [ xt[0] for xt in xList ]
		bar = vincent.Bar(dataList)
		bar.to_json('111.json')
		return

	elif bool(yList):
		list = vincent.Bar(xList[0])
		bar = vincent.Bar(list)
		bar.to_json('111.json')
		return

	else:
		dict_of_iters = { 'x': xList[0], 'data': yList[0] }
		bar = vincent.Bar(dict_of_iters, iter_idx='x')
		bar.to_json('111.json')
		return 
				

def readJsonFile(file):
	file = '111.json'
	f = open(file, 'r')
	jsonData = json.load(f, 'utf-8')
	return jsonData
	
