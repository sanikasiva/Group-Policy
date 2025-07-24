from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, SessionRecordViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'sessions', SessionRecordViewSet, basename='session')

urlpatterns = router.urls