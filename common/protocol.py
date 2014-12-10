# -*-coding: utf-8 -*-

#   
# 定义与前端约定的字段名称
#
#


# 表名称的字段



#########################################
#
# 组件创建或编辑部分
#
########################################

# 组件名字
WidgetName = 'name'

# 所在轴字段名称
Axis = 'axis'

# 该元素的值类别字段的名称
Kind = 'kind'

# 数据字段类型的种类
TimeType    = 'T'
NumericType = 'N'
FactorType  = 'F'

# 数据表名称
Table = 'table'

# 字段的自定义名称
Title = 'title'

# 字段在数据库中的名称
Attr = 'name'

# 字段的运算方式
Func = 'calcFunc'

# 几种计算方式
NoneFunc = 'none'
SumFunc = 'sum'
AvgFunc = 'avg'

# x,y轴上参数
Xaxis = 'x'
Yaxis = 'y'

# 过滤
Filter = 'filters'

# 属性所处位置
Location = 'location'

# 图表类型种类
Graph = 'graph'

# 快照
Snapshot = 'snapshot'

# 横轴
Row = 'row'

# 纵轴
Column = 'col'

# 颜色区分字段的名称
Color = 'colour'

# 用以进行填充的字段
Fill = 'fill'

# 用来进行大小的字段
Size = 'size'

# 排序字段
Order = 'order'

# 选择器封装
Mapping = 'mapping'

# group语句字段内
Group_List = [Color, Size]

# 样式
Style = 'style'

# 自动更新
Refresh = 'autoRefresh'

# 发布情况
IsPublish = 'isPublish'





'''
过滤器
'''

FilterColumn = 'field'

'''
Filter = {
    'Operator':     ''
    , 'Values':     ''
    , 'Overplus':   ''
}
'''






# legend层级之间的符号
Legend_Link = '_'

# 默认legend
Default_Legend = ''



'''
设置监控器
'''
# operator参数: 
# 大于用'>'，小于用'<'，大于或等于用'>='，小于或等于用'<='
# 在某区间范围用''(就是空的)，不等于用'<>'



#
# 保存组件辅助信息命令
#


# 统一的日期时间格式
DatetimeFormat = '%Y-%m-%d %H:%M:%S'


'''
标记数据表字段类型
'''
FieldType = 'type'

'''
标记
'''
FieldNickname = 'nickName'


FieldName = 'fieldName'


Join = {
    'Kind':             'kind'
    , 'Left':           'left'
    , 'Right':          'right'
}






