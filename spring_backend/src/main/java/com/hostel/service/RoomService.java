package com.hostel.service;

import com.hostel.dto.RoomRequest;
import com.hostel.model.Room;
import com.hostel.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll(Sort.by("roomNumber").ascending());
    }

    public Room addRoom(RoomRequest req) {
        if (roomRepository.existsByRoomNumber(req.getRoomNumber())) {
            throw new RuntimeException("Room number already exists!");
        }

        Room room = new Room();
        room.setRoomNumber(req.getRoomNumber());
        room.setCapacity(req.getCapacity() != null ? req.getCapacity() : 2);
        room.setFloor(req.getFloor());
        room.setRoomType(req.getRoomType() != null ? req.getRoomType() : "standard");
        room.setStatus(req.getStatus() != null ? req.getStatus() : "available");
        room.setOccupied(0);
        return roomRepository.save(room);
    }

    public Room updateRoom(Long id, RoomRequest req) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        room.setRoomNumber(req.getRoomNumber());
        room.setFloor(req.getFloor());
        room.setRoomType(req.getRoomType());
        room.setStatus(req.getStatus());
        if (req.getCapacity() != null) {
            room.setCapacity(req.getCapacity());
        }
        return roomRepository.save(room);
    }

    public void deleteRoom(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new RuntimeException("Room not found");
        }
        roomRepository.deleteById(id);
    }
}
