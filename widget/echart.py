# --*coding: utf-8 -*-

#Filename:  echart.py

import itertools
import copy
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

        # 根据legend，拆分data_from_db
        if locations_idx:
            legend_idx = locations_idx[0]
            legends = uniqList(pivot_data_from_db[legend_idx])
            data = self.dispart(data_from_db, idx, legends)
        else:
            data = [('', data_from_db)]

        # 得出若干series
        series  = self.calcSeries( 
            data, factors, cats_data, cat_idx, cat_fc.location 
        )

        # 组合得全部的legends
        legend_items = {
            'data':  [item.get('name') for item in series]
        }

        # 计算xAxis和yAxis
        distinct_series_axis = set( 
            itertools.imap(lambda x: x.get('xAxisIndex') or x.get('yAxisIndex'), series) 
        )
        distinct_series_axis_num = len(distinct_series_axis)
        cat_axis_unit, val_axis_unit = {
            'type':     'category'
            , 'data':   cats_data
        }, {
            'type':     'value'
        }
        cat_axis, val_axis = [cat_axis_unit], []
        for i in range(distinct_series_axis_num):
            copyed_val_axis = copy.deepcopy(val_axis_unit)
            val_axis.append(copyed_val_axis)

        x_axis, y_axis = (cat_axis, val_axis) if 'col' == cat_fc.location \
                                                else (val_axis, cat_axis)

        return {
            'legend':       legend_items
            , 'xAxis':      x_axis
            , 'yAxis':      y_axis
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


    def calcSeries(self, data, factors, cats_data, cat_idx, cat_loc):
        '''
        有多个数字列，按类分
        '''
        colidx_fcs = [(col_idx, fc) for col_idx, fc in enumerate(factors) \
                        if Protocol.NumericType == fc.getProperty(Protocol.Kind)]

        mul_valaxis_flag = True if len(colidx_fcs) > 1 else False

        result = []
        for bf_legend, part_data in data:
            dim_data = map(list, zip(*part_data))
            for col_idx, fc in colidx_fcs:
                name = fc.getProperty(Protocol.Attr)
                # 把legend拼在一起
                one_legend      = bf_legend + name if mul_valaxis_flag else bf_legend
                one_cats, one_series = dim_data[cat_idx], dim_data[col_idx]

                # 系列中缺少的cat时，补上(cat, '')组合
                to_supply_cats_series = [(c, '') for c in cats_data if c not in one_cats]
                after_supply_cats_series = zip(one_cats, one_series) + to_supply_cats_series

                sorted_one_cats_series \
                        = sorted(after_supply_cats_series, key = lambda x: cats_data.index(x[0]))
                final_series = [item[1] for item in sorted_one_cats_series]
                index = getatt(fc, 'index') if hasattr(fc, 'index') else 0

                one_series = {
                    'name':     one_legend
                    , 'data':   final_series
                    , 'type':   self.type
                }
                if 'col' == cat_loc:
                    one_series['xAxisIndex'] = index
                else:
                    one_series['yAxisIndex'] = index

                result.append(one_series)

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

    def makeData(self, data_from_db, factors):
        cat_factor_idx_list = [ 
            i for i, fc in enumerate(factors) \
                if fc.location in [Protocol.Row, Protocol.Column] \
                and Protocol.NumericType != fc.getProperty(Protocol.Kind) 
        ]

        if len(cat_factor_idx_list) != 1:
            raise Exception('')
        self.cat_idx = cat_factor_idx_list[0]

        val_factor_idx_list = [ 
            i for i, fc in enumerate(factors) \
                if fc.location in [Protocol.Row, Protocol.Column] \
                and Protocol.NumericType == fc.getProperty(Protocol.Kind) 
        ]
        grp_factor_idx_list = [
            i for i, fc in enumerate(factors) \
                if fc.location in Protocol.Group_List
        ]

        pivot_data_from_db = map(list, zip(*data_from_db))
        grp_idx_legend_list = [
            (idx, uniqList(pivot_data_from_db[idx])) \
                for idx in grp_factor_idx_list
        ]

        self.data, self.pivot_data = data_from_db, pivot_data_from_db
        series = []
        if len(val_factor_idx_list) < 1:
            raise Exception('')
        elif len(val_factor_idx_list) == 1:
            i = val_factor_idx_list[0]
            series = self.yieldSeries(data_from_db, grp_idx_legend_list, '', i)
        else:
            for i in val_factor_idx_list:
                column_name = factors[i].getProperty(Protocol.Attr)
                series.append(
                    self.yieldSeries(data_from_db, grp_idx_legend_list, column_name, i)
                )

        return {
            'series':   series
        }


    @property
    def cat_data(self):
        '''
        挑拣出全体cat数据
        '''
        cat_column = self.pivot_data[self.cat_idx]
        return uniqList(cat_column)


    def pickSeriesData(self, the_series_data, val_idx):
        '''
        挑拣出本series里面的数据
        '''
        series_data = []
        the_series_cats = [row[self.cat_idx] for row in the_series_data]
        for cat in self.cat_data:
            row_idx = the_series_cats.index(cat)
            if row_idx:
                value = the_series_data[row_idx][val_idx]
            else:
                value = ''

            series_data.append(value)

        return series_data


    def yieldSeries(self, data, sub_legends_list, this_legend, val_idx):
        '''
        生产series
        param:
            data:               横表 
            sub_legends_list:   内部的子系列的索引值和名称
            this_legend:        此时的系列名称
            val_idx:            值列的索引数
        '''
        if not sub_legends_list:
            series_data = self.pickSeriesData(data, val_idx)
            return [{
                'type':         'map'
                , 'mapType':    'china'
                , 'name':       this_legend
                , 'data':       series_data
            }]

        series = []
        idx, legends = sub_legends_list.pop(0)
        for sub_legend in legends:
            deep_legend, part_data = self.departData(data, this_legend, sub_legend, idx)
            series.extend(
                self.yieldSeries(part_data, sub_legends_list, deep_legend, val_idx)
            )
        return series
        

    def departData(self, data, this_legend, sub_legend, idx):
        '''
        根据legend对数据进行分割
        param:
            data:           横表
            this_legend:    当前系列名称
            sub_legend:     子系列名称
            idx:            当前系列在横表中索引值
        '''
        deep_legend = (this_legend + Protocol.Legend_Link + sub_legend) \
                                        if '' != this_legend else sub_legend
        part_data = [row for row in data if sub_legend == row[idx]]
        return deep_legend, part_data

            
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



