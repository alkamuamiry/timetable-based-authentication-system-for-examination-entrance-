import numpy as np


class StudentDatabase:
    """
    Stores all authorized students in RAM.

    Structure:
    [
        {
            "student_id": 1,
            "registration_number": "2022-01-00001",
            "name": "John Doe",
            "embedding": np.array([...], dtype=np.float32)
        },
        ...
    ]
    """

    def __init__(self):
        self.students = []

    def clear(self):
        """Remove all loaded students."""
        self.students.clear()

    def load(self, data):
        """
        Load students from API response.

        Expected API response:

        [
            {
                "student_id":1,
                "registration_number":"2022-01-0001",
                "name":"John Doe",
                "embedding":[0.12,0.45,...]
            },
            ...
        ]
        """

        self.clear()

        for item in data:

            embedding = np.array(
                item["embedding"],
                dtype=np.float32
            )

            self.students.append({

                "student_id": item["student_id"],

                "registration_number":
                    item["registration_number"],

                "name": item["name"],

                "embedding": embedding

            })

    def get_students(self):
        return self.students

    def count(self):
        return len(self.students)

    def is_empty(self):
        return len(self.students) == 0

    def get_student(self, student_id):

        for student in self.students:

            if student["student_id"] == student_id:

                return student

        return None