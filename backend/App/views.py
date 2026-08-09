from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.contrib.auth import authenticate
from .permissions import IsValidDevice
from rest_framework import status
from .serializers import (
    UserSerializer,
    userProfileImageSerializer,
    ProgramSerializer,
    DepartmentSerializer,
    AcademicYearSerializer,
    StudentSerializer,
    StudentFaceSerializer,
    VenueSerializer,
    CourseSerializer,
    ExamSessionSerializer,
    ExamTimetableSerializer,
    DeviceSerializer,
    DeviceCommandSerializer,
    SessionRosterSerializer,
)

from .models import (
    User,
    Program,
    Department,
    AcademicYear,
    Student,
    StudentFace,
    Venue,
    Course,
    ExamSession,
    ExamTimetable,
    Device,
    DeviceCommand,
    AuthConfig,
)

from django.utils import timezone
from django.db.models import Q
from datetime import datetime, timedelta

# =====================================
# USER API VIEW
# =====================================

class UserAPIView(APIView):
    # =====================================
    # GET USERS / GET SINGLE USER
    # =====================================

    def get(self, request, pk=None):
        
        if pk:

            try:

                user = User.objects.get(pk=pk)

            except User.DoesNotExist:

                return Response(
                    {
                        'error':
                        'User not found'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = UserSerializer(user)

            return Response(serializer.data)


        users = User.objects.all()

        serializer = UserSerializer(
            users,
            many=True
        )

        return Response(serializer.data)


    # =====================================
    # CREATE USER
    # =====================================

    def post(self, request):

        serializer = UserSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    # =====================================
    # UPDATE USER
    # =====================================

    def put(self, request, pk):

        try:

            user = User.objects.get(pk=pk)

        except User.DoesNotExist:

            return Response(
                {
                    'error':
                    'User not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserSerializer(
            user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    # =====================================
    # DELETE USER
    # =====================================

    def delete(self, request, pk):

        try:

            user = User.objects.get(pk=pk)

        except User.DoesNotExist:

            return Response(
                {
                    'error':
                    'User not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )


        # PREVENT USER FROM DELETING HIMSELF

        if request.user == user:

            return Response(
                {
                    'error':
                    'You cannot delete yourself'
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        user.delete()

        return Response(
            {
                'message':
                'User deleted successfully'
            }
        )

# =====================================
# USER LOGIN API
# =====================================

class UserLoginAPIView(APIView):
    permission_classes = [] # allow everyone

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "email": user.email,
                "name":f"{user.first_name} {user.last_name}",
            }
        }, status=status.HTTP_200_OK)

class UserProfileImageAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = userProfileImageSerializer(request.user,context={"request": request})

        return Response(serializer.data)

class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user,context={"request": request})

        return Response(serializer.data)

class UserLogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print(request.data)
        try:
            refresh_token = request.data.get("refresh")

            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"message": "Logout successful","details":"success"},
                status=status.HTTP_205_RESET_CONTENT
            )

        except Exception:
            return Response(
                {"error": "Invalid token","details":"failed"},
                status=status.HTTP_400_BAD_REQUEST
            )

class StudentAPIView(APIView):
    permission_classes =[]
    def get(self,request,pk = None):
        if pk:
            
            try:

                student = Student.objects.get(
                    pk=pk
                )

            except Student.DoesNotExist:

                return Response(
                    {
                        "error": "Student not found"
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = StudentSerializer(
                student,context={"request": request}
            )

            return Response(
                serializer.data
            )

        students = Student.objects.all()

        serializer = StudentSerializer(
            students,
            many=True,context={"request": request}
        )

        return Response(
            serializer.data
        )


    def post(self, request):
        serializer = StudentSerializer(
            data=request.data,context={"request": request},partial =True
        )
        
        
        if serializer.is_valid():
            
            serializer.save()

            return Response(
                {"success":True,"data":serializer.data},
                status=status.HTTP_201_CREATED
            )

        return Response(
            {"success":False,"error":serializer.errors,},
            status=status.HTTP_400_BAD_REQUEST
        )


    def put(self, request, pk):

        try:

            student = Student.objects.get(
                pk=pk
            )

        except Student.DoesNotExist:

            return Response(
                {
                    "error": "Student not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = StudentSerializer(
            student,
            data=request.data, partial = True, context={"request": request}
        )
        
        if serializer.is_valid():
            print(serializer.validated_data)
            serializer.save()

            return Response(
                {"success":True,"data":serializer.data}
                
            )

        return Response(
            {"success":False,"error":serializer.errors,},
            status=status.HTTP_400_BAD_REQUEST
        )


    def delete(self, request, pk):

        try:

            student = Student.objects.get(
                pk=pk
            )

        except Student.DoesNotExist:

            return Response(
                {
                    "error": "Student not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        student.delete()

        return Response(
            {
                "message":
                "Student deleted successfully"
            }
        )

class StudentSearchAPIView(APIView):
    def get(self,request,reg_number=None):
        if reg_number:

            student = Student.objects.all(
                
            ).filter(
                registration_number__iendswith=reg_number
            )

            if not student.exists():
                return Response(
                    {"error": "No matching student found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = StudentSerializer(
                student,
                many=True,
                context={"request": request}
            )

            return Response(serializer.data)

        student = Student.objects.all()

        serializer = StudentSerializer(
            student,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)
            

class ProgramAPIView(APIView):
    def get(self,request,pk= None):
        
        if pk:
            
            try:
                
                program = Program.objects.get(pk = pk)
                
            except Program.DoesNotExist:
                
                return Response(
                    {'error':'Program not found'},
                    status= status.HTTP_404_NOT_FOUND
                )
                
            serializer = ProgramSerializer(program)
            
            return Response(serializer.data)
        
        program = Program.objects.all()
        
        serializer = ProgramSerializer(
            program,
            many= True
        )
        
        return Response (serializer.data)
    def post(self,request):
        
        serializer = ProgramSerializer(
            data = request.data
        )
        if serializer.is_valid():
            
            serializer.save()
            
            return Response(
                serializer.data,
                status.HTTP_201_CREATED
            )
            
        return Response(
            serializer.errors,
            status.HTTP_400_BAD_REQUEST
        )
        
    def put(self, request, pk):

        try:

            program = Program.objects.get(pk=pk)

        except Program.DoesNotExist:

            return Response(
                {'error': 'Program not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProgramSerializer(
            program,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def delete(self, request, pk):

        try:

            program = Program.objects.get(pk=pk)

        except Program.DoesNotExist:

            return Response(
                {'error': 'Program not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        program.delete()

        return Response(
            {'message': 'Program deleted successfully'}
        )

class DepartmentProgramsAPIView(APIView):
    def get(self,request,pk= None):
        print(pk)
        
        if pk:
            
            try:
                
                program = Program.objects.filter(department_id = pk)
                
                
            except Program.DoesNotExist:
                
                return Response(
                    {'error':'Program not found'},
                    status= status.HTTP_404_NOT_FOUND
                )
                
            serializer = ProgramSerializer(program,many= True)
            
            return Response(serializer.data)
        
        program = Program.objects.all()
        
        serializer = ProgramSerializer(
            program,
            many= True
        )
        
        return Response (serializer.data)
    
class DepartmentAPIView(APIView):
    
    def get(self,request,pk= None):
        
        if pk:
            
            try:
                
                department = Department.objects.get(pk = pk)
                
            except Department.DoesNotExist:
                
                return Response(
                    {'error':'Department not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            serializer = DepartmentSerializer(department)
            
            return Response(
                serializer.data
            )
            
        department = Department.objects.all()
        
        serializer = DepartmentSerializer(department,many=True)
        
        return Response(serializer.data)
    
    def post(self,request):
        
        serializer = DepartmentSerializer(data = request.data)
        
        if serializer.is_valid():
            
            serializer.save()
            
            return Response(serializer.data)
        
        return Response(serializer.errors)
    def put(self, request, pk):

        try:

            department = Department.objects.get(pk=pk)

        except Department.DoesNotExist:

            return Response(
                {'error': 'Department not found'},
                status=404
            )

        serializer = DepartmentSerializer(
            department,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors)


    def delete(self, request, pk):

        try:

            department = Department.objects.get(pk=pk)

        except Department.DoesNotExist:

            return Response(
                {'error': 'Department not found'},
                status=404
            )

        department.delete()

        return Response(
            {'message': 'Department deleted'}
        )

class VenueAPIView(APIView):
    
    def get(self,request,pk = None):
        
        if pk:
            
            try:
                
                venue = Venue.objects.get(pk = pk)
                
            except Venue.DoesNotExist:
                
                return Response(
                    {'error':'Venue not found'},
                    status=404
                )
            serializer  = VenueSerializer(venue)
            
            return Response(serializer.data)
        venues  = Venue.objects.all()
        
        serializer = VenueSerializer(
            venues,
            many = True
        )
        
        return Response(serializer.data)

    def post(self,request):
        
        serializer = VenueSerializer(
            data = request.data
        )
        
        if serializer.is_valid():
            
            serializer.save()
            
            return Response(serializer.data)
        return Response(serializer.errors)
    
    def put(self,request,pk):
        
        try:
            
            venue = Venue.objects.get(pk= pk)
            
        except Venue.DoesNotExist:
            
            return Response(
                {'error':'Venue not found'},
                status= 404
            )
        
        serializer = VenueSerializer(
            venue,
            data = request.data,
            partial =True
        )
        
        if serializer.is_valid():
            
            serializer.save()
            
            return Response(serializer.data)
        
        return Response(serializer.errors)
    
    def delete(self,request, pk):
        try:
            
            venue = Venue.objects.get(pk= pk)
        
        except Venue.DoesNotExist:
            
            return Response(
                {'error':'Venue not found'},
                status= 404
            )
            
        venue.delete()
        
        return Response(
            {'message':'Venue deleted'}
        )

class AcademicYearAPIView(APIView):

    def get(self, request, pk=None):

        if pk:

            try:

                academic_year = AcademicYear.objects.get(
                    pk=pk
                )

            except AcademicYear.DoesNotExist:

                return Response(
                    {
                        'error':
                        'Academic year not found'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = AcademicYearSerializer(
                academic_year
            )

            return Response(serializer.data)


        academic_years = AcademicYear.objects.all()

        serializer = AcademicYearSerializer(
            academic_years,
            many=True
        )

        return Response(serializer.data)


    def post(self, request):

        serializer = AcademicYearSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def put(self, request, pk):

        try:

            academic_year = AcademicYear.objects.get(
                pk=pk
            )

        except AcademicYear.DoesNotExist:

            return Response(
                {
                    'error':
                    'Academic year not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AcademicYearSerializer(
            academic_year,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def delete(self, request, pk):

        try:

            academic_year = AcademicYear.objects.get(
                pk=pk
            )

        except AcademicYear.DoesNotExist:

            return Response(
                {
                    'error':
                    'Academic year not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        academic_year.delete()

        return Response(
            {
                'message':
                'Academic year deleted successfully'
            }
        )

class CourseAPIView(APIView):

    def get(self, request, pk=None):

        if pk:

            try:

                course = Course.objects.get(pk=pk)

            except Course.DoesNotExist:

                return Response(
                    {
                        'error':
                        'Course not found'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = CourseSerializer(course)

            return Response(serializer.data)


        courses = Course.objects.all()

        serializer = CourseSerializer(
            courses,
            many=True
        )

        return Response(serializer.data)


    def post(self, request):

        serializer = CourseSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def put(self, request, pk):

        try:

            course = Course.objects.get(pk=pk)

        except Course.DoesNotExist:

            return Response(
                {
                    'error':
                    'Course not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CourseSerializer(
            course,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def delete(self, request, pk):

        try:

            course = Course.objects.get(pk=pk)

        except Course.DoesNotExist:

            return Response(
                {
                    'error':
                    'Course not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        course.delete()

        return Response(
            {
                'message':
                'Course deleted successfully'
            }
        )

class ExamSessionAPIView(APIView):

    def get(self, request, pk=None):

        if pk:

            try:

                exam_session = ExamSession.objects.select_related(
                    'venue'
                ).get(pk=pk)

            except ExamSession.DoesNotExist:

                return Response(
                    {
                        'error':
                        'Exam session not found'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = ExamSessionSerializer(
                exam_session
            )

            return Response(serializer.data)


        exam_sessions = ExamSession.objects.select_related(
            'venue'
        ).all()

        serializer = ExamSessionSerializer(
            exam_sessions,
            many=True
        )

        return Response(serializer.data)


    def post(self, request):

        serializer = ExamSessionSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def put(self, request, pk):

        try:

            exam_session = ExamSession.objects.get(
                pk=pk
            )

        except ExamSession.DoesNotExist:

            return Response(
                {
                    'error':
                    'Exam session not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ExamSessionSerializer(
            exam_session,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def delete(self, request, pk):

        try:

            exam_session = ExamSession.objects.get(
                pk=pk
            )

        except ExamSession.DoesNotExist:

            return Response(
                {
                    'error':
                    'Exam session not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        exam_session.delete()

        return Response(
            {
                'message':
                'Exam session deleted successfully'
            }
        )

class ExamTimetableAPIView(APIView):

    def get(self, request, pk=None):

        if pk:

            try:

                timetable = ExamTimetable.objects.select_related(
                    'session',
                    'course',
                    'program',
                    'year'
                ).get(pk=pk)

            except ExamTimetable.DoesNotExist:

                return Response(
                    {
                        'error':
                        'Timetable not found'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = ExamTimetableSerializer(
                timetable
            )

            return Response(serializer.data)


        timetables = ExamTimetable.objects.select_related(
            'session',
            'course',
            'program',
            'year'
        ).all()

        serializer = ExamTimetableSerializer(
            timetables,
            many=True
        )

        return Response(serializer.data)


    def post(self, request):

        serializer = ExamTimetableSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def put(self, request, pk):

        try:

            timetable = ExamTimetable.objects.get(
                pk=pk
            )

        except ExamTimetable.DoesNotExist:

            return Response(
                {
                    'error':
                    'Timetable not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ExamTimetableSerializer(
            timetable,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def delete(self, request, pk):

        try:

            timetable = ExamTimetable.objects.get(
                pk=pk
            )

        except ExamTimetable.DoesNotExist:

            return Response(
                {
                    'error':
                    'Timetable not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        timetable.delete()

        return Response(
            {
                'message':
                'Timetable deleted successfully'
            }
        )

class DeviceAPIView(APIView):

    def get(self, request, pk=None):

        if pk:

            try:

                device = Device.objects.select_related(
                    'venue'
                ).get(pk=pk)

            except Device.DoesNotExist:

                return Response(
                    {
                        'error':
                        'Device not found'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = DeviceSerializer(device)

            return Response(serializer.data)


        devices = Device.objects.select_related(
            'venue'
        ).all()

        serializer = DeviceSerializer(
            devices,
            many=True
        )

        return Response(serializer.data)


    def post(self, request):

        serializer = DeviceSerializer(
            data=request.data
        )

        if serializer.is_valid():

            device = serializer.save()

            # api_key is write_only (never shown on GET/list) so it's
            # only readable once here, right after creation, when the
            # admin needs to copy it onto the physical device
            data = dict(serializer.data)
            data['api_key'] = device.api_key

            return Response(
                data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def put(self, request, pk):

        try:

            device = Device.objects.get(pk=pk)

        except Device.DoesNotExist:

            return Response(
                {
                    'error':
                    'Device not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = DeviceSerializer(
            device,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def delete(self, request, pk):

        try:

            device = Device.objects.get(pk=pk)

        except Device.DoesNotExist:

            return Response(
                {
                    'error':
                    'Device not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        device.delete()

        return Response(
            {
                'message':
                'Device deleted successfully'
            }
        )

class DeviceCommandAPIView(APIView):

    def get(self, request, pk=None):

        if pk:

            try:

                command = DeviceCommand.objects.select_related(
                    'device'
                ).get(pk=pk)

            except DeviceCommand.DoesNotExist:

                return Response(
                    {
                        'error':
                        'Command not found'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = DeviceCommandSerializer(
                command
            )

            return Response(serializer.data)


        commands = DeviceCommand.objects.select_related(
            'device'
        ).all()

        serializer = DeviceCommandSerializer(
            commands,
            many=True
        )

        return Response(serializer.data)


    def post(self, request):

        serializer = DeviceCommandSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def put(self, request, pk):

        try:

            command = DeviceCommand.objects.get(
                pk=pk
            )

        except DeviceCommand.DoesNotExist:

            return Response(
                {
                    'error':
                    'Command not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = DeviceCommandSerializer(
            command,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    def delete(self, request, pk):

        try:

            command = DeviceCommand.objects.get(
                pk=pk
            )

        except DeviceCommand.DoesNotExist:

            return Response(
                {
                    'error':
                    'Command not found'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        command.delete()

        return Response(
            {
                'message':
                'Command deleted successfully'
            }
        )



import cv2
import numpy as np
import face_recognition

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import StudentFace, Student


class FaceTemplateExtractView(APIView):
    permission_classes = []
    def get(self, request, reg_number=None):

        if reg_number:

            student_faces = StudentFace.objects.select_related(
                'student'
            ).filter(
                student__registration_number__istartswith=reg_number
            )

            if not student_faces.exists():
                return Response(
                    {"error": "No matching student found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = StudentFaceSerializer(
                student_faces,
                many=True,
                context={"request": request}
            )

            return Response(serializer.data)

        student_faces = StudentFace.objects.select_related(
            'student',
        ).all()

        serializer = StudentFaceSerializer(
            student_faces,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)

    def post(self, request):

        student_id = request.data.get("student_id")
        image_file = request.FILES.get("face_image")

        # =========================
        # VALIDATION
        # =========================
        if not student_id or not image_file:
            return Response({
                "success": False,
                "message": "student_id and face_image required"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({
                "success": False,
                "message": "Student not found"
            }, status=status.HTTP_404_NOT_FOUND)

        # =========================
        # READ IMAGE
        # =========================
        file_bytes = np.frombuffer(image_file.read(), np.uint8)
        image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if image is None:
            return Response({
                "success": False,
                "message": "Invalid image"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Convert BGR → RGB (IMPORTANT for face_recognition)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # =========================
        # DETECT FACE
        # =========================
        face_locations = face_recognition.face_locations(rgb_image)

        if len(face_locations) == 0:
            return Response({
                "success": False,
                "message": "No face detected"
            }, status=status.HTTP_400_BAD_REQUEST)

        # =========================
        # EXTRACT FACE EMBEDDING
        # =========================
        encodings = face_recognition.face_encodings(rgb_image, face_locations)

        if len(encodings) == 0:
            return Response({
                "success": False,
                "message": "Failed to extract face embedding"
            }, status=status.HTTP_400_BAD_REQUEST)

        embedding = encodings[0].tolist()

        # =========================
        # SIMPLE QUALITY SCORE (basic heuristic)
        # =========================
        face_area = (
            face_locations[0][2] - face_locations[0][0]
        ) * (
            face_locations[0][1] - face_locations[0][3]
        )

        # normalize score (simple approximation)
        accuracy = min(100, max(40, int(face_area / 500)))
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        brightness = np.mean(gray)
        contrast = gray.std()
        MAX_BLUR = 500       # Adjust after testing your dataset
        MAX_CONTRAST = 127.5 # Maximum possible standard deviation

        blur_percent = min((blur_score / MAX_BLUR) * 100, 100)
        brightness_percent = (brightness / 255) * 100
        contrast_percent = min((contrast / MAX_CONTRAST) * 100, 100)

        # Overall quality (equal weights)
        quality_percent = (
            blur_percent +
            brightness_percent +
            contrast_percent
        ) / 3
        # =========================
        # ACCEPTANCE RULE
        # =========================z
        accepted = accuracy >= 60
        # =========================
        # SAVE ONLY IF ACCEPTED
        # =========================
        if accepted:

            student_face, created = StudentFace.objects.update_or_create(
                student=student,
                defaults={
                    "embedding": embedding,
                    "model_version": "face_recognition-dlib",
                    "accuracy": accuracy,
                }
            )
            
            if created:
                return Response({
                    "success": True,
                    "accepted": True,
                    "accuracy": accuracy,
                    "quality":quality_percent,
                    "message": "✅ A new StudentFace record was created."
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                        "success": True,
                        "accepted": True,
                        "accuracy": accuracy,
                        "quality":quality_percent,
                        "message": "🔄 An existing StudentFace record was updated."
                    }, status=status.HTTP_201_CREATED)
        return Response({
            "success": True,
            "accepted": False,
            "accuracy": accuracy,
            "quality":quality_percent,
            "message": "Face rejected (low quality)"
        }, status=status.HTTP_200_OK)

# =====================================
# DEVICE SCHEDULE — "what should I be doing right now"
# =====================================

class DeviceScheduleAPIView(APIView):
    """
    Called by the PyQt6 device on boot and periodically through the day.
    Authenticates via the device's own API key (X-Device-Key header) and
    returns every exam sitting scheduled at its venue today, each tagged
    upcoming / open / closed based on the CONFIGURABLE authentication
    window around its start time (see AuthConfig) — not the full exam
    duration, since authentication only needs to happen around the start,
    not for the whole length of the exam.
    """
    permission_classes = [IsValidDevice]

    def get(self, request):

        device = request.device
        device.last_seen_at = timezone.now()
        device.save(update_fields=['last_seen_at'])

        config = AuthConfig.get_config()

        today = timezone.localdate()
        now_local = timezone.localtime()
        now = now_local.time()
        timetables = ExamTimetable.objects.select_related(
            'session', 'course', 'program', 'year'
        ).filter(
            session__venue=device.venue,
            session__exam_date=today,
        ).order_by('session__start_time')

        schedule = []

        for tt in timetables:

            session = tt.session

            start_dt = datetime.combine(
                session.exam_date, session.start_time
            )

            end_dt = datetime.combine(
                session.exam_date, session.end_time
            )

            window_start = (
                start_dt - timedelta(minutes=config.window_before_minutes)
            ).time()

            # never let the window extend past the session's own
            # scheduled end time, no matter how generous
            # window_after_minutes is configured
            window_end_dt = min(
                start_dt + timedelta(minutes=config.window_after_minutes),
                end_dt
            )

            window_end = window_end_dt.time()
            if now < window_start:
                auth_status = 'upcoming'
            elif window_start <= now <= window_end:
                auth_status = 'open'
            else:
                auth_status = 'closed'

            schedule.append({
                'exam_timetable_id': tt.id,
                'session_id': session.id,
                'course_code': tt.course.code,
                'course_title': tt.course.title,
                'program': tt.program.short_name,
                'year': tt.year.year,
                # full scheduled exam duration, for display
                'session_start': session.start_time,
                'session_end': session.end_time,
                # the actual window the device should authenticate in
                'auth_window_start': window_start,
                'auth_window_end': window_end,
                'status': auth_status,
                'roster_url': f"/api/exam-timetables/{tt.id}/roster/",
            })

        return Response({
            'device_id': device.device_id,
            'venue': device.venue.name,
            'date': today,
            'server_time': now,
            'auth_window_before_minutes': config.window_before_minutes,
            'auth_window_after_minutes': config.window_after_minutes,
            'schedule': schedule,
        })


# =====================================
# SESSION ROSTER — students + embeddings for ONE sitting
# =====================================

class SessionRosterAPIView(APIView):
    """
    Called once the device knows which exam_timetable entry is current.
    Returns only students eligible for that sitting (matched by program
    + year) along with their face embeddings — not the whole student body.
    """
    permission_classes = [IsValidDevice]

    def get(self, request, pk):

        try:

            timetable = ExamTimetable.objects.select_related(
                'program', 'year', 'course', 'session'
            ).get(pk=pk)

        except ExamTimetable.DoesNotExist:

            return Response(
                {'error': 'Exam timetable entry not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if timetable.session.venue_id != request.device.venue_id:

            return Response(
                {'error': 'This session is not scheduled at your venue'},
                status=status.HTTP_403_FORBIDDEN
            )

        roster = StudentFace.objects.select_related('student').filter(
            student__program=timetable.program,
            student__year=timetable.year,
        )

        serializer = SessionRosterSerializer(roster, many=True)

        return Response({
            'exam_timetable_id': timetable.id,
            'course_code': timetable.course.code,
            'roster_count': roster.count(),
            'roster': serializer.data,
        })