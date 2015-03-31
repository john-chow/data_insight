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
    def classifyFactors(self, factors):
        cats_idx = [ 
            i for i, fc in enumerate(factors) \
                if fc.location in [Protocol.Row, Protocol.Column] \
                and Protocol.NumericType != fc.getProperty(Protocol.Kind) 
        ]

        vals_idx = [ 
            i for i, fc in enumerate(factors) \
                if fc.location in [Protocol.Row, Protocol.Column] \
                and Protocol.NumericType == fc.getProperty(Protocol.Kind) 
        ]
        grps_idx = [
            i for i, fc in enumerate(factors) \
                if fc.location in Protocol.Group_List
        ]

        return (
            vals_idx
            , cats_idx
            , grps_idx
        )


class CatAxisEChart(EChart):
    '''
    有类目且有轴的图像基类
    包括 line,area,china-map
    '''
    def makeData(self, data_from_db, factors):
        val_factor_idx_list \
        , cat_factor_idx_list \
        , grp_factor_idx_list = self.classifyFactors(factors)

        if len(cat_factor_idx_list) <= 0:
            raise Exception('')

        self.cat_idx = cat_factor_idx_list[0]
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
                copyed_grp_idx_legend_list = grp_idx_legend_list[:]
                column_name = factors[i].getProperty(Protocol.Attr)
                series.extend(
                    self.yieldSeries(data_from_db, copyed_grp_idx_legend_list, column_name, i)
                )

        result = self.constructOption(factors, series)
        return result


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
                'type':         self.type
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
            if cat in the_series_cats:
                row_idx = the_series_cats.index(cat)
                value = the_series_data[row_idx][val_idx]
            else:
                value = ''

            # 地图时候形式略有不同
            if 'map' == self.type:
                series_data.append({
                    'name':     cat
                    , 'value':  value
                })
            else:
                series_data.append(value)

        return series_data


    def departData(self, data, this_legend, sub_legend, lg_idx):
        '''
        根据legend对数据进行分割
        param:
            data:           横表
            this_legend:    当前系列名称
            sub_legend:     子系列名称
            lg_idx:         当前系列在横表中索引值
        '''
        deep_legend = (this_legend + Protocol.Legend_Link + sub_legend) \
                                        if '' != this_legend else sub_legend
        part_data = [row for row in data if sub_legend == row[lg_idx]]
        return deep_legend, part_data


class Bar_Line_Base(CatAxisEChart):
    '''
    bar, line, area的基类
    '''
    def constructOption(self, factors, series):
        '''
        制造echart规格的option
        '''
        legends = {
            'data':  [item.get('name') for item in series]
        }
        
        # 计算xAxis和yAxis
        distinct_series_axis = set( 
            itertools.imap(lambda x: x.get('xAxisIndex') or x.get('yAxisIndex'), series) 
        )
        distinct_series_axis_num = len(distinct_series_axis)
        cat_axis_unit, val_axis_unit = {
            'type':     'category'
            , 'data':   self.cat_data
        }, {
            'type':     'value'
        }
        cat_axis, val_axis = [cat_axis_unit], []
        for i in range(distinct_series_axis_num):
            copyed_val_axis = copy.deepcopy(val_axis_unit)
            val_axis.append(copyed_val_axis)

        cat_fc = factors[self.cat_idx]
        x_axis, y_axis = (cat_axis, val_axis) if Protocol.Column == cat_fc.location \
                                                else (val_axis, cat_axis)

        return {
            'legend':       legends
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
        self.type = 'line'



class Scatter(EChart):
    '''
    为散点图做画图数据
    ps: factors里面两个value列，n个cat列，n个group个
    '''

    def __init__(self):
        self.type = 'scatter'

    def makeData(self, data_from_db, factors):
        val_factor_idx_list \
        , cat_factor_idx_list \
        , grp_factor_idx_list = self.classifyFactors(factors)

        if len(val_factor_idx_list) != 2 \
                or len(cat_factor_idx_list) < 0 \
                or len(grp_factor_idx_list) < 0:
            raise Exception('')

        # 只有非color,非size类的group才是legend里面的分组
        # 诸如color，size类的分组都是需要单独
        legend_idx_list = [
            i for i, f in enumerate(factors) \
                if f.location not in Protocol.Group_List \
                and f.kind != Protocol.NumericType \
        ]

        legend_series_dict = {}
        for row in data_from_db:
            row_legend_list, row_data_list = [], []
            for i in range(len(row)):
                if i in legend_idx_list:
                    row_legend_list.append(row[i])
                else:
                    row_data_list.append(row[i])

            name = (Protocol.Legend_Link).join(row_legend_list)
            if name not in legend_series_dict:
                legend_series_dict[name] = {
                    'type':     self.type
                    , 'name':   name
                    , 'data':   [row_data_list]
               }
            else:
                row_data_list_list = legend_series_dict[name]['data']
                row_data_list_list.append(row_data_list)

        xAxis, yAxis = {'type': 'value'}, {'type': 'value'}

        legends = legend_series_dict.keys()
        series  = legend_series_dict.values()

        return {
            'xAxis':        xAxis
            , 'yAxis':      yAxis
            , 'legend':     {
                'data':     legends
            }
            , 'series':     series
        }


class PartitionBase(EChart):
    def makeData(self, data_from_db, factors):
        '''
        给成分图做绘图数据
        ps: facotrs里面只能有一个value，最少1一个cat，最多一个group
        '''

        val_factor_idx_list \
        , cat_factor_idx_list \
        , grp_factor_idx_list = self.classifyFactors(factors)

        if len(val_factor_idx_list) != 1 \
                or len(cat_factor_idx_list) < 1 \
                or len(grp_factor_idx_list) > 1:
            raise Exception('')

        val_idx = val_factor_idx_list[0]

        # 建立系列名-系列内容的字典
        if len(grp_factor_idx_list) < 1:
            grp_series_dict = {Protocol.Default_Legend: {
                'name':     Protocol.Default_Legend
                , 'type':   self.type
                , 'data':   []
            }}

        else:
            grp_idx = grp_factor_idx_list[0]
            pivot_data_from_db = map(list, zip(*data_from_db))
            grp_list = uniqList(pivot_data_from_db[grp_idx])

            grp_series_dict = {}
            for g in grp_list:
                grp_series_dict[g] = {
                    'name':     g
                    , 'type':   self.type
                    , 'data':   []
                }

        grp_idx = grp_factor_idx_list[0] \
                    if len(grp_factor_idx_list) > 0 \
                    else -1

        for row in data_from_db:
            grp = row[grp_idx] if grp_idx >= 0 else Protocol.Default_Legend
            cat_data_list = [row[i] for i in cat_factor_idx_list]
            name = (Protocol.Legend_Link).join(cat_data_list)
            value = row[val_idx]
            grp_series_dict[grp]['data'].append({
                'name':     name
                , 'value':  value
            })

        legends, series = [], grp_series_dict.values()
        map(lambda x: legends.extend( 
            [d['name'] for d in x['data']]
        ), series)
        legends = uniqList(legends)

        return {
            'legend':       {
                'data':     legends
            }
            , 'series':     series
        }


class Pie(PartitionBase):
    def __init__(self):
        self.type = 'pie'

class Funnel(PartitionBase):
    def __init__(self):
        self.type = 'funnel'


class Radar(EChart):
    def __init__(self):
        self.type = 'radar'

    def makeData(self, data_from_db, factors):
        '''
        为雷达图做图表数据
        至少有3个value列，1个cat列，没有grp列
        '''
        val_factor_idx_list \
        , cat_factor_idx_list \
        , grp_factor_idx_list = self.classifyFactors(factors)

        if len(cat_factor_idx_list) != 1 \
                or len(val_factor_idx_list) < 3 \
                or len(grp_factor_idx_list) > 0:
            raise Exception('')

        cat_idx = cat_factor_idx_list[0]
        pivot_data_from_db = map(list, zip(*data_from_db))
        cat_data_list = uniqList(pivot_data_from_db[cat_idx])

        series_one, polar_one = {
            'type':     self.type
            , 'data':   []
        }, {
            'indicator':    [{
                'text': factors[i].getProperty(Protocol.Attr) 
            } for i in val_factor_idx_list]
        }
        for row in data_from_db:
            name = row[cat_idx]
            value = [row[i] for i in val_factor_idx_list]
            series_one['data'].append({
                'name':     name
                , 'value':  value
            })

        legends = [item['name'] for item in series_one['data']]
        series = [series_one]
        polars = [polar_one]

        return {
            'legend':       {
                'data':     legends
            }
            , 'polar':      polars
            , 'series':     series
        }


class ChinaMap(CatAxisEChart):
    def __init__(self):
        self.type = 'map'
        super(CatAxisEChart, self).__init__()

    def constructOption(self, factors, series):
        legends = {
            'data':  [item.get('name') for item in series]
        }

        return {
            'legend':       legends
            , 'series':     series
        }

            
class WorldMap(CatAxisEChart):
    def __init__(self):
        pass


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



