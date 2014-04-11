# -*- coding: utf-8 -*-

# Create your views here.
from dbinfo.models import Smart
from django.utils import simplejson as json
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext
from psycopg2.extensions import adapt

import psycopg2 as pysql
import vincent
import pandas as pd
from common.head import *
from common.tool import *

import pdb


def getDbInfo(request):
	print 'getDbInfo'
	table = request.session.get('table')

	conn 			= connDb(request)
	if not conn:
		return HttpResponseRedirect('http://10.1.50.125:9000/')

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
		if connDb(request):
			request.session[u'ip'] 		= request.POST.get('ip', 	'')
			request.session[u'port'] 	= request.POST.get('port', 	'')
			request.session[u'db'] 		= request.POST.get('db', 	'')
			request.session[u'user'] 	= request.POST.get('user', 	'')
			request.session[u'pwd'] 	= request.POST.get('pwd', 	'')
			request.session[u'table'] 	= request.POST.get('table', '')

			print 'redirect to indb'
			return HttpResponseRedirect('/indb/')
		else:
			msg = 'cant access into database'
			return MyHttpJsonResponse( {'succ': False, 'msg': msg} )
	else:
		context = RequestContext(request)
		return render_to_response('index.html', context)



def __connectDb(request):
	if HAVE_PDB: 		pdb.set_trace()
	# 提交表单时，用表单内容连接数据库
	if request.POST.get('ip', 	''):
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
	print 'conn db by %s, %s, %s, %s, %s' % \
			(ip, port, db, user, pwd)

	try:
		conn = pysql.connect( 
			'host=%s port=%s dbname=%s user=%s password=%s' % \
			dbInput 
		)
	except Exception, e:
		print 'cant conn database'
		return None
	else:
		return conn

	

def selectData(request):
	# 如果时间过了很久，这里要判断session是否失效了
	print 'selectData'
	conn = connectDb(request)

	if not conn:
		raise Exception('Cant access into database')

	''' 拼凑sql语句中查询x、y列表部分 '''
	xList 		= request.session.setdefault('_col_', [])
	yList 		= request.session.setdefault('_row_', [])
	filterList 	= request.session.setdefault('_filter_', {})
	#pdb.set_trace()

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
			print 'sqlX = %s' % sqlX
			cursor.execute(sqlX)
			resultsX = cursor.fetchall()
		if bool(selY):
			sqlY	= sel % (selY, table, filterSen)
			print 'sqlY = %s' % sqlY
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

def getDataFromDb(request):
	conn = connectDb(request)
	if not conn:
		raise Exception('Cant access into database')

	cursor = conn.cursor()

	x_name_list = request.session.setdefault('_col_', [])
	y_name_list = request.session.setdefault('_row_', [])
	filter_list = request.session.setdefault('_filter_', {})
	table 		= request.session['table']

	sql_sample_format 	= 'select {col} from {table} limit 1'
	sql_format   		= 'select {col} from {table} {filter} {option}'

	filter_sentence	= ''
	if bool(filter_list):
		filter_list = request.session['_filter_'].values()
		filter_sentence	= 'where ' + ' and '.join(filter_list)

	print 'x_name_list, y_name_list length is %s, %s' % \
						(len(x_name_list), len(y_name_list))

	def fetchOne(col_name):
		sql_sample = sql_sample_format.format(col=col_name, table=table)
		cursor.execute(sql_sample)
		re = cursor.fetchone()[0]
		return re


	if(HAVE_PDB):	pdb.set_trace()

	(bool_x, bool_y) = ( bool(x_name_list), bool(y_name_list) )
	sql_list = []

	if bool_x and bool_y:
		x_y_list = [(x, y) for x in x_name_list for y in y_name_list] 
		for (x, y) in x_y_list:
			[x_re, y_re] = map(fetchOne, (x, y))

			if isNumerical(x_re) and isNumerical(y_re):
				sql = sql_format.format(col=x+', sum(%s) %s' % (y, y), 
									table=table, filter=filter_sentence, \
									option='group by %s' % x)
			elif isNumerical(x_re) and not isNumerical(y_re):
				sql = sql_format.format(col=y+', sum(%s) %s' % (x, x), 
										table=table, filter=filter_sentence, \
										option='group by %s' % y)
			elif not isNumerical(x_re) and isNumerical(y_re):
				sql = sql_format.format(col=x+', sum(%s) %s' % (y, y), 
										table=table, filter=filter_sentence, \
										option='group by %s' % x)
			if(sql):
				sql_list.append(sql)
	
	elif bool_x or bool_y:
		x_name_list.extend(y_name_list)
		for x in x_name_list:
			sql_sample = sql_sample_format.format(col=x, table=table)
			cursor.execute(sql_sample)
			re = cursor.fetchone()[0]
			if isNumerical(re):
				sql = sql_format.format(col='sum(%s) %s' % (x, x), \
										table=table, filter=filter_sentence, \
										option='')
				sql_list.append(sql)

	conn.close()

	return sql_list


def excSqlForData(request, sql_list):
	conn = connDb(request)
	if not conn:
		raise Exception('Cant access into database')

	cursor = conn.cursor()

	if HAVE_PDB:
		pdb.set_trace()

	(heads_list, data_list) = ([], [])
	try:
		for sql in sql_list:
			cursor.execute(sql)
			head = [ q[0] for q in cursor.description ]
			data = cursor.fetchall()

			heads_list.append(head)
			data_list.append(data)
	except Exception, e:
		# 继续抛出异常
		raise Exception(e.msg)
		pass
	else:
		return (heads_list, data_list)
	finally:
		conn.close()



def reqCol(request):
	return dealAxesReq(request, 'column')


def reqRow(request):
	return dealAxesReq(request, 'row')


def connDb(request):
	# 提交表单时在POST字段中找寻登陆信息
	# 其他时候都在session中找
	including_login_dict = request.POST if request.POST.get('ip')\
										else request.session

	[ip, port, table, db, user, pwd] = \
		map( lambda i: including_login_dict.get(i, ''), \
			('ip', 'port', 'table', 'db', 'user', 'pwd') \
		)
	
	conn_str = 'host={i} port={p} dbname={d} user={u} password={pw}'\
					.format(i=ip, p=port, d=db, u=user, pw=pwd)

	try:
		conn = pysql.connect(conn_str)
	except Exception, e:
		print 'cant conn database'
		return None
	else:
		return conn


	

def __dealAxesReq(request, axes):
	print 'dealAxesReq'
	axes_to_ss_dic = {
		'column':		'_col_'
		, 'row':		'_row_'
	}
	axes_ss 	= axes_to_ss_dic.get(axes)
	old_ss 		= request.session.setdefault(axes_ss, u'[]')

	if 'POST' == request.method:
		tmp_list = json.loads( request.POST.get(axes) )
		request.session[axes_ss] = list( set(tmp_list) )

		if IS_RELEASE:
			try:
				data = generateBackData(request)
			except Exception, e:
				rollBackSession(request, axes_ss, old_ss)
				error_dict = {'succ': False, 'msg': u'数据查询时出错'}
				return MyHttpJsonResponse(error_dict)
			else:
				backData = {'succ': True, 'data': data}
				return MyHttpJsonResponse(backData)
		else:
			data = generateBackData(request)
			backData = {'succ': True, 'data': data}
			return MyHttpJsonResponse(backData)

	else:
		return
	

def rollBackSession(request, axes_ss, old_ss):
	request.session[axes_ss] = old_ss



def __dealFilter(request):
	request.session.setdefault('_filter_', {})

	if 'POST' == request.method:
		post_data 		= request.POST
		ajax_cmd 		= post_data['cmd']
		if 'add' == ajax_cmd:
			id 				= post_data['pro_id']
			proty			= post_data['property']
			val_list 		= json.loads( post_data['val_list'] )
			
			lll 	= [( adapt(proty).getquoted() + '=' + adapt(str(x)).getquoted() ) for x in val_list]
			sen 	= ' or '.join(lll)
			print 'filter sen is: %s' % sen
			request.session['_filter_'][id] = sen
		elif 'rm' == ajax_cmd:
			id				= post_data['pro_id']			
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




def reqDrawData(request):
	if 'POST' == request.method:
		if IS_RELEASE:
			try:
				data = generateBackData(request)
			except Exception, e:
				error_dict = {'succ': False, 'msg': u'数据查询时出错'}
				return MyHttpJsonResponse(error_dict)
			else:
				backData = {'succ': True, 'data': data}
				return MyHttpJsonResponse(backData)
		else:
			data = generateBackData(request)
			backData = {'succ': True, 'data': data}
			return MyHttpJsonResponse(backData)

	else:
		return



def concertrateSqls(request):
	conn = connDb(request)
	if not conn:
		raise Exception('Cant access into database')
	cursor = conn.cursor()


	table = request.session.get('table')
	[raw_x_name_list, raw_y_name_list, raw_filter_list] = \
			map( lambda i: request.POST.get(i, []), \
				('column', 'row', 'filter') )

	[x_name_list, y_name_list] = \
			map( lambda i: json.loads(i) if i else i , \
				(raw_x_name_list, raw_y_name_list) )
			

	sql_sample_format 	= 'select {col} from {table} limit 1'
	sql_format   		= 'select {col} from {table} {filter} {option}'

	filter_sentence	= ''

	'''
	if bool(filter_list):
		filter_list = request.session['_filter_'].values()
		filter_sentence	= 'where ' + ' and '.join(filter_list)
	'''

	print 'x_name_list, y_name_list length is %s, %s' % \
						(len(x_name_list), len(y_name_list))

	def fetchOne(col_name):
		sql_sample = sql_sample_format.format(col=col_name, table=table)
		cursor.execute(sql_sample)
		re = cursor.fetchone()[0]
		return re


	if(HAVE_PDB):	pdb.set_trace()

	(bool_x, bool_y) = ( bool(x_name_list), bool(y_name_list) )
	sql_list = []

	if bool_x and bool_y:
		x_y_list = [(x, y) for x in x_name_list for y in y_name_list] 
		for (x, y) in x_y_list:
			[x_re, y_re] = map(fetchOne, (x, y))

			if isNumerical(x_re) and isNumerical(y_re):
				sql = sql_format.format(col=x+', sum(%s) %s' % (y, y), 
									table=table, filter=filter_sentence, \
									option='group by %s' % x)
			elif isNumerical(x_re) and not isNumerical(y_re):
				sql = sql_format.format(col=y+', sum(%s) %s' % (x, x), 
										table=table, filter=filter_sentence, \
										option='group by %s' % y)
			elif not isNumerical(x_re) and isNumerical(y_re):
				sql = sql_format.format(col=x+', sum(%s) %s' % (y, y), 
										table=table, filter=filter_sentence, \
										option='group by %s' % x)
			if(sql):
				sql_list.append(sql)
	
	elif bool_x or bool_y:
		one_name_list = x_name_list + y_name_list
		for one in one_name_list:
			sql_sample = sql_sample_format.format(col=one, table=table)
			cursor.execute(sql_sample)
			re = cursor.fetchone()[0]
			if isNumerical(re):
				sql = sql_format.format(col='sum(%s) %s' % (one, one), \
										table=table, filter=filter_sentence, \
										option='')
				sql_list.append(sql)

	conn.close()

	return sql_list




def generateBackData(request):
	sql_list	= concertrateSqls(request)
	(heads_list, data_list) = excSqlForData(request, sql_list)
	bar 		= vincentlizeData( (heads_list, data_list), format='bar' )

	data_json = {}
	if bar:
		bar.to_json(TEMP_DRAW_DATA_FILE)
		data_json	= readJsonFile(TEMP_DRAW_DATA_FILE)
	return data_json


def vincentlizeData(data, format):
	(heads_list, data_list) = data

	dict = {}
	for (heads, data) in zip(heads_list, data_list):
		val_list = zip(*data)
		dict['head'] = heads

		if HAVE_PDB:
			pdb.set_trace()
		for (h, t) in zip(heads, val_list):
			dict[h] = list(t)

	if not dict:
		return None

	if 'bar' == format:
		if len( dict['head'] ) == 1:
			head = dict['head'][0]
			chart = vincent.Bar( dict[head] )
		elif len( dict['head'] ) > 1:
			[x_label, y_label] = dict.pop('head', None)
			chart = vincent.Bar(dict, iter_idx=x_label)
			chart.axis_titles(x=x_label, y=y_label)
			chart.legend(title='xxxx')
	
	return chart

	
		
def perpareBackData(xList, yList):
	bool_x		= bool(xList)
	bool_y		= bool(yList)


	if bool_x and (not bool_y):
		dataList = [ xt[0] for xt in xList ]
		bar = vincent.Bar(dataList)

	elif bool_y and (not bool_x):
		dataList = [ yt[0] for yt in yList ]
		bar = vincent.Bar(dataList)

	elif bool_x and bool_y:
		print 'To Be Done'
		dict_of_iters = { 'x': xList[0], 'data': yList[0] }
		bar = vincent.Bar(dict_of_iters, iter_idx='x')
		
	else:
		return ''
	
	print 'xList, yList length is %s, %s' % ( len(xList), len(yList) )

	bar.to_json(TEMP_DRAW_DATA_FILE)
	return TEMP_DRAW_DATA_FILE

				
def readJsonFile(file):
	if not file:
		return {}

	f = open(file, 'r')
	jsonData = json.load(f, 'utf-8')
	return jsonData
	

def isNumerical(arg):
	return type(arg) in (int, float)


