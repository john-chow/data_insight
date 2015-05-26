#from django.test import TestCase, TransactionTestCase
from unittest import TestCase
from .models import WidgetModel, ExternalDbModel
from skin.models import SkinModel
import common.protocol as Protocol
import pdb

class WidgetTestCase(TestCase):
    def setUp(self):
        ExternalDbModel.objects.get_or_create(pk = -1128545934, \
            m_kind = 'postgres', m_user = 'postgres', m_pwd = '123', \
            m_ip = '127.0.0.1', m_port = '5432', m_db = 'data_insight' \
        )
        SkinModel.objects.get_or_create(pk = 1, m_cat=2)

    def test_restoreReqDataDict(self):
        test_pk = 3
        widget = WidgetModel.objects.get(pk=test_pk)
        self.assertIsInstance(1, int)
        data_dict = widget.restoreReqDataDict()
        self.assertIsInstance(
            data_dict.get(Protocol.Xaxis), list
        )
        self.assertIsInstance(
            data_dict.get(Protocol.Graph), unicode
        )

    def test_save(self):
        name = 'test'
        x = [{
            u'table': u'\u4fe1\u7528\u5361'
            , u'kind': u'T'
            , u'calcFunc': u'none'
            , u'name': u'\u65e5\u671f'
            , u'title': u'\u65e5\u671f'
        }]
        y = [{
            u'table': u'\u4fe1\u7528\u5361'
            , u'kind': u'N'
            , u'calcFunc': u'sum'
            , u'name': u'\u6d88\u8d39\u4ea4\u6613'
            , u'title': u'\u6d88\u8d39\u4ea4\u6613'
            }
            , {u'table': u'\u4fe1\u7528\u5361'
                , u'kind': u'N'
                , u'calcFunc': u'sum'
                , u'name': u'\u9000\u8d27\u4ea4\u6613'
                , u'title': u'\u9000\u8d27\u4ea4\u6613'
            }
        ] 
        color = {}
        size = {}
        graph = 'line'
        pic = ''
        refresh = ''
        status = True
        skin = SkinModel.objects.get(pk = 1)
        filter = []
        order = {}
        external = ExternalDbModel.objects.get(pk = -1128545934)

        WidgetModel.objects.update_or_create(
            m_name = name, m_x = x, m_y = y, m_color = color, m_size = size
            , m_graph = graph, m_pic = pic, m_refresh = refresh, m_skin = skin
            , m_status = status , m_filter = filter, m_order = order
            , m_external_db = external
        )
        self.assertTrue(1==1)

