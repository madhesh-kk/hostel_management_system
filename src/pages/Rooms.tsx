import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface Room {
  id: string;
  room_number: string;
  capacity: number;
  occupied: number;
  floor: number;
  room_type: string;
  status: string;
}

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    room_number: "",
    capacity: "2",
    floor: "1",
    room_type: "standard",
    status: "available",
  });
  const [editRoomData, setEditRoomData] = useState<any>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number", { ascending: true });

      if (error) throw error;
      setRooms(data || []);
    } catch (error: any) {
      toast.error("Error fetching rooms: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Check for duplicate room number
      const { data: existing } = await supabase
        .from("rooms")
        .select("room_number")
        .eq("room_number", formData.room_number)
        .single();

      if (existing) {
        toast.error("Room number already exists!");
        return;
      }

      const { error } = await supabase.from("rooms").insert([
        {
          ...formData,
          capacity: parseInt(formData.capacity),
          floor: parseInt(formData.floor),
          occupied: 0,
        },
      ]);

      if (error) throw error;

      toast.success("Room added successfully!");
      setIsDialogOpen(false);
      setFormData({
        room_number: "",
        capacity: "2",
        floor: "1",
        room_type: "standard",
        status: "available",
      });
      fetchRooms();
    } catch (error: any) {
      toast.error("Error adding room: " + error.message);
    }
  };

  const handleEditClick = (room: Room) => {
    setEditRoomData({
      ...room,
      capacity: room.capacity.toString(),
      floor: room.floor.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoomData) return;
    try {
      const { error } = await supabase
        .from("rooms")
        .update({
          room_number: editRoomData.room_number,
          capacity: parseInt(editRoomData.capacity),
          floor: parseInt(editRoomData.floor),
          room_type: editRoomData.room_type,
          status: editRoomData.status,
        })
        .eq("id", editRoomData.id);
      if (error) throw error;
      toast.success("Room updated successfully!");
      setIsEditDialogOpen(false);
      setEditRoomData(null);
      fetchRooms();
    } catch (error: any) {
      toast.error("Error updating room: " + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "occupied":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "maintenance":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Rooms</h1>
            <p className="text-muted-foreground">Manage room allocations</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room_number">Room Number *</Label>
                  <Input
                    id="room_number"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    placeholder="e.g., 101, 202"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor *</Label>
                    <Input
                      id="floor"
                      type="number"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room_type">Room Type *</Label>
                  <Select
                    value={formData.room_type}
                    onValueChange={(value) => setFormData({ ...formData, room_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="deluxe">Deluxe</SelectItem>
                      <SelectItem value="suite">Suite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Add Room
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>All Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Occupied</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No rooms found
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.room_number}</TableCell>
                    <TableCell>{room.floor}</TableCell>
                    <TableCell className="capitalize">{room.room_type}</TableCell>
                    <TableCell>{room.occupied}</TableCell>
                    <TableCell>{room.capacity - room.occupied}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor((room.capacity - room.occupied) === 0 ? "occupied" : "available")}>
                        {(room.capacity - room.occupied) === 0 ? "occupied" : "available"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleEditClick(room)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
                {/* Edit Room Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Room</DialogTitle>
                    </DialogHeader>
                    {editRoomData && (
                      <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_room_number">Room Number *</Label>
                          <Input
                            id="edit_room_number"
                            value={editRoomData.room_number}
                            onChange={(e) => setEditRoomData({ ...editRoomData, room_number: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit_available">Available</Label>
                            <Input
                              id="edit_available"
                              type="number"
                              value={parseInt(editRoomData.capacity) - parseInt(editRoomData.occupied || 0)}
                              readOnly
                              className="bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_floor">Floor *</Label>
                            <Input
                              id="edit_floor"
                              type="number"
                              value={editRoomData.floor}
                              onChange={(e) => setEditRoomData({ ...editRoomData, floor: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit_room_type">Room Type *</Label>
                          <Select
                            value={editRoomData.room_type}
                            onValueChange={(value) => setEditRoomData({ ...editRoomData, room_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="deluxe">Deluxe</SelectItem>
                              <SelectItem value="suite">Suite</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit_status">Status *</Label>
                          <Select
                            value={editRoomData.status}
                            onValueChange={(value) => setEditRoomData({ ...editRoomData, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="occupied">Occupied</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full">
                          Save Changes
                        </Button>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Rooms;
