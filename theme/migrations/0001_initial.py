# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('scene', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ThemeModel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('m_name', models.CharField(unique=True, max_length=20, db_column=b'name')),
                ('m_owner', models.CharField(max_length=20, db_column=b'owner')),
                ('m_create_time', models.DateTimeField(auto_now_add=True, db_column=b'create_time')),
                ('m_is_distributed', models.BooleanField(default=False, db_column=b'is_distributed')),
                ('m_status', models.BooleanField(default=True, db_column=b'status')),
                ('m_switch_effect', models.CharField(max_length=255)),
                ('description', models.TextField(max_length=255)),
            ],
            options={
                'db_table': 'themes',
            },
        ),
        migrations.CreateModel(
            name='TheToScnRelationModel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('m_order', models.IntegerField()),
                ('m_scn', models.ForeignKey(related_name='sences_set', to='scene.SceneModel')),
                ('m_sub', models.ForeignKey(related_name='t2r_set', to='theme.ThemeModel')),
            ],
            options={
                'db_table': 'theme_to_scene',
            },
        ),
        migrations.AddField(
            model_name='thememodel',
            name='m_scenes',
            field=models.ManyToManyField(to='scene.SceneModel', through='theme.TheToScnRelationModel'),
        ),
    ]
