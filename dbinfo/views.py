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
	print u'getDbInfo'
	table = request.session.get(u'table')

	conn 			= connDb(request)
	if not conn:
		return HttpResponseRedirect(u'http://10.1.50.125:9000/')

	cursor 			= conn.cursor()
	cursor.execute(u'select * from %s' % table)
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
		u'name':		table
		, u'dm':		dm_dict
		, u'me':		me_dict
	}

	return MyHttpJsonResponse(data)


def tryIntoDb(request):
	print u'try into db'

	if 'POST' == request.method:
		if connDb(request):
			request.session[u'ip'] 		= request.POST.get('ip', 	'')
			request.session[u'port'] 	= request.POST.get('port', 	'')
			request.session[u'db'] 		= request.POST.get('db', 	'')
			request.session[u'user'] 	= request.POST.get('user', 	'')
			request.session[u'pwd'] 	= request.POST.get('pwd', 	'')
			request.session[u'table'] 	= request.POST.get('table', '')

			print 'redirect to indb'
			return HttpResponseRedirect(u'/indb/')
		else:
			msg = u'cant access into database'
			return MyHttpJsonResponse( {u'succ': False, u'msg': msg} )
	else:
		context = RequestContext(request)
		return render_to_response(u'index.html', context)


def excSqlForData(request, sql_list):
	conn = connDb(request)
	if not conn:
		raise Exception(u'Cant access into database')

	cursor = conn.cursor()

	for sql in sql_list:
		print u'sql is   %s' % sql

	if HAVE_PDB:	 pdb.set_trace()

	(heads_list, data_list) = ([], [])
	try:
		for sql in sql_list:
			cursor.execute(sql)
			head = [ q[0] for q in cursor.description ]
			data = cursor.fetchall()

			print u'head is %s' % len(head)
			print u'data is %s' % len(data)

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
	
	conn_str = u'host={i} port={p} dbname={d} user={u} password={pw}'\
					.format(i=ip, p=port, d=db, u=user, pw=pwd)

	try:
		conn = pysql.connect(conn_str)
	except Exception, e:
		print u'cant conn database'
		return None
	else:
		return conn



def reqDrawData(request):
	if 'POST' == request.method:
		if IS_RELEASE:
			try:
				data = generateBackData(request)
			except Exception, e:
				error_dict = {u'succ': False, u'msg': u'数据查询时出错'}
				return MyHttpJsonResponse(error_dict)
			else:
				backData = {u'succ': True, u'data': data}
				return MyHttpJsonResponse(backData)
		else:
			data = generateBackData(request)
			backData = {u'succ': True, u'data': data}
			return MyHttpJsonResponse(backData)

	else:
		return



def concertrateSqls(request):
	conn = connDb(request)
	if not conn:
		raise Exception('Cant access into database')
	cursor = conn.cursor()

	table = request.session.get(u'table')
	[raw_x_name_list, raw_y_name_list, raw_filter_list] = \
			map( lambda i: request.POST.get(i, []), \
				(u'column', u'row', u'filter') )

	[x_name_list, y_name_list, filter_list] = \
			map( lambda i: json.loads(i) if i else i , \
				(raw_x_name_list, raw_y_name_list, raw_filter_list) )
			

	sql_sample_format 	= u'select {col} from {table} limit 1'
	sql_format   		= u'select {col} from {table} {filter} {option}'

	filter_sentence	= makeupFilterSql(filter_list)

	'''
	if bool(filter_list):
		filter_list = request.session['_filter_'].values()
		filter_sentence	= 'where ' + ' and '.join(filter_list)
	'''

	print u'x_name_list, y_name_list length is %s, %s' % \
						(len(x_name_list), len(y_name_list))

	def fetchOne(col_name):
		sql_sample = sql_sample_format.format(col=col_name, table=table)
		cursor.execute(sql_sample)
		re = cursor.fetchone()[0]
		return re


	(x_len, y_len) = ( len(x_name_list), len(y_name_list) )
	sql_list = []

	# 两个列表长度都是１
	if (1 == x_len) and (1 == y_len):
		x_y_list = [(x, y) for x in x_name_list for y in y_name_list] 
		for (x, y) in x_y_list:
			[x_re, y_re] = map(fetchOne, (x, y))

			sql = ''
			if isNumerical(x_re) and isNumerical(y_re):
				sql = sql_format.format(col=x+u', sum(%s) %s' % (y, y), 
									table=table, filter=filter_sentence, \
									option=u'group by %s order by %s' % (x, y))
			elif isNumerical(x_re) and not isNumerical(y_re):
				sql = sql_format.format(col=y+u', sum(%s) %s' % (x, x), 
										table=table, filter=filter_sentence, \
										option=u'group by %s order by %s' % (y, x))
			elif not isNumerical(x_re) and isNumerical(y_re):
				sql = sql_format.format(col=x+u', sum(%s) %s' % (y, y), 
										table=table, filter=filter_sentence, \
										option=u'group by %s order by %s' % (x, y))
			if(sql):
				sql_list.append(sql)
	
	# 一个列表长度１，一个是0
	elif 1 == (x_len + y_len):
		one_name_list = x_name_list + y_name_list
		for one in one_name_list:
			sql_sample = sql_sample_format.format(col=one, table=table)
			cursor.execute(sql_sample)
			re = cursor.fetchone()[0]
			if isNumerical(re):
				sql = sql_format.format(col=u'sum(%s) %s' % (one, one), \
										table=table, filter=filter_sentence, \
										option=u'order by %s' % (one) )
			else:
				sql = sql_format.format(col=u'%s, count(*) %s' % (one, u'number'), \
										table=table, filter=filter_sentence, \
										option=u'group by %s order by %s' % (one, u'number'))
			sql_list.append(sql)
	
	'''
	elif 2 == x_len * y_len:
		(one_attr_list, two_attrs_list) = (x_name_list, y_name_list) \
											if 1 == len(x_name_list) \
											else (y_name_list, x_name_list)
		(one_col, two_cols) = ( u'%s' % set(one_attr_list), u'%s, %s' % set(two_attrs_list) )
		[one_sql, two_sqls] = map(lambda _col: sql_format.format(col=_col, \
											table=table, filter=filter_sentence, \
											option=u'') )
		cursor.execute(one_sql)
		one_re = cursor.fetchone()[0]
		if not isNumerical(one_re):
			raise Exception e

		sql = sql_format.format(col=u'%s, %s, %s', table=table, \
								filter=filter_sentence, option=jjjjjjjjj
											

		one_sql_format = sql_format.format(col=u'%s' % (one), \
											table=table, filter=filter_sentence, \
											option=u'')
		one_re = cursor.execute(one_sql_format)
		if not isNumerical(one_re):
			raise Exception e

		sql_iter = sql_format.format(col=u'%s' % (one), \
										table=table, filter=filter_sentence, \
										option=u'group by %s' % one)

	
	# 一个是1，一个长度大于１
	elif x_len + y_len > 1:
		raise Exception()
	'''



	conn.close()

	return sql_list


def makeupFilterSql(filter_list):
	if(HAVE_PDB):	pdb.set_trace()

	if type(filter_list) != list \
		or 0 == len(filter_list):
		return u''

	sens = []
	for filter_dict in filter_list:
		property = filter_dict.get(u'property')
		calc	 = filter_dict.get(u'calc', '')

		val_list = json.loads( filter_dict.get(u'val_list') )

		lll = []
		for x in val_list:
			if(HAVE_PDB):	pdb.set_trace()
			x = x if type(x) == u'unicode' else unicode(x)  
			#lll.append( property + '=' + adapt(x).getquoted() ) 
			lll.append( property + u'=' + x ) 

		sens.append( u' or '.join(lll) ) 
	
	return u'where ' + u' and '.join(sens)



def generateBackData(request):
	sql_list	= concertrateSqls(request)
	(heads_list, data_list) = excSqlForData(request, sql_list)
	bar 		= vincentlizeData( (heads_list, data_list), format=u'area' )

	data_json = {}
	if bar:
		bar.to_json(TEMP_DRAW_DATA_FILE)
		data_json	= readJsonFile(TEMP_DRAW_DATA_FILE)
	return data_json


def vincentlizeData(data, format):
	(heads_list, data_list) = data

	print u'.......heads_list len = %s, data_list len is %s' % \
				( len(heads_list), len(data_list) )

	dict = {}
	for (heads, data) in zip(heads_list, data_list):
		val_list = zip(*data)
		dict[u'head'] = heads

		if HAVE_PDB: 	pdb.set_trace()

		for (h, t) in zip(heads, val_list):
			dict[h] = list(t)

	if not dict:
		return None

	if HAVE_PDB: 	pdb.set_trace()

	if u'bar' == format:
		if len( dict[u'head'] ) == 1:
			head = dict[u'head'][0]
			chart = vincent.Bar( dict[head] )
		elif len( dict[u'head'] ) > 1:
			[x_label, y_label] = dict.pop(u'head', None)
			chart = vincent.Bar(dict, iter_idx=x_label)
			chart.axis_titles(x=x_label, y=y_label)
			chart.legend(title=u'xxxx')
	if u'line' == format:
		if len( dict[u'head'] ) == 1:
			head = dict[u'head'][0]
			chart = vincent.Line( dict[head] )
		elif len( dict[u'head'] ) > 1:
			[x_label, y_label] = dict.pop(u'head', None)
			chart = vincent.Line(dict, iter_idx=x_label)
			chart.axis_titles(x=x_label, y=y_label)
			chart.legend(title=u'xxxx')
	if u'area' == format:
		if len( dict[u'head'] ) == 1:
			head = dict[u'head'][0]
			chart = vincent.Area( dict[head] )
		elif len( dict[u'head'] ) > 1:
			[x_label, y_label] = dict.pop(u'head', None)
			chart = vincent.Area(dict, iter_idx=x_label)
			chart.axis_titles(x=x_label, y=y_label)
			chart.legend(title=u'xxxx')

	if u'pie' == format:
		if len( dict['head'] ) == 2:
			[x_label, y_label] = dict.pop(u'head', None)
			(x_list, y_list) = ( dict[x_label], dict[y_label] )
			dict = dict( zip(x_list, y_list) )
			chart = vincent.Pie(dict)
			chart.legend(title=u'xxxx')
			
	
	return chart

	
		
def readJsonFile(file):
	if not file:
		return {}

	f = open(file, u'r')
	jsonData = json.load(f, u'utf-8')
	return jsonData
	

def isNumerical(arg):
	return type(arg) in (int, float)


