package com.hostel.controller;

import com.hostel.repository.RoomRepository;
import com.hostel.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private RoomRepository roomRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        long totalStudents = studentRepository.count();
        long totalRooms = roomRepository.count();
        long availableRooms = roomRepository.countByStatus("available");
        long occupiedRooms = totalRooms - availableRooms;

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("totalRooms", totalRooms);
        stats.put("availableRooms", availableRooms);
        stats.put("occupiedRooms", occupiedRooms);

        return ResponseEntity.ok(stats);
    }
}
