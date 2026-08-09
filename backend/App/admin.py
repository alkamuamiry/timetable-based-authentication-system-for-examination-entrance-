from django.contrib import admin

from django.contrib.auth.admin import (
    UserAdmin
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
    College,
    AuthConfig,
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    def has_delete_permission(self, request, obj=None):
        if obj and obj == request.user:
            return False

        return True

    model = User

    list_display = (
        'email',
        'first_name',
        'last_name',
        'is_staff',
    )

    ordering = ('email',)

    search_fields = (
        'email',
        'first_name',
        'last_name',
    )

    fieldsets = (
        (None, {
            'fields': (
                'email',
                'password'
            )
        }),

        ('Personal Info', {
            'fields': (
                'first_name',
                'last_name',
                'phone',
                'profile_image',
                'address',
                'gender',
                'date_of_birth'
            )
        }),

        ('Permissions', {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions'
            )
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),

            'fields': (
                'email',
                'first_name',
                'last_name',
                'password1',
                'password2',
                'is_staff',
                'is_active'
            ),
        }),
    )
    
@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):

    list_display = (
        'name',
        'short_name',
        'department',
    )

    search_fields = (
        'name',
        'short_name',
        'department',
    )
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):

    list_display = (
        'name',
    )

    search_fields = (
        'name',
    )
@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):

    list_display = (
        'year',
    )
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'registration_number',
        'first_name',
        'last_name',
        'program',
        'phone',
        'status',
        'department',
        'year',
        'faceid_embeded',
        'created_at',
        'updated_at',
    )

    search_fields = (
        'registration_number',
        'first_name',
        'last_name'
        'status',
        'phone',
    )

    list_filter = (
        'program',
        'department',
        'year'
    )
@admin.register(StudentFace)
class StudentFaceAdmin(admin.ModelAdmin):

    list_display = (
        'student',
        'model_version',
        'created_at',
        'accuracy',
    )

    readonly_fields = (
        'created_at',
    )
@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):

    list_display = (
        'name',
        'capacity'
    )
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):

    list_display = (
        'code',
        'title'
    )

    search_fields = (
        'code',
        'title'
    )
@admin.register(ExamSession)
class ExamSessionAdmin(admin.ModelAdmin):

    list_display = (
        'exam_date',
        'start_time',
        'end_time',
        'venue'
    )

    list_filter = (
        'exam_date',
        'venue'
    )
@admin.register(ExamTimetable)
class ExamTimetableAdmin(admin.ModelAdmin):

    list_display = (
        'course',
        'program',
        'year',
        'session'
    )

    list_filter = (
        'program',
        'year'
    )
@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):

    list_display = (
        'device_id',
        'name',
        'venue',
        'is_active',
        'last_seen_at',
        'updated_at'
    )

    search_fields = (
        'device_id',
        'name',
    )

    list_filter = (
        'venue',
        'is_active'
    )

    # api_key is generated automatically and shown here (admin-only) so it
    # can be copied onto the physical device during setup; the API itself
    # never returns it once set.
    readonly_fields = (
        'api_key',
        'last_seen_at',
        'updated_at',
    )
@admin.register(DeviceCommand)
class DeviceCommandAdmin(admin.ModelAdmin):

    list_display = (
        'device',
        'command',
        'is_executed',
        'created_at'
    )

    list_filter = (
        'command',
        'is_executed'
    )

    readonly_fields = (
        'created_at',
    )
@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'short_name',
    )
    list_filter = (
        'short_name',
    )
    
    
@admin.register(AuthConfig)
class AuthConfigAdmin(admin.ModelAdmin):
    """
    Intentionally a singleton: there should only ever be one row here.
    Staff edit window_before_minutes / window_after_minutes to change
    how early/late students can authenticate around a session's start
    time — every device picks up the new values on its next schedule
    poll, no redeploy needed.
    """

    list_display = (
        'window_before_minutes',
        'window_after_minutes',
        'updated_at',
    )

    readonly_fields = (
        'updated_at',
    )

    def has_add_permission(self, request):
        # block creating a second row once one exists
        return not AuthConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False