# Create your views here.

from mould import models

@login_required
def mouldCreate(request):
    if 'POST' == request.method:
        pass
    else 'GET' == request.method:
        pass

def mouldList(request):
    if 'GET' == request.method:
        pass
    else:
        raise Http404()


