# --*-- encoding: utf-8 --*--
#Filename:  echart.py

import pdb
from common.head import *
import common.protocol as Protocol
from widget.map import getCityPM2dot5, getRailLine
from common.log import logger
from common.tool import uniqList
from common import globals as G


class EChart(object):
    def makeData(self, data_from_db, factors):
        data_width = len(data_from_db[0]) if len(data_from_db) > 0 else len(factors)
        if data_width != len(factors):
            raise Exception('logical error')

        heads = []
        for fc in factors:
            name = fc.getProperty(Protocol.Attr)
            location = fc.getProperty(Protocol.Location)
            heads.append({
                'name':         name
                , 'location':   location
            })

        return {
            'heads':    heads
            , 'data':   data_from_db
        }

class Bar_Line_Base(EChart):
    def makeData(self, data_from_db, factors):
        locations_idx = [idx for idx, fc in enumerate(factors) \
                        if fc.getProperty(Protocol.Location) in ('group')]
        cats_idx = [idx for idx, fc in enumerate(factors) \
                        if fc.getProperty(Protocol.Kind) != Protocol.NumericType \
                        and fc.location in ('col', 'row')]
 
        # 找出cats的data
        if len(cats_idx) < 1:
            raise Exception('')

        cat_idx = cats_idx[0]
        cat_fc  = factors[cat_idx]

        pivot_data_from_db = map(list, zip(*data_from_db))
        cats_data = uniqList(pivot_data_from_db[cat_idx])

        # 找出legend的data，并且把数据按legend分为每个series
        if locations_idx:
            legend_idx = locations_idx[0]
            legends = uniqList(pivot_data_from_db[legend_idx])
            data = self.dispart(data_from_db, idx, legends)
        else:
            data = [('', data_from_db)]

        series  = self.calcSeries(data, factors, cats_data, cat_idx)
        legend_items = {
            'data':  [item.get('name') for item in series]
        }

        # 查询时各列的信息
        head = [{
            'name':         fc.getProperty(Protocol.Attr)
            , 'location':   fc.getProperty(Protocol.Location)
        } for fc in factors]

        # 配置轴信息
        category_item = {
            'type':     'category'
            , 'data':   cats_data
        }
        value_item =  {
            'type':     'value'
        }

        xAxis, yAxis = (category_item, value_item) \
                            if 'row' == cat_fc.location \
                            else (value_item, category_item)

        return {
            'head':         head
            , 'legend':     legend_items
            , 'xAxis':      xAxis
            , 'yAxis':      yAxis
            , 'series':     series
        }


    def dispart(self, data_from_db, idx, legends):
        '''
        根据group列的结果，对数据库查询结果数据进行拆分
        idx 表示第几列是group列
        '''
        data = [(le, [data_from_db[i] \
                    for i, row in enumerate(data_from_db) \
                    if row[idx] == le]) \
                    for le in legends] 
        return data


    def calcSeries(self, data, factors, cats_data, cat_idx):
        '''
        有多个数字列，按类分
        '''
        colidx_colnames = [(col_idx, fc.getProperty(Protocol.Attr)) \
                    for col_idx, fc in enumerate(factors) \
                    if Protocol.NumericType == fc.getProperty(Protocol.Kind)]

        mul_valaxis_flag = True if len(colidx_colnames) > 1 else False

        result = []
        for bf_legend, part_data in data:
            dim_data = map(list, zip(*part_data))
            for col_idx, name in colidx_colnames:
                # 把legend拼在一起
                one_legend      = bf_legend + name if mul_valaxis_flag else bf_legend
                one_cats, one_series = dim_data[cat_idx], dim_data[col_idx]

                # 系列中缺少的cat时，补上(cat, '')组合
                to_supply_cats_series = [(c, '') for c in cats_data if c not in one_cats]
                after_supply_cats_series = zip(one_cats, one_series) + to_supply_cats_series

                sorted_one_cats_series \
                        = sorted(after_supply_cats_series, key = lambda x: cats_data.index(x[0]))
                final_series = [item[1] for item in sorted_one_cats_series]

                result.append({
                    'name':     one_legend
                    , 'data':   final_series
                    , 'type':   self.type
                })

        return result


    def makeAddData(self, data_tuple_list, msu_len, msn_len, group_len):
        """
        组成补充的数据
        """
        cat_list, val_list = [], []
        for data_tuple in data_tuple_list:
            msu_list    = list(data_tuple[:msu_len])
            [cat]       = list(data_tuple[msu_len:msu_len + msn_len])
            group_list  = list(data_tuple[msu_len + msn_len:])

            group_name = group_list[0] if len(group_list) > 0 else ''
            msu_val    = msu_list[0]
            le_val = {'le': group_name, 'val': msu_val}
            val_list.append(le_val)
            cat_list.append(cat)

        return {
            'cat':          list(set(cat_list))
            , 'le_val':     val_list
        }


class Bar(Bar_Line_Base):
    def __init__(self):
        self.type = u'bar'
                
class Line(Bar_Line_Base):
    def __init__(self):
        self.type = u'line'

class Area(Bar_Line_Base):
    def __init__(self):
        self.type = u'area'


class Table(EChart):
    def makeData(self, data_from_db, msu_factor_list, msn_factor_list, group_factor_list):
        if len(group_factor_list) > 0:
            raise Exception('xxxxxxxxxxxx')
        heads = [factor.getProperty(Protocol.Attr) \
                    for factor in (msu_factor_list + msn_factor_list)]
        return {
            'heads':        heads
            , 'contents':   data_from_db
        }
            

class Scatter(EChart):
    def makeData(self, data_from_db, factors):
        head = [{
            'name':         fc.getProperty(Protocol.Attr)
            , 'location':   fc.location
        } for fc in factors]

        xAxis, yAxis = {'type': 'value'}, {'type': 'value'}

        return {
            'head':     head
            , 'xAxis':  xAxis
            , 'yAxis':  yAxis
            , 'series':   [{
                'type':     'scatter'
                , 'data':   data_from_db
            }]
        }

class PartitionBase(EChart):
    def makeData(self, data_from_db, factors):
        cats_idx    = [idx for idx, fc in enumerate(factors) \
                        if fc.getProperty(Protocol.Kind) != Protocol.NumericType \
                        and fc.location in ('col', 'row')]
        values_idx  = [idx for idx, item in enumerate(factors) \
                            if idx not in cats_idx]
        if len(cats_idx) > 1 or len(values_idx) < 1:
            raise Exception('')

        cat_idx     = cats_idx[0]
        pivot_data  = map(list, zip(*data_from_db))

        legend = {
            'data': uniqList(pivot_data[cat_idx])
        }

        series = []
        for val_idx in values_idx:
            zipped = zip(pivot_data[cat_idx], pivot_data[val_idx])
            one_series_data = [{
                'name':     item[0]
                , 'value':  item[1]
            } for item in zipped]
            series.append({
                'type':     self.type
                , 'data':   one_series_data
            })

        return {
            'legend':       legend
            , 'series':     series
        }


class Pie(PartitionBase):
    def __init__(self):
        self.type = 'pie'

class Funnel(PartitionBase):
    def __init__(self):
        self.type = 'funnel'


class Radar(EChart):
    def makeData(self, data_from_db, msu_factor_list, msn_factor_list, group_factor_list):
        # 画图的条件应该是1个mension列，至少3个measure列，且不能有group列
        if len(msn_factor_list) != 1 or len(msu_factor_list) < 3 or len(group_factor_list) > 0:
            raise Exception(u'cant draw radar')

        # 数据库查询最后一列的结果是种类的名称列表
        legend_series_data = [{
            u"value"    : tuple(row_data)[:-1]
            , u"name"   : tuple(row_data)[-1]
        } for row_data in data_from_db]

        # 找到每个列中最大值
        indicator = [{
            u"text":                factor.getProperty(Protocol.Attr)
            , u"max":               max([a[i] for a in data_from_db])        
        } for i, factor in enumerate(msu_factor_list)]

        return {
            u'legend_series':       legend_series_data
            , u'indicator':         indicator
        }


class Map():
    def __init__(self):
        self.option = {
            u'title': {}
            , u'tooltip':       {}
            , u'legend':        {
                u'origent':     u'vertical'
                , u'x':         u'left'
                , u'data':      []
            }
            , u'toolbox':       {
                u'show' :               True,
                u'orient' :             'vertical',
                u'x':                   'right',
                u'y':                   'center',
                u'feature' : {
                    u'mark' :           {u'show': True},
                    u'dataView' :       {u'show': True, u'readOnly': False},
                    u'restore' :        {u'show': True},
                    u'saveAsImage' :    {u'show': True}
                }
            }
            , u'series':        [
            ]
        }

    def makeData(self, data_from_db, msu_factor_list, msn_factor_list, group_factor_list):
        pass
        """
        self.option[u'series'].append( \
            self.makeSeriesUnit() \
        )
        """


    def makeSeriesUnit(self, name='', mapType='china'):
        series = {
            u'name':            name
            , u'type':          'map'
            , u'mapType':       mapType
            , u'verable':       False
            , u'roam':          True
            , u'data':          []
            , u'selectedMode':  'single'
            , u'markPoint':     {
                u'symbolSize':  5   
                , u'itemStyle': {
                    u'normal': {
                        u'borderColor': '#87cefa',
                        u'borderWidth': 1,            
                        u'label': {
                            u'show':    False
                        }
                    }
                    , u'emphasis': {
                        u'borderColor': '#1e90ff'
                        , u'borderWidth': 5
                        , u'label': {
                            u'show':    False
                        }
                    }
                }
                , u'data':      []
            }
            , u'geoCoord':  {}
        }
        series[u'markPoint'][u'data'] = getCityPM2dot5()
        series[u'geoCoord'] = getChinaMainCityCoord()
        return series
        


class ChinaMap(Map):
    def __init__(self):
        Map.__init__(self)
        """
        self.series[u'mapType']     = u'china'
        self.series[u'itemStyle']   = {
            u'normal':      {u'label': {u'show':True}},
            u'emphasis':    {u'label': {u'show':True}}
        }
        self.series[u'data'] = []
        """

    def makeData(self, data_from_db, msu_factor_list, msn_factor_list, group_factor_list):
        all_data = map(list, zip(*data_from_db))
        
        numeric_factor_list, word_factor_list = [], []
        for factor in msn_factor_list:
            tmp_factor_list = numeric_factor_list \
                    if Protocol.NumericType == factor.getProperty(Protocol.Kind) \
                    else word_factor_list
            tmp_factor_list.append(factor)

        if len(word_factor_list) > 1:
            raise Exception('地图轴上参数不正确')

        legend_series_data = []
        if len(group_factor_list) > 0:
            group_idx   = -1
            legend_data = list(set(all_data[group_idx]))
            for l in legend_data:
                one_series_data = [{d[1]: d[0]} for d in data_from_db if l == d[-1]]
                legend_series_data.append({'legend': l, 'series': one_series_data})
        else:
            legend_data = []
            one_series_data = [{d[1]: d[0]} for d in data_from_db]
            legend_series_data.append({
                'legend': ''
                , 'series': one_series_data
            })

        return {
            'legend_series':        legend_series_data
        }
        
            
class WorldMap(Map):
    def __init__(self):
        pass

    def makeData(self, *args):
        railValue = getRailLine()
        return {u'line_value': railValue}



class EChartManager():
    def __init__(self):
        pass

    def get_echart(self, shape=u'bar'):
        if 'table' == shape: 
            return Table()

        elif 'bar' == shape: 
            return Bar()

        elif 's_bar' == shape:
            return Bar()

        elif 'placehold_bar' == shape:
            return Bar()

        elif 'line' == shape:
            return Line()

        elif 's_line' == shape:
            return Line()

        elif 'area' == shape:
            return Area()

        elif 's_area' == shape:
            return Area()

        elif 'scatter' == shape:
            return Scatter()

        elif 'pie' == shape:
            return Pie()

        elif 'radar' == shape:
            return Radar()
        
        elif 'map' == shape:
            return ChinaMap()

        elif 'world_map' == shape:
            return WorldMap()

        else:
            logger.error('shape = {}'.format(shape))
            raise Exception(u'Unknown pictrue shape')



