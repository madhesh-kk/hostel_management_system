package com.hostel.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rooms")
@Data
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_number", nullable = false, unique = true)
    private String roomNumber;

    @Column(nullable = false)
    private Integer capacity = 2;

    @Column(nullable = false)
    private Integer occupied = 0;

    @Column(nullable = false)
    private Integer floor;

    @Column(name = "room_type", nullable = false)
    private String roomType = "standard";

    @Column(nullable = false)
    private String status = "available";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
