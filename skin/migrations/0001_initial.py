# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SkinModel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('m_name', models.CharField(unique=True, max_length=20, db_column=b'name')),
                ('m_owner', models.CharField(max_length=20, db_column=b'owner')),
                ('m_create_time', models.DateTimeField(auto_now_add=True, db_column=b'create_time')),
                ('m_is_distributed', models.BooleanField(default=False, db_column=b'is_distributed')),
                ('m_status', models.BooleanField(default=True, db_column=b'status')),
                ('m_cat', models.IntegerField(db_column=b'category')),
            ],
            options={
                'db_table': 'skin',
            },
        ),
    ]
