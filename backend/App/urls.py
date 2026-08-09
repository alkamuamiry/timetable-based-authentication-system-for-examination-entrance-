from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    UserAPIView,
    UserLoginAPIView,
    DepartmentProgramsAPIView,
    UserProfileImageAPIView,
    ProfileAPIView,
    UserLogoutAPIView,
    ProgramAPIView,
    DepartmentAPIView,
    AcademicYearAPIView,
    StudentAPIView,
    StudentSearchAPIView,
    FaceTemplateExtractView,
    VenueAPIView,
    CourseAPIView,
    ExamSessionAPIView,
    ExamTimetableAPIView,
    DeviceAPIView,
    DeviceCommandAPIView,
    DeviceScheduleAPIView,
    SessionRosterAPIView,
)


urlpatterns = [
    # =====================================
    # USER URLS
    # =====================================
    path(
        'users/',
        UserAPIView.as_view()
    ),

    path(
        'users/<uuid:pk>/',
        UserAPIView.as_view()
    ),
    path('login/',UserLoginAPIView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/profile/image',UserProfileImageAPIView.as_view(),name="user_profile_image"),
    path('user/profile',ProfileAPIView.as_view(),name="user_profile"),
    path("logout/", UserLogoutAPIView.as_view(), name="logout"),
    # =====================================
    # PROGRAM URLS
    # =====================================

    path(
        'programs/',
        ProgramAPIView.as_view()
    ),
    path('department/programs/<uuid:pk>',DepartmentProgramsAPIView.as_view(),name="department_programs"),

    path(
        'programs/<uuid:pk>/',
        ProgramAPIView.as_view()
    ),


    # =====================================
    # DEPARTMENT URLS
    # =====================================

    path(
        'departments/',
        DepartmentAPIView.as_view()
    ),

    path(
        'departments/<uuid:pk>/',
        DepartmentAPIView.as_view()
    ),


    # =====================================
    # ACADEMIC YEAR URLS
    # =====================================

    path(
        'academic-years/',
        AcademicYearAPIView.as_view()
    ),

    path(
        'academic-years/<uuid:pk>/',
        AcademicYearAPIView.as_view()
    ),


    # =====================================
    # STUDENT URLS
    # =====================================
   # =====================================
# STUDENT URLS
# =====================================
path('students/', StudentAPIView.as_view(), name="students"),  # GET (list) + POST (create)
path('students/<uuid:pk>/', StudentAPIView.as_view(), name="student"),  # GET/PUT/DELETE single

path('students/search/', StudentSearchAPIView.as_view(), name="get_all_student"),
path('students/search/<str:reg_number>/', StudentSearchAPIView.as_view(), name="student_search"),

    # =====================================
    # STUDENT FACE URLS
    # =====================================

    # path(
    #     'student-faces/',
    #     StudentFaceAPIView.as_view()
    # ),

    # path(
    #     'student-faces/<uuid:pk>/',
    #     StudentFaceAPIView.as_view()
    # ),

    path('student/embed/',FaceTemplateExtractView.as_view(),name= "face-embed"),
    path('student/embed/<str:reg_number>/',FaceTemplateExtractView.as_view(),name="get_embed"),

    # =====================================
    # VENUE URLS
    # =====================================

    path(
        'venues/',
        VenueAPIView.as_view()
    ),

    path(
        'venues/<uuid:pk>/',
        VenueAPIView.as_view()
    ),


    # =====================================
    # COURSE URLS
    # =====================================

    path(
        'courses/',
        CourseAPIView.as_view()
    ),

    path(
        'courses/<uuid:pk>/',
        CourseAPIView.as_view()
    ),


    # =====================================
    # EXAM SESSION URLS
    # =====================================

    path(
        'exam-sessions/',
        ExamSessionAPIView.as_view()
    ),

    path(
        'exam-sessions/<uuid:pk>/',
        ExamSessionAPIView.as_view()
    ),


    # =====================================
    # EXAM TIMETABLE URLS
    # =====================================

    path(
        'exam-timetables/',
        ExamTimetableAPIView.as_view()
    ),

    path(
        'exam-timetables/<uuid:pk>/',
        ExamTimetableAPIView.as_view()
    ),


    # =====================================
    # DEVICE URLS
    # =====================================

    path(
        'devices/',
        DeviceAPIView.as_view()
    ),

    path(
        'devices/<uuid:pk>/',
        DeviceAPIView.as_view()
    ),


    # =====================================
    # DEVICE COMMAND URLS
    # =====================================

    path(
        'device-commands/',
        DeviceCommandAPIView.as_view()
    ),

    path(
        'device-commands/<uuid:pk>/',
        DeviceCommandAPIView.as_view()
    ),


    # =====================================
    # DEVICE SCHEDULE (auth via X-Device-Key header, not JWT)
    # =====================================

    path(
        'device/schedule/',
        DeviceScheduleAPIView.as_view(),
        name="device_schedule"
    ),


    # =====================================
    # SESSION ROSTER (students + embeddings for one exam sitting)
    # =====================================

    path(
        'exam-timetables/<uuid:pk>/roster/',
        SessionRosterAPIView.as_view(),
        name="session_roster"
    ),
]