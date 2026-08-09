from rest_framework import serializers
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
    )
from rest_framework import serializers

from .models import User


# =====================================
# USER SERIALIZER
# =====================================

class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=False
    )

    class Meta:

        model = User

        fields = [

            'id',
            'email',
            'password',
            'first_name',
            'last_name',
            'phone',
            'profile_image',
            'address',
            'gender',
            'date_of_birth',
            'is_staff',
            'is_active',
            'created_at'
        ]

        read_only_fields = (
            'id',
            'created_at'
        )
 
class userProfileImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["profile_image"]
    def get_profile_image(self, obj):
        request = self.context.get("request")

        if obj.profile_image:
            return request.build_absolute_uri(obj.profile_image.url)

        return None

    # CREATE USER
    def create(self, validated_data):

        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        return user


    # UPDATE USER
    def update(self, instance, validated_data):

        password = validated_data.pop(
            'password',
            None
        )

        for attr, value in validated_data.items():

            setattr(instance, attr, value)

        if password:

            instance.set_password(password)

        instance.save()

        return instance
    
class StudentSerializer(
    serializers.ModelSerializer
):
    student_profile_image = serializers.ImageField()

    program_name = serializers.CharField(
        source='program.name',
        read_only=True
    )

    department_name = serializers.CharField(
        source='department.name',
        read_only=True
    )

    year_name = serializers.CharField(
        source='year.get_year_display',
        read_only=True
    )

    class Meta:

        model = Student

        fields = [
            "id",
            "registration_number",
            "first_name",
            "last_name",
            "phone",
            "program",
            "program_name",
            "department",
            "department_name",
            "year",
            "year_name",
            "status",
            "faceid_embeded",
            "created_at",
            "updated_at",
            "student_profile_image",
        ]
        
        read_only_fields = ["faceid_embeded","id","created_at","updated_at"]
    def get_student_profile_image(self, obj):

        request = self.context.get("request")

        if obj.student_profile_image:
            return request.build_absolute_uri(
                obj.student_profile_image.url
            )

        return None

class StudentFaceSerializer(
    serializers.ModelSerializer
):
    student_profile_image = serializers.ImageField(source = 'student.student_profile_image',read_only=True)
    program_name = serializers.CharField(
        source='student.program.name',
        read_only=True
    )

    department_name = serializers.CharField(
        source='student.department.name',
        read_only=True
    )

    year_name = serializers.CharField(
        source='student.year.year',
        read_only=True
    )
    student_registration_number = serializers.CharField(
        source='student.registration_number',
        read_only=True
    )


    student_name =serializers.SerializerMethodField()

    class Meta:

        model = StudentFace

        fields = [
            'id',

            'program_name',
            
            'department_name',
            
            'student',
            
            'year_name',

            'student_registration_number',

            'student_name',

            'model_version',
            
            'accuracy',

            'created_at',
            
            'updated_at',
            
            'student_profile_image',
            
            'embedding',
        ]
        read_only = ['student_name','created_data','updated_at','id']

    def get_student_name(self, obj):

        return (
            f"{obj.student.first_name} "
            f"{obj.student.last_name}"
        )
    def get_student_profile_image(self, obj):

        request = self.context.get("request")

        if obj.student_profile_image:
            return request.build_absolute_uri(
                obj.student_profile_image.url
            )

class CourseSerializer(serializers.ModelSerializer):

    class Meta:

        model = Course

        fields = '__all__'

class ProgramSerializer(serializers.ModelSerializer):

    class Meta:

        model = Program

        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:

        model = Department

        fields = '__all__'

class AcademicYearSerializer(serializers.ModelSerializer):

    year_display = serializers.CharField(
        source='get_year_display',
        read_only=True
    )

    class Meta:

        model = AcademicYear

        fields = [
            'id',
            'year',
            'year_display'
        ]

class VenueSerializer(serializers.ModelSerializer):

    class Meta:

        model = Venue

        fields = '__all__'

class ExamSessionSerializer(serializers.ModelSerializer):

    venue_name = serializers.CharField(
        source='venue.name',
        read_only=True
    )

    class Meta:

        model = ExamSession

        fields = [
            'id',
            'exam_date',
            'start_time',
            'end_time',
            'venue',
            'venue_name'
        ]

class ExamTimetableSerializer(serializers.ModelSerializer):

    course_name = serializers.CharField(
        source='course.title',
        read_only=True
    )

    course_code = serializers.CharField(
        source='course.code',
        read_only=True
    )

    venue_name = serializers.CharField(
        source='session.venue.name',
        read_only=True
    )

    class Meta:

        model = ExamTimetable

        fields = [
            'id',

            'session',

            'course',
            'course_name',
            'course_code',

            'program',
            'year',

            'venue_name'
        ]

class DeviceSerializer(serializers.ModelSerializer):

    venue_name = serializers.CharField(
        source='venue.name',
        read_only=True
    )

    class Meta:

        model = Device

        fields = [
            'id',
            'device_id',
            'name',
            'venue',
            'venue_name',
            'api_key',
            'is_active',
            'last_seen_at',
            'updated_at'
        ]

        # api_key is generated server-side and never echoed back once set;
        # it's only ever visible in the Django admin so it can be copied
        # onto the physical device once during setup.
        extra_kwargs = {
            'api_key': {'write_only': True}
        }

        read_only_fields = (
            'last_seen_at',
            'updated_at',
        )


class SessionRosterSerializer(serializers.ModelSerializer):
    """
    Roster entry served to a device for one exam sitting: just enough
    to run recognition and know who was matched. Reuses StudentFace
    since that's where the embedding already lives.
    """
    student_id = serializers.CharField(source='student.id', read_only=True)
    registration_number = serializers.CharField(
        source='student.registration_number', read_only=True
    )
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentFace
        fields = [
            'student_id',
            'registration_number',
            'student_name',
            'embedding',
            'model_version',
            'accuracy',
        ]

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

class DeviceCommandSerializer(serializers.ModelSerializer):

    device_name = serializers.CharField(
        source='device.device_id',
        read_only=True
    )

    class Meta:

        model = DeviceCommand

        fields = [
            'id',
            'device',
            'device_name',
            'command',
            'payload',
            'is_executed',
            'created_at'
        ]

        read_only_fields = (
            'created_at',
        )