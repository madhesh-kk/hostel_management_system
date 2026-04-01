package com.hostel.dto;

import lombok.Data;

@Data
public class RoomRequest {
    private String roomNumber;
    private Integer capacity;
    private Integer floor;
    private String roomType;
    private String status;
}
