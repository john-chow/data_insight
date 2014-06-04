# --*-- encoding: utf-8 --*--
#Filename:  echart.py
import pdb
from common.head import *
from widget.map import getCityPM2dot5, getRailLine


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
    def makeData(self, data_from_db, msu_list, msn_list, group_list):
    
        msu_len, msn_len, group_len = \
                map(lambda x: len(x), (msu_list, msn_list, group_list))

        all_data = map( list, zip(*data_from_db) )

        x_info_list, y_info_list = [], []

        # 先看度量列表，确定所在轴
        if msu_len > 0:
            msu_idx = 0
            attr_name, attr_kind, attr_cmd, attr_axis = msu_list[0]
            msu_info_list = x_info_list if u'col' == attr_axis else y_info_list
            msu_info_list.append({u'type': u'value'})
        else:
            raise Exception(u'cant draw %s', self.serial[u'type'])

        # 再看维度列表
        if msn_len > 0:
            msn_idx = msu_len
            attr_name, attr_kind, attr_cmd, attr_axis = msn_list[0]
            msn_info_list = x_info_list if u'col' == attr_axis else y_info_list
            msn_info_list.append({u'type': u'category', u'data': list(set(all_data[msn_idx]))})
        else:
            # measure所在轴的另一个轴就是mension
            msn_info_list = x_info_list if len(x_info_list) > 0 else y_info_list
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



class Bar(Bar_Line_Base):
    pass
                
class Line(Bar_Line_Base):
    pass

class Area(Bar_Line_Base):
    pass



class Scatter(EChart):
    def makeData(self, data_from_db, msu_list, msn_list, group_list):
        # 条件是至少2个数字列
        num_list = [ kind for (_, kind, _, _) in (msu_list + msn_list) if 1 == kind ] 
        if num_list < 2:
            raise Exception(u'cant draw scatter')

        x_info_list, y_info_list = [], []
        map(lambda x: x.append({
            u'type':    u'value'
        }), (x_info_list, y_info_list))

        legend_series_data = []
        if 0 < len(group_list):
            all_data = map( list, zip(*data_from_db) )
            # 一定不会有度量列，全部是维度且数值的列
            legend_list = list(set(all_data[len(msn_list)]))
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
    def makeData(self, data_from_db, msu_list, msn_list, group_list):
        if len(msu_list) < 1 or len(msn_list) < 1:
            raise Exception(u'cant draw pie')

        if 0 < len(group_list):
            raise Exception(u'cant have color mark')

        legend_series_data = [{u"name": a[1], u"value": a[0]} for a in data_from_db]
        """
        legend_data     = [a[1] for a in data_from_db]
        data_list       = [{u'value': i, u'name': j} for (i, j) in data_from_db]

        pdb.set_trace()
        legend_series_data = []
        for le in legend_data:
            one_series_data = [d[0] for d in data_from_db if le in d[1:]]
            legend_series_data.append({'legend': le, 'series': one_series_data})
        """

        return {u'legend_series':   legend_series_data}


class Radar(EChart):
    def __init__(self):
        EChart.__init__(self)
        self.option[u'polar'] = []
        pass

    def makeData(self, data_from_db, msu_list, msn_list, group_list):
        # 画图的条件应该是至少要有1个measure列，2个mension列
        if len(msn_list) < 1 or len(msu_list) < 1:
            raise Exception(u'cant draw radar')
            
        msu_list_len, msn_list_len, group_list_len = map( len, [msu_list, msn_list, group_list] )
        all_list        = msu_list + msn_list + group_list
        all_len         = len(all_list)

        all_data        = map(list, zip(*data_from_db))

        for idx in range(all_len -1, -1, -1):
            (attr_name, attr_kind, attr_cmd, attr_axis) = all_list[idx]
            if idx >= all_len - group_list_len:
                legend_data = list(set(all_data[idx]))
                self.option[u'legend'] = {
                    u'orient':  u'vertical',
                    u'x':       u'right',
                    u'y':       u'bottom',
                    u'data':    legend_data
                }

            elif idx >= msu_list_len and idx < all_len - group_list_len:
                one_indicator = []
                text_list = list(set(all_data[idx]))
                one_indicator = [ {u'text': t} for t in text_list ]
                self.option[u'polar'].append({
                    u'indicator':   one_indicator
                })

            else:
                # 如果没有legend，也就是没有group的属性
                #if not hasattr(self.option, u'legend'):
                if not u'legend' in self.option.keys():
                    self.option[u'series'].append({
                        u'type':        u'radar'
                        , u'data':      {
                            u'value':   all_data[idx]
                        }
                    })
                else:
                    series_unit = {
                        u'type':    u'radar'
                        , u'data':  []
                    }

                    series_data = []
                    for le in self.option[u'legend'][u'data']:
                        series_data_unit = {
                            u'name':    le
                        }
                        indicator_list = self.option[u'polar'][0][u'indicator']
                        series_data_unit[u'value'] = [value for d in indicator_list \
                                                        for (value, attr, group) in data_from_db \
                                                            if le == group and attr == d[u'text']]
                        series_data.append(series_data_unit)

                    self.option[u'series'].append({
                        u'type':        u'radar'
                        , u'data':      series_data
                    })

                # 添加max值进去     TBD
                

        return self.option



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

    def makeData(self, data_from_db, msu_list, msn_list, group_list):
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
        if u'bar' == shape: 
            return Bar()

        elif u's_bar' == shape:
            return Bar()

        elif u'placehold_bar' == shape:
            return Bar()

        elif u'line' == shape:
            return Line()

        elif u's_line' == shape:
            return Line()

        elif u'area' == shape:
            return Area()

        elif u's_area' == shape:
            return Area()

        elif u'scatter' == shape:
            return Scatter()

        elif u'pie' == shape:
            return Pie()

        elif u'radar' == shape:
            return Radar()
        
        elif u'china_map' == shape:
            return ChinaMap()

        elif u'world_map' == shape:
            return WorldMap()

        else:
            raise Exception(u'Unknown pictrue shape')



