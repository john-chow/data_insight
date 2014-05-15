from django.http import HttpResponse
from django.utils import simplejson as json
import psycopg2 as pysql
import datetime
import random
import pdb

def connDb(request, source=u'session'):
	conn_data_dict = request.session if u'session' == source \
										else request.POST
	[ip, port, table, db, user, pwd] = \
		map( lambda i: conn_data_dict.get(i, ''), \
			('ip', 'port', 'table', 'db', 'user', 'pwd') \
		)
	
	conn_str = u'host={i} port={p} dbname={d} user={u} password={pw}'\
					.format(i=ip, p=port, d=db, u=user, pw=pwd)

	try:
		conn = pysql.connect(conn_str)

	except Exception, e:
		return None
	else:
		return conn


def MyHttpJsonResponse(data):
	if isinstance(data, dict):
		return HttpResponse(json.dumps(data), content_type='application/json')
	else:
		# TBD
		return HttpResponse(data, content_type='application/json')
	

def date_handler(obj):
    return obj.isoformat() if hasattr(obj, 'isoformat') else obj



def cvtDateTimeToStr(dt=datetime.datetime.now()):
	if not isinstance(dt, datetime.datetime):
		return dt

	return dt.strftime("%Y%m%d%H%M%S")


def UniqIdGenerator():
	seed = random.getrandbits(8)
	while True:
		yield seed
		seed += 1

def GetUniqueIntId():
	gen = UniqIdGenerator()
	return gen.next()






