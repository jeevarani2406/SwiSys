from django.urls import path
from .views import (
    J1939UploadView, VehicleListView, VehicleSpnsView, SpnVehiclesView, UploadAPIView,
    StandardFileListView, StandardFileDetailView, AuxiliaryFileListView, AuxiliaryFileDetailView,
    CategoryListView, CategoryDetailView, PGNListView, SPNListView,
    analyze_j1939_files  # new
)

urlpatterns = [
    # Existing endpoints
    path('j1939/upload/', J1939UploadView.as_view(), name='j1939-upload'),
    path('upload/', UploadAPIView.as_view(), name='upload'),
    path('j1939/vehicles/', VehicleListView.as_view(), name='j1939-vehicles'),
    path('j1939/vehicle/<int:vehicle_id>/spns/', VehicleSpnsView.as_view(), name='j1939-vehicle-spns'),
    path('j1939/spn/<int:spn_number>/vehicles/', SpnVehiclesView.as_view(), name='j1939-spn-vehicles'),

    # CSV analysis endpoint
    path('api/j1939/analyze/', analyze_j1939_files, name='analyze_j1939'),

    # Standard Files endpoints
    path('j1939/standard-files/', StandardFileListView.as_view(), name='standard-files-list'),
    path('j1939/standard-files/<int:pk>/', StandardFileDetailView.as_view(), name='standard-files-detail'),

    # Auxiliary Files endpoints
    path('j1939/auxiliary-files/', AuxiliaryFileListView.as_view(), name='auxiliary-files-list'),
    path('j1939/auxiliary-files/<int:pk>/', AuxiliaryFileDetailView.as_view(), name='auxiliary-files-detail'),

    # Categories endpoints
    path('j1939/categories/', CategoryListView.as_view(), name='categories-list'),
    path('j1939/categories/<int:pk>/', CategoryDetailView.as_view(), name='categories-detail'),

    # PGNs and SPNs list endpoints
    path('j1939/pgns/', PGNListView.as_view(), name='pgns-list'),
    path('j1939/spns/', SPNListView.as_view(), name='spns-list'),
]
