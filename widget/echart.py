# --*-- encoding: utf-8 --*--
#Filename:  echart.py
import pdb
from common.head import *
import common.protocol as Protocol
from widget.factor import ElementFactor
from widget.map import getCityPM2dot5, getRailLine
from common.log import logger


class EChart():
    def __init__(self):
        pass
        # 表明是属于serial数组中的属性
        """
        self.serial = {}

        self.option = {
            u'tooltip' : {
                u'show': True
                , u'trigger': 'item'
            }
            , u'toolbox': {
                u'show' : True
                , u'feature': {
                    u'mark': {
                        u'show': True
                    }
                    , u'dataView' : {
                        u'show': True
                        , u'readOnly': False
                    }
                    , u'magicType' : {
                        u'show': True
                        , u'type': ['line', 'bar', 'stack', 'tiled']
                    }
                    , u'restore' : {
                        u'show': True
                    }
                    , u'saveAsImage' : {
                        u'show': True
                    }
                }
            }
            , u'calculable' : True
            , u'xAxis' : []
            , u'yAxis' : []
            , u'series' : []
        }

    def makeSeriesUnit(self, **args):
        return dict(args.items() + self.serial.items())
    """

                

class Bar_Line_Base(EChart):
    def makeData(self, data_from_db, msu_factor_list, msn_factor_list, group_factor_list):
        msu_len, msn_len, group_len = \
                map(lambda x: len(x), (msu_factor_list, msn_factor_list, group_factor_list))

        all_data = map( list, zip(*data_from_db) )

        x_info_list, y_info_list = [], []

        # 必须要有1个度量和至多1个维度
        if msu_len != 1 or msn_len > 1:
            raise Exception(u'cant draw {0}'.format(self.type))

        # 先看度量列表，确定所在轴
        _table, attr_name, attr_kind, attr_cmd = msu_factor_list[0].extract()
        attr_axis = msu_factor_list[0].getProperty(Protocol.Axis)

        msu_info_list = x_info_list if u'col' == attr_axis else y_info_list
        msu_info_list.append({u'type': u'value'})

        # 再看维度列表
        if 1 == msn_len:
            msn_idx = msu_len
            _table, attr_name, attr_kind, attr_cmd = msn_factor_list[0].extract()
            attr_axis = msn_factor_list[0].getProperty(Protocol.Axis)
            msn_info_list = x_info_list if u'col' == attr_axis else y_info_list
            msn_info_list.append({u'type': u'category', u'data': list(set(all_data[msn_idx]))})
        elif 0 == msn_len:
            # measure所在轴的另一个轴就是mension
            msn_info_list = y_info_list if len(x_info_list) > 0 else x_info_list
            msn_info_list.append({u'type': u'category', u'data': ['']})
            
        legend_series_data = []
        # 最后看分组列表
        if group_len > 0:
            group_idx   = msu_len + msn_len
            legend_data = list(set(all_data[group_idx]))

            for l in legend_data:
                one_series_data = [d[0] for d in data_from_db if l in d[1:]]
                legend_series_data.append({'legend': l, 'series': one_series_data})
        else:
            legend_data = []
            one_series_data = all_data[0]
            legend_series_data.append({'series': one_series_data})

        return {    
            u'x': x_info_list   \
            , u'y': y_info_list     \
            , u'legend_series': legend_series_data
        }


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
            raise Exception(u'xxxxxxxxxxxx')
        if len(msu_factor_list) != 1:
            raise Exception(u'xxxxxxxxxxx')

        row_list, column_list = [], []
        msu_len = len(msu_factor_list)
        msn_row_len = len([f for f in msn_factor_list if 'row' == f.getProperty('axis')])
        msn_column_len = len(msn_factor_list) - msn_row_len

        for i, factor in enumerate(msn_factor_list):
            classes_list = list(set([d[msu_len + i] for d in data_from_db]))

            tmp_list = row_list if 'row' == factor.getProperty('axis') \
                                else column_list
            tmp_list.append({'name': factor.getProperty(Protocol.Attr), \
                                'classes': classes_list})

        val_list_list, belong_row_list, belong_column_list = [], [], []
        for one in data_from_db:
            val_list, belong_row, belong_column = \
                    one[:msu_len], one[msu_len:msu_len+msn_row_len], \
                    one[msu_len+msn_row_len:]
            belong_row_list.append(belong_row)
            belong_column_list.append(belong_column)
            val_list_list.append(list(val_list))

        data_list = zip(*val_list_list)
        msu_attr_list = map(lambda factor: factor.getProperty(Protocol.Attr), \
                                                                msu_factor_list)
        data_dict = dict(zip(msu_attr_list, data_list))
        data_dict['belong_row']  = belong_row_list
        data_dict['belong_column']  = belong_column_list
        data_dict['row']    = row_list
        data_dict['column'] = column_list

        return data_dict
            

class Scatter(EChart):
    def makeData(self, data_from_db, msu_factor_list, msn_factor_list, group_factor_list):
        # 条件是至少2个数字列
        numeric_factor_list = [f for f in (msu_factor_list + msn_factor_list) \
                                    if 0 == f.getProperty(Protocol.Kind)]
        if len(numeric_factor_list) < 2:
            raise Exception(u'cant draw scatter')

        x_info_list, y_info_list = [], []
        map(lambda x: x.append({
            u'type':    u'value'
        }), (x_info_list, y_info_list))

        legend_series_data = []
        if 0 < len(group_factor_list):
            all_data = map( list, zip(*data_from_db) )
            # 一定不会有度量列，全部是维度且数值的列
            legend_list = list(set(all_data[len(msn_factor_list)]))
            for le in legend_list:
                legend_series_data.append({
                    u'legend':          le
                    , u'series':        [ x[:-1] for x in data_from_db if x[-1] == le ] 
                })
        else:
            legend_series_data.append({
                u'series':  data_from_db
            })

        return {
            u'x':                   x_info_list
            , u'y':                 y_info_list
            , u'legend_series':     legend_series_data
        }


class Pie(EChart):
    def makeData(self, data_from_db, msu_factor_list, msn_factor_list, group_factor_list):
        if len(msu_factor_list) < 1 or len(msn_factor_list) < 1:
            raise Exception(u'cant draw pie')

        if 0 < len(group_factor_list):
            raise Exception(u'cant have color mark')

        legend_series_data = [{u"name": a[1], u"value": a[0]} for a in data_from_db]

        return {u'legend_series':   legend_series_data}


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

    def makeData(self, *args):
        pmValue = getCityPM2dot5()
        return {u'point_value': pmValue}
        
            
            
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
        
        elif 'china_map' == shape:
            return ChinaMap()

        elif 'world_map' == shape:
            return WorldMap()

        else:
            logger.error('shape = {}'.format(shape))
            raise Exception(u'Unknown pictrue shape')



