# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('widget', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SceneModel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('m_name', models.CharField(unique=True, max_length=20, db_column=b'name')),
                ('m_owner', models.CharField(max_length=20, db_column=b'owner')),
                ('m_create_time', models.DateTimeField(auto_now_add=True, db_column=b'create_time')),
                ('m_is_distributed', models.BooleanField(default=False, db_column=b'is_distributed')),
                ('m_status', models.BooleanField(default=True, db_column=b'status')),
                ('m_layout', models.TextField(db_column='layout')),
                ('m_insert_word', models.TextField(db_column='insert_word')),
                ('m_insert_pic', models.TextField(db_column='insert_pic')),
                ('m_snapshot', models.TextField(db_column='snapshot')),
                ('m_skin', models.CharField(default=b'default', max_length=16, db_column=b'skin')),
            ],
            options={
                'db_table': 'scenes',
            },
        ),
        migrations.CreateModel(
            name='ScnToWiRelationModel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('m_cat', models.IntegerField(default=1, db_column=b'category')),
                ('m_stamp', models.BigIntegerField()),
                ('m_scn', models.ForeignKey(related_name='s2r_set', to='scene.SceneModel')),
                ('m_wi', models.ForeignKey(related_name='w2r_set', to='widget.WidgetModel')),
            ],
            options={
                'db_table': 'scene_to_widget',
            },
        ),
        migrations.AddField(
            model_name='scenemodel',
            name='m_widgets',
            field=models.ManyToManyField(related_name='s2w_set', through='scene.ScnToWiRelationModel', to='widget.WidgetModel'),
        ),
    ]
