from django.http import HttpResponse
from django.utils import simplejson as json
import pdb


def MyHttpJsonResponse(data):
	if isinstance(data, dict):
		return HttpResponse(json.dumps(data), content_type='application/json')
	else:
		# TBD
		return HttpResponse(data, content_type='application/json')
	

def date_handler(obj):
    return obj.isoformat() if hasattr(obj, 'isoformat') else obj



