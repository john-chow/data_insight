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


def excSqlForData(request, sql_list):
	conn = connDb(request)
	if not conn:
		raise Exception('Cant access into database')

	cursor = conn.cursor()

	for sql in sql_list:
		print 'sql is   %s' % sql

	if HAVE_PDB:	 pdb.set_trace()

	(heads_list, data_list) = ([], [])
	try:
		for sql in sql_list:
			cursor.execute(sql)
			head = [ q[0] for q in cursor.description ]
			data = cursor.fetchall()

			print 'head is %s' % len(head)
			print 'data is %s' % len(data)

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

	[x_name_list, y_name_list, filter_list] = \
			map( lambda i: json.loads(i) if i else i , \
				(raw_x_name_list, raw_y_name_list, raw_filter_list) )
			

	sql_sample_format 	= 'select {col} from {table} limit 1'
	sql_format   		= 'select {col} from {table} {filter} {option}'

	filter_sentence	= makeupFilterSql(filter_list)

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


def makeupFilterSql(filter_list):
	if(HAVE_PDB):	pdb.set_trace()

	if type(filter_list) != list \
		or 0 == len(filter_list):
		return ''

	sens = []
	for filter_dict in filter_list:
		property = filter_dict.get('property')
		calc	 = filter_dict.get('calc', '')

		val_list = json.loads( filter_dict.get('val_list') )

		lll = []
		for x in val_list:
			x = x if type(x) == 'unicode' else unicode(x)  
			lll.append( property + '=' + adapt(x).getquoted() ) 

		sens.append( ' or '.join(lll) ) 
	
	return 'where ' + ' and '.join(sens)



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

	print '.......heads_list len = %s, data_list len is %s' % \
				( len(heads_list), len(data_list) )

	dict = {}
	for (heads, data) in zip(heads_list, data_list):
		val_list = zip(*data)
		dict['head'] = heads

		if HAVE_PDB: 	pdb.set_trace()

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

	
		
def readJsonFile(file):
	if not file:
		return {}

	f = open(file, 'r')
	jsonData = json.load(f, 'utf-8')
	return jsonData
	

def isNumerical(arg):
	return type(arg) in (int, float)


