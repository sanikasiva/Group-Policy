from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Category, SessionRecord
from .serializers import CategorySerializer, SessionRecordSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().prefetch_related('params__config_type', 'params__segments')
    serializer_class = CategorySerializer

class SessionRecordViewSet(viewsets.ViewSet):
    """
    POST { session_id, file_content } will create or overwrite by session_id.
    """
    serializer_class = SessionRecordSerializer

    def create(self, request):
        sid = request.data.get('session_id')
        content = request.data.get('file_content', '')
        if sid is None:
            return Response({"detail": "session_id required"}, status=status.HTTP_400_BAD_REQUEST)
        obj, created = SessionRecord.objects.update_or_create(
            session_id=sid,
            defaults={'file_content': content}
        )
        serializer = SessionRecordSerializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
