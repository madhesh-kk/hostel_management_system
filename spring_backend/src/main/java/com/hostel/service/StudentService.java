package com.hostel.service;

import com.hostel.dto.StudentRequest;
import com.hostel.model.Room;
import com.hostel.model.Student;
import com.hostel.repository.RoomRepository;
import com.hostel.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private RoomRepository roomRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll(Sort.by("roomNumber").ascending());
    }

    @Transactional
    public Student addStudent(StudentRequest req) {
        // Validate room if provided
        if (req.getRoomNumber() != null && !req.getRoomNumber().isBlank()) {
            Room room = roomRepository.findByRoomNumber(req.getRoomNumber())
                    .orElseThrow(() -> new RuntimeException("There is no room with this number."));
            if (room.getOccupied() >= room.getCapacity()) {
                throw new RuntimeException("That room is already full.");
            }
            // Increment occupied
            room.setOccupied(room.getOccupied() + 1);
            if (room.getOccupied() >= room.getCapacity()) {
                room.setStatus("occupied");
            } else {
                room.setStatus("available");
            }
            roomRepository.save(room);
        }

        Student student = new Student();
        mapRequestToStudent(req, student);
        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudent(Long id, StudentRequest req) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String oldRoom = student.getRoomNumber();
        String newRoom = (req.getRoomNumber() != null && !req.getRoomNumber().isBlank())
                ? req.getRoomNumber() : null;

        // Handle room change
        if (oldRoom != null && !oldRoom.equals(newRoom)) {
            // Decrement old room
            roomRepository.findByRoomNumber(oldRoom).ifPresent(room -> {
                int newOcc = Math.max(room.getOccupied() - 1, 0);
                room.setOccupied(newOcc);
                room.setStatus(newOcc >= room.getCapacity() ? "occupied" : "available");
                roomRepository.save(room);
            });
        }

        if (newRoom != null && !newRoom.equals(oldRoom)) {
            // Increment new room
            Room room = roomRepository.findByRoomNumber(newRoom)
                    .orElseThrow(() -> new RuntimeException("There is no room with this number."));
            if (room.getOccupied() >= room.getCapacity()) {
                throw new RuntimeException("That room is already full.");
            }
            room.setOccupied(room.getOccupied() + 1);
            room.setStatus(room.getOccupied() >= room.getCapacity() ? "occupied" : "available");
            roomRepository.save(room);
        }

        mapRequestToStudent(req, student);
        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Decrement room occupied count if assigned
        if (student.getRoomNumber() != null) {
            roomRepository.findByRoomNumber(student.getRoomNumber()).ifPresent(room -> {
                int newOcc = Math.max(room.getOccupied() - 1, 0);
                room.setOccupied(newOcc);
                room.setStatus(newOcc >= room.getCapacity() ? "occupied" : "available");
                roomRepository.save(room);
            });
        }

        studentRepository.deleteById(id);
    }

    private void mapRequestToStudent(StudentRequest req, Student student) {
        student.setName(req.getName());
        student.setEmail(req.getEmail());
        student.setPhone(req.getPhone());
        student.setRoomNumber((req.getRoomNumber() != null && !req.getRoomNumber().isBlank())
                ? req.getRoomNumber() : null);
        student.setCourse(req.getCourse());
        student.setYear(req.getYear());
        student.setGuardianName(req.getGuardianName());
        student.setGuardianPhone(req.getGuardianPhone());
    }
}
