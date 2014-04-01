# -*- coding: utf-8 -*-

# Create your views here.
from dbinfo.models import Smart
from django.utils import simplejson as json
from django.shortcuts import render_to_response
from django.http import HttpResponse
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

	connDbInput = (ip, port, db, user, pwd)
	
	if connectDb(connDbInput):
		request.session[u'ip'] 		= ip
		request.session[u'port'] 	= port
		request.session[u'db'] 		= db
		request.session[u'user'] 	= user
		request.session[u'pwd'] 	= pwd
		request.session[u'table'] 	= table

		context = RequestContext(request)
		return render_to_response('index.html', context)
	else:
		return HttpResponse('NO NO NO!')



def connectDb(dbInput):
	try:
		conn = pysql.connect( 
			'host=%s port=%s dbname=%s user=%s password=%s' % \
			dbInput 
		)
	except Exception, e:
		print 'Cant access into db, $s' % e
		pdb.set_trace()
		return None
	else:
		return conn

	

def selectData(request):
	# 如果时间过了很久，这里要判断session是否失效了
	conn = connectDb( 
		( request.session[u'ip'] 	  
		, request.session[u'port']  
		, request.session[u'db'] 	  
		, request.session[u'user']  
		, request.session[u'pwd']  )
	)


	''' 拼凑sql语句中查询x、y列表部分 '''
	xList 		= request.session.setdefault('_x_', [])
	yList 		= request.session.setdefault('_y_', [])
	filterList 	= request.session.setdefault('filter', {})

	table 	= request.session['table']
	sel		= 'select %s from %s %s' 
	filterSen = ''
	selX = ''
	selY = ''
	
	if bool(filterList):
		filterSenList = request.session['filter'].values()
		filterSen	= 'where ' + ' and '.join(filterSenList)

	if bool(xList):
		selX	= ','.join(xList)

	if bool(yList):
		selY 	= ','.join(yList)
	
	sqlX = ''
	sqlY = ''
	if bool(selX):
		sqlX	= sel % (selX, table, filterSen)
	if bool(selY):
		sqlY	= sel % (selY, table, filterSen)


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
		print 'exception'
		pass
	else:
		return (resultsX, resultsY)
	finally:
		conn.close()


def addSelect(request):
	# 如果时间过了很久，这里要判断session是否失效了

	reqSelX 	= json.loads( request.POST.get('x', u'[]') )
	reqSelY 	= json.loads( request.POST.get('y', u'[]') )
	request.session.setdefault('_x_', [])
	request.session.setdefault('_y_', [])
	request.session['_x_'] += reqSelX
	request.session['_y_'] += reqSelY

	#try:
	data = generateBackData(request)
	#except Exception, e:
		# 从session中roll back
		#print 'run sql error'
		#errorMsg = {'succ': False, 'msg': ''}
		#return HttpResponse( json.dumps(errorMsg), content_type='application/json' )
	#else:
	backData = {'succ': True, 'data': data}
	return HttpResponse( json.dumps(backData), content_type='application/json' )
	


def addValListFilter(request):
	filters = json.loads( request.POST.get('f') )
	request.session.setdefault('filter', {})

	def fun(p, x):
		return (p + '=' + x)

	for each in filters:
		id 		= each['id']
		proty 	= each['property']
		valList = each['val_list']
		lll 	= [ (proty + '=' + str(x)) for x in valList ]
		sen 	= ' or '.join(lll)
		request.session['filter'][id] = sen

	data = generateBackData(request)

	return HttpResponse( json.dumps(data), content_type='application/json' )


def generateBackData(request):
	(xList, yList) = selectData(request)
	perpareBackData(xList, yList)

	data = readJsonFile('')
	return data
			


def addOperInfoToSession(request):
	for (key, val) in zip( request.POST.keys(), request.POST.values() ):
		request.session.setdefault( key + 'all', [] )
		request.session[key].append(val)
	
		
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
	
