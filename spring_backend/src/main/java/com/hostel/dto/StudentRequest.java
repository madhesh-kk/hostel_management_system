package com.hostel.dto;

import lombok.Data;

@Data
public class StudentRequest {
    private String name;
    private String email;
    private String phone;
    private String roomNumber;
    private String course;
    private Integer year;
    private String guardianName;
    private String guardianPhone;
}
