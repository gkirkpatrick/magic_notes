"""
URL configuration for notes backend project.
"""
from django.contrib import admin
from django.urls import path
from notes.api import api

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
]
