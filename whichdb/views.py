# Create your views here.
from whichdb.models import UsedDb
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.utils import simplejson as json
from django.template import RequestContext

import pdb

def showDbForChosen(request):
	recentlyDbs = list( UsedDb.objects.all()[:4].values() )

	data = {
		'dbs': recentlyDbs
	}

	context = RequestContext(request)

	return render_to_response('list_dbs.html', data, context)


