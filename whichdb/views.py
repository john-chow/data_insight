# Create your views here.
from whichdb.models import UsedDb
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import simplejson as json
from django.template import RequestContext

from whichdb.forms import ConnDbForm
from common.head import *

def showDbForChosen(request):
	if 'POST' == request.method:
		form = ConnDbForm(request.POST)
		if form.is_valid():
			return HttpResponseRedirect('/indb/')
	else:
		form = ConnDbForm


	data = {
		'form':				form
		, 'supported_dbs':	SUPPORTED_DBS
	}
	context = RequestContext(request)

	return render_to_response('list_dbs.html', data, context)





def test(request):
	return HttpResponse("Just for test")


