from django.http import HttpResponse
from django.utils import simplejson as json


def MyHttpJsonResponse(data):
	if isinstance(data, dict):
		return HttpResponse( json.dumps(data), content_type='application/json' )
	else:
		# TBD
		return 
	

def date_handler(obj):
    return obj.isoformat() if hasattr(obj, 'isoformat') else obj
