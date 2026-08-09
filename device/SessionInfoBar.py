from PyQt6.QtWidgets import QWidget, QLabel, QHBoxLayout, QVBoxLayout
from PyQt6.QtCore import Qt, QTimer, QDateTime
from PyQt6.QtGui import QFont


class SessionInfoBar(QWidget):
    """
    Persistent bar above the camera feed. Shows, at a glance:
      - which exam sitting is currently loaded (course code + title)
      - its scheduled exam time
      - how many students are in its roster
      - a live clock (updates every second, independent of the
        schedule polling interval)
      - a status pill: AUTH OPEN (green) / WAITING (amber) / IDLE (gray)

    While waiting between sessions, shows the next upcoming sitting
    and when its authentication window opens instead.
    """

    def __init__(self, parent=None):

        super().__init__(parent)

        self.setAttribute(
            Qt.WidgetAttribute.WA_StyledBackground, True
        )

        self.setStyleSheet(
            "background-color: rgb(15, 15, 20); color: #ffffff;"
        )

        self.setFixedHeight(78)

        outer = QVBoxLayout()

        outer.setContentsMargins(14, 8, 14, 8)

        outer.setSpacing(2)

        self.setLayout(outer)

        # -----------------------------------------
        # Top row: course + status pill
        # -----------------------------------------

        top_row = QHBoxLayout()

        self.course_label = QLabel("Checking today's schedule...")

        self.course_label.setFont(
            QFont("Segoe UI", 13, QFont.Weight.Bold)
        )

        self.status_pill = QLabel("IDLE")

        self.status_pill.setAlignment(
            Qt.AlignmentFlag.AlignCenter
        )

        self.status_pill.setFixedWidth(90)

        self.status_pill.setFont(
            QFont("Segoe UI", 9, QFont.Weight.Bold)
        )

        self._set_pill_style("#7f8c8d")  # gray

        top_row.addWidget(self.course_label)

        top_row.addStretch()

        top_row.addWidget(self.status_pill)

        outer.addLayout(top_row)

        # -----------------------------------------
        # Bottom row: exam time, roster count, clock
        # -----------------------------------------

        bottom_row = QHBoxLayout()

        self.time_range_label = QLabel("")

        self.time_range_label.setFont(
            QFont("Segoe UI", 10)
        )

        self.time_range_label.setStyleSheet(
            "color: #ffffff;"
        )

        self.count_label = QLabel("")

        self.count_label.setFont(
            QFont("Segoe UI", 10)
        )

        self.count_label.setStyleSheet(
            "color: #ffffff;"
        )

        self.clock_label = QLabel("")

        self.clock_label.setFont(
            QFont("Segoe UI", 10, QFont.Weight.Bold)
        )

        self.clock_label.setStyleSheet(
            "color: #ffffff;"
        )

        bottom_row.addWidget(self.time_range_label)

        bottom_row.addStretch()

        bottom_row.addWidget(self.count_label)

        bottom_row.addStretch()

        bottom_row.addWidget(self.clock_label)

        outer.addLayout(bottom_row)

        # -----------------------------------------
        # Live clock - own timer, ticks every second
        # regardless of how often the schedule is polled
        # -----------------------------------------

        self.clock_timer = QTimer()

        self.clock_timer.timeout.connect(
            self._tick_clock
        )

        self.clock_timer.start(1000)

        self._tick_clock()

    def _tick_clock(self):

        self.clock_label.setText(
            QDateTime.currentDateTime().toString("HH:mm:ss")
        )

    def _set_pill_style(self, color):

        self.status_pill.setStyleSheet(
            f"background-color: {color}; border-radius: 8px; padding: 3px;"
        )

    # -----------------------------------------------------------
    # A session's authentication window is open and its roster
    # is loaded and ready
    # -----------------------------------------------------------

    def show_open_session(
        self,
        course_code,
        course_title,
        start_time,
        end_time,
        student_count
    ):

        self.course_label.setText(
            f"{course_code} — {course_title}"
        )

        self.time_range_label.setText(
            f"Exam: {start_time} - {end_time}"
        )

        self.count_label.setText(
            f"{student_count} students loaded"
        )

        self.status_pill.setText("AUTH OPEN")

        self._set_pill_style("#2ecc71")  # green

    # -----------------------------------------------------------
    # No sitting's window is currently open. next_entry is the
    # next upcoming schedule entry (dict from the schedule
    # response) or None if the day is done.
    # -----------------------------------------------------------

    def show_waiting(self, next_entry=None):

        self.count_label.setText("")

        if next_entry:

            self.course_label.setText(
                f"Next: {next_entry['course_code']} — "
                f"{next_entry['course_title']}"
            )

            self.time_range_label.setText(
                f"Opens at {next_entry['auth_window_start']}"
            )

            self.status_pill.setText("WAITING")

            self._set_pill_style("#f39c12")  # amber

        else:

            self.course_label.setText(
                "No more sessions today"
            )

            self.time_range_label.setText("")

            self.status_pill.setText("IDLE")

            self._set_pill_style("#7f8c8d")  # gray