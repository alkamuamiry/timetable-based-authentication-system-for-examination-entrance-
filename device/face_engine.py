import cv2
import face_recognition
import numpy as np


class FaceEngine:
    """
    Handles all face processing:
        1. Detect face
        2. Extract embedding
        3. Compare against database
    """

    def __init__(self, tolerance=0.50):
        self.tolerance = tolerance

    # ---------------------------------------------------
    # Detect faces
    # ---------------------------------------------------
    def detect_faces(self, frame):
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        face_locations = face_recognition.face_locations(
            rgb,
            model="hog"          # Use "cnn" only if you have CUDA
        )

        return face_locations

    # ---------------------------------------------------
    # Extract embeddings
    # ---------------------------------------------------
    def extract_embeddings(self, frame, face_locations):

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        encodings = face_recognition.face_encodings(
            rgb,
            face_locations
        )

        return encodings

    # ---------------------------------------------------
    # Find best match
    # ---------------------------------------------------
    def find_match(self, embedding, students):

        """
        students = [
            {
                "student_id":1,
                "name":"John",
                "embedding":np.array(...)
            },
            ...
        ]
        """

        if len(students) == 0:
            return None

        embeddings = []

        for student in students:
            embeddings.append(student["embedding"])

        distances = face_recognition.face_distance(
            embeddings,
            embedding
        )

        best_index = np.argmin(distances)

        best_distance = distances[best_index]

        if best_distance < self.tolerance:

            student = students[best_index].copy()

            student["distance"] = float(best_distance)

            return student

        return None

    # ---------------------------------------------------
    # Full recognition pipeline
    # ---------------------------------------------------
    def recognize(self, frame, students):

        faces = self.detect_faces(frame)

        if len(faces) == 0:

            return {
                "status": "NO_FACE"
            }

        embeddings = self.extract_embeddings(
            frame,
            faces
        )

        if len(embeddings) == 0:

            return {
                "status": "FAILED"
            }

        match = self.find_match(
            embeddings[0],
            students
        )

        if match is None:

            return {
                "status": "FAILED"
            }

        return {
            "status": "SUCCESS",
            "student": match,
            "location": faces[0]
        }