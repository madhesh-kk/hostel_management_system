// Script to seed rooms 100-120, 200-220, 300-320 into the database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

const generateRooms = () => {
  const rooms = [];
  for (let i = 100; i <= 120; i++) {
    rooms.push({
      room_number: i.toString(),
      capacity: 3,
      occupied: 0,
      floor: 1,
      room_type: 'standard',
      status: 'available',
    });
  }
  for (let i = 200; i <= 220; i++) {
    rooms.push({
      room_number: i.toString(),
      capacity: 3,
      occupied: 0,
      floor: 2,
      room_type: 'standard',
      status: 'available',
    });
  }
  for (let i = 300; i <= 320; i++) {
    rooms.push({
      room_number: i.toString(),
      capacity: 3,
      occupied: 0,
      floor: 3,
      room_type: 'standard',
      status: 'available',
    });
  }
  return rooms;
};

async function seedRooms() {
  const rooms = generateRooms();
  for (const room of rooms) {
    const { error } = await supabase.from('rooms').insert([room]);
    if (error) {
      console.error(`Error inserting room ${room.room_number}:`, error.message);
    } else {
      console.log(`Inserted room ${room.room_number}`);
    }
  }
  console.log('Seeding complete.');
}

seedRooms();