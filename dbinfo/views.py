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

import pdb

def getDbInfo(request):
	tableName = Smart._meta.db_table
	numFields = {}
	nanFields = {}

	for each in Smart._meta.get_all_field_names():
		fieldType = Smart._meta.get_field(each).get_internal_type()
		if( (u'IntegerField' == fieldType) or (u'FloatField' == fieldType) ):
			nanFields[each] = None
		else:
			values = list( Smart.objects.values(each).distinct().values_list(each, flat=True) )
			numFields[each] = values

	dbInfo = {
		'name': 				tableName
		, 'num_fields':			numFields
		, 'nan_fields':			nanFields
	}


	return HttpResponse( json.dumps(dbInfo), content_type="application/json" )


def tryIntoDb(request):
	ip 		= request.POST.get('ip', 	'')
	port 	= request.POST.get('port', 	'')
	db 		= request.POST.get('db', 	'')
	user 	= request.POST.get('user', 	'')
	pwd 	= request.POST.get('pwd', 	'')
	table 	= request.POST.get('table', '')
	context = RequestContext(request)

	connDbInput = (ip, port, db, user, pwd)
	
	if connectDb(connDbInput):
		request.session[u'_ip_'] 		= ip
		request.session[u'_port_'] 		= port
		request.session[u'_db_'] 		= db
		request.session[u'_user_'] 		= user
		request.session[u'_pwd_'] 		= pwd
		request.session[u'_table_'] 	= table

		return render_to_response('index.html', context)
	else:
		msg = 'cant access into database'
		return HttpResponse( json.dumps({'succ': False, 'msg':msg}), context )



def connectDb(dbInput):
	try:
		conn = pysql.connect( 
			'host=%s port=%s dbname=%s user=%s password=%s' % \
			dbInput 
		)
	except Exception, e:
		return None
	else:
		return conn

	

def selectData(request):
	# 如果时间过了很久，这里要判断session是否失效了
	conn = connectDb( 
		( request.session[u'_ip_'] 	  
		, request.session[u'_port_']  
		, request.session[u'_db_'] 	  
		, request.session[u'_user_']  
		, request.session[u'_pwd_']  )
	)

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


def addSelect(request):
	# 如果时间过了很久，这里要判断session是否失效了

	reqSelX 	= json.loads( request.POST.get('x', u'[]') )
	reqSelY 	= json.loads( request.POST.get('y', u'[]') )
	alreadyX 	= request.session.setdefault('_x_', [])
	alreadyY 	= request.session.setdefault('_y_', [])

	# 不接受相同变量
	request.session['_x_'] = list( set(alreadyX + reqSelX) )
	request.session['_y_'] = list( set(alreadyY + reqSelY) )

	try:
		data = generateBackData(request)
	except Exception, e:
		# 从session中roll back
		rollBackSessionXY(request, alreadyX, alreadyY)
		errorMsg = {'succ': False, 'msg': e.msg}
		return HttpResponse( json.dumps(errorMsg), content_type='application/json' )
	else:
		backData = {'succ': True, 'data': data}
		return HttpResponse( json.dumps(backData), content_type='application/json' )


def rmSelect(request):
	# 有相同变量也只考虑一次，因为add流程中保证了session_x_等都不会有重复值
	reqSelX 	= list( set(json.loads( request.POST.get('x', u'[]') )) )
	reqSelY 	= list( set(json.loads( request.POST.get('y', u'[]') )) )

	alreadyX 	= request.session.setdefault('_x_', [])
	alreadyY 	= request.session.setdefault('_y_', [])

	if bool(reqSelX):
		if any(x in alreadyX for x in reqSelX):
			request.session['_x_'] = alreadyX - reqSelX
		else:
			msg = 'some unknown factor is in X axis'
	elif bool(reqSelY):
		if any(y in alreadyY for y in reqSelY):
			request.session['_y_'] = alreadyY - reqSelY
		else:
			msg = 'some unknown factor is in Y axis'

	try:
		data = generateBackData(request)
	except Exception, e:
		# 从session中roll back
		rollBackSessionXY(request, alreadyX, alreadyY)
		errorMsg = {'succ': False, 'msg': e.msg}
		return HttpResponse( json.dumps(errorMsg), content_type='application/json' )
	else:
		backData = {'succ': True, 'data': data}
		return HttpResponse( json.dumps(backData), content_type='application/json' )

	

def addValListFilter(request, id):
	pdb.set_trace()
	filters = json.loads( request.POST.get('f') )
	request.session.setdefault('_filter_', {})

	for each in filters:
		id 		= each['id']
		proty 	= each['property']
		valList = each['val_list']
		lll 	= [ (proty + '=' + str(x)) for x in valList ]
		sen 	= ' or '.join(lll)
		request.session['_filter_'][id] = sen

	data = generateBackData(request)
	backData = {'succ': True, 'data': data}

	return HttpResponse( json.dumps(backData), content_type='application/json' )


def addCalcFilter(request):
	filters = json.loads( request.POST.get('f') )
	request.session.setdefault('_filter_', {})


def rmFilter(request):
	filters 	= json.loads( request.POST.get('f') )
	seFilters 	= request.session.setdefault('_filter_', {})

	for key in filters:
		if key in request.session['_filter_']:
			del request.session['_filter_'][key]

	try:
		data = generateBackData(request)
	except Exception, e:
		# 从session中roll back
		errorMsg = {'succ': False, 'msg': e.msg}
		return HttpResponse( json.dumps(errorMsg), content_type='application/json' )
	else:
		backData = {'succ': True, 'data': data}
		return HttpResponse( json.dumps(backData), content_type='application/json' )
	


def generateBackData(request):
	(xList, yList) = selectData(request)
	perpareBackData(xList, yList)

	data = readJsonFile('')
	return data

def rollBackSessionXY(request, alreadyX, alreadyY):
	request.session['_x_'] = alreadyX
	request.session['_y_'] = alreadyY
	return 
			

	
		
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
	
