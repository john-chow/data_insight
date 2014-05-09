# -*- coding: utf-8 -*-

# Create your views here.
from django.utils import simplejson as json
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext
from psycopg2.extensions import adapt
from collections import OrderedDict
from django.core.urlresolvers import reverse

import psycopg2 as pysql
import logging
import datetime as dt
import time
from dbinfo.echart import EChartManager
from common.head import *
from common.tool import *

import pdb


def getTableInfo(request):
	print '********		getTableInfo  *********'
	tables = request.session.get(u'tables')

	conn 			= connDb(request)
	if not conn:
		print 'redirect to login'
		#return HttpResponseRedirect(u'http://10.1.50.125:9000/')
		return HttpResponseRedirect(reverse('whichdb.showDbForChosen'))
	cursor 			= conn.cursor()

	data_list = []
	for t in tables:
		cursor.execute(u'select * from %s' % t)
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
				#dm_dict[name] = json.dumps(val_list, default=date_handler)
				dm_dict[name] = val_list

		data = {
			u'name':		t
			, u'dm':		dm_dict
			, u'me':		me_dict
		}
		data_list.append(data)
	
	res_dict = {u'succ': True, u'data':	data_list}

	return MyHttpJsonResponse(res_dict)


def tryIntoDb(request):
	print '********		tryIntoDb  		*********'

	if 'POST' == request.method:
		if connDb(request):
			request.session[u'ip'] 		= request.POST.get('ip', 	'')
			request.session[u'port'] 	= request.POST.get('port', 	'')
			request.session[u'db'] 		= request.POST.get('db', 	'')
			request.session[u'user'] 	= request.POST.get('user', 	'')
			request.session[u'pwd'] 	= request.POST.get('pwd', 	'')

			tables_list = getTableList(request)
			return MyHttpJsonResponse( {u'succ': True, \
										u'data': json.dumps(tables_list)} )
		else:
			msg = u'cant access into database'
			#return MyHttpJsonResponse( {u'succ': False, u'msg': msg} )

	else:
		context = RequestContext(request)
		return render_to_response(u'index.html', context)



def reqDrawData(request):
	print '********		reqDrawData  *********'
	if 'POST' == request.method:
		if IS_RELEASE:
			try:
				logging.debug('reqDrawData is running')
				post_data = json.loads(request.POST.get(u'data', u'{}'), 
											object_pairs_hook=OrderedDict)
				data = generateBackData(post_data, request)
			except Exception, e:
				print "catch Exception: %s" % e
				error_dict = {u'succ': False, u'msg': str(e)}
				return MyHttpJsonResponse(error_dict)
			else:
				backData = {u'succ': True, u'data': data}
				return MyHttpJsonResponse(backData)
		else:
			post_data = json.loads(request.POST.get(u'data', u'{}'), 
										object_pairs_hook=OrderedDict)
			data = generateBackData(post_data, request)
			backData = {u'succ': True, u'data': data}
			return MyHttpJsonResponse(backData)
	else:
		return


def makeupFilterSql(filter_list):
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
			x = x if type(x) == u'unicode' else unicode(x)  
			#lll.append( property + '=' + adapt(x).getquoted() ) 
			lll.append( property + u'=' + x ) 

		sens.append( u' or '.join(lll) ) 
	
	return u'where ' + u' and '.join(sens)



def generateBackData(post_data, request):
	if HAVE_PDB:		pdb.set_trace()
	#post_data 					= json.loads(request.POST.get(u'data', u'{}'), \
	#											object_pairs_hook=OrderedDict)

	# 地图先特殊对待
	if 'china_map' == post_data.get(u'graph') or \
			'world_map' == post_data.get(u'graph'):
		data = formatData('', '', '', '', post_data.get(u'graph'))
		return data

	shape_list, shape_in_use 	= judgeWhichShapes(post_data)
	shape_in_use 				= post_data.get(u'graph', u'bar')
	chart_data 					= getDrawData(post_data, shape_in_use, request)

	return chart_data


def getDrawData(post_data, shape_in_use, request):
	# 先看请求里面分别有多少个文字类和数字类的属性
	msn_list, msu_list, group_list = calc_msu_msn_list(post_data)

	# 从数据库中找出该图形要画得数据
	data_from_db = searchDataFromDb(request, post_data, msu_list, msn_list, group_list)

	# 用echart格式化数据
	echart_data = formatData(data_from_db, msu_list, msn_list, group_list, shape_in_use)

	return echart_data

	


def calc_msu_msn_list(post_data):
	""" 
	计算出 measure_list, mension_list
	这里每个List里面单元的构造是 (name, kind, cmd, x_y)
	name: 表示属性名字; 
	kind: 表示是文字列还是数字列，0表示
	cmd:  表示运算符号，'sum','avg'等等
	x_y:  表示属于哪个轴，值有x、y，还有'group'
	"""

	[col_kind_attr_list, row_kind_attr_list] = \
			map( lambda i: post_data.get(i, []), \
					(u'column', u'row') \
				) 


	# echart 最多支持 1*2 的属性
	col_len, row_len =  len(col_kind_attr_list), len(row_kind_attr_list) 
	if col_len > 2 or row_len > 2 or (col_len == 2 and row_len == 2):
		raise Exception(u'Can not draw it in baidu-echart')
	if 0 == col_len and 0 == row_len:
		raise Exception(u'Thers is no value column')

	msn_list, msu_list = [], []

	len_col_attr_list = len(col_kind_attr_list)
	for idx, attr_kind_cmd in enumerate(col_kind_attr_list + row_kind_attr_list):
		col_row_flag = u'col' if idx < len_col_attr_list else u'row'
		attr_kind_cmd_tuple = tuple( attr_kind_cmd.values() )
		tmp_attr_list = msn_list if u'rgl' == attr_kind_cmd[u'cmd'] \
										else msu_list
		tmp_attr_list.append( attr_kind_cmd_tuple + (col_row_flag,) )

	# xxx
	group_list = []
	color_attr = post_data.get( u'color', u'' )
	if color_attr:
		group_list.append( (color_attr, 2, u'', u'group') )


	return msn_list, msu_list, group_list
	


def searchDataFromDb(request, post_data, msu_list, msn_list, group_list):
	if HAVE_PDB:		pdb.set_trace()

	"""
	要保证select的顺序是 measure、mension、group
	"""
	filters_list 	= json.loads( post_data.get(u'filter', u'[]') )
	filter_sentence	= makeupFilterSql(filters_list)


	# 处理 msu_list
	sel_str_list, group_str_list, combine_flag = [], [], False
	for (attr_name, kind, cmd, x_y) in msu_list:
		if 'sum' == cmd:
			sel_str_list.append( 'sum(%s) %s' % (attr_name, attr_name) )
			combine_flag = True
		elif 'avg' == cmd:
			sel_str_list.append( 'avg(%s) %s' % (attr_name, attr_name) )
			combine_flag = True
		else:
			sel_str_list.append(attr_name)

	if HAVE_PDB:		pdb.set_trace()

	# 处理 msn_list
	for (attr_name, kind, cmd, x_y) in msn_list:
		if combine_flag:
			group_str_list.append(attr_name)
		else:
			sel_str_list.append(attr_name)

	# 处理 group_list
	group_str_list.extend( [ attr_name for (attr_name, _, _, __) in group_list ] )
	sel_str_list += group_str_list

	#map(lambda i: i.extend([attr for (attr, _, _, _) in group_list]), \
												#(sel_str_list, group_attr_list) )

	# 以第一个类目属性做group by参数，其他的全部做成where条件
	sql_template = u'select {attrs} from {table} {filter} {option}'
	table_name 	 = post_data[u'table']

	group_str = u''
	if len(group_str_list) > 0 and combine_flag:
		group_str = 'group by ' + u','.join(group_str_list)

	sel_str = u', '.join(sel_str_list)
	sql 	= sql_template.format(attrs=sel_str, table=table_name, \
									filter=filter_sentence, option=group_str)

	conn 		= connDb(request)
	cursor 		= conn.cursor()
	cursor.execute(sql)
	data 		= cursor.fetchall()
	
	return data


def judgeWhichShapes(post_data):
	shape_list = []
	
	return (shape_list, '')



def formatData(data_from_db, msu_list, msn_list, group_list, shape_in_use):
	echart = EChartManager().get_echart(shape_in_use)
	return echart.makeData(data_from_db, msu_list, msn_list, group_list)

