import { useEffect, useState } from "react";
import { roomsApi, Room } from "@/lib/api";
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
import { Plus, Trash2 } from "lucide-react";

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: "",
    capacity: "2",
    floor: "1",
    roomType: "standard",
    status: "available",
  });
  const [editRoomData, setEditRoomData] = useState<any>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await roomsApi.getAll();
      setRooms(data);
    } catch (error: any) {
      toast.error("Error fetching rooms: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roomsApi.add({
        roomNumber: formData.roomNumber,
        capacity: parseInt(formData.capacity),
        floor: parseInt(formData.floor),
        roomType: formData.roomType,
        status: formData.status,
      });
      toast.success("Room added successfully!");
      setIsDialogOpen(false);
      setFormData({
        roomNumber: "",
        capacity: "2",
        floor: "1",
        roomType: "standard",
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
      await roomsApi.update(editRoomData.id, {
        roomNumber: editRoomData.roomNumber,
        capacity: parseInt(editRoomData.capacity),
        floor: parseInt(editRoomData.floor),
        roomType: editRoomData.roomType,
        status: editRoomData.status,
      });
      toast.success("Room updated successfully!");
      setIsEditDialogOpen(false);
      setEditRoomData(null);
      fetchRooms();
    } catch (error: any) {
      toast.error("Error updating room: " + error.message);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await roomsApi.delete(id);
        toast.success("Room deleted successfully!");
        fetchRooms();
      } catch (error: any) {
        toast.error("Error deleting room: " + error.message);
      }
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
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
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
                    value={formData.roomType}
                    onValueChange={(value) => setFormData({ ...formData, roomType: value })}
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
                  <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="font-medium">{room.roomNumber}</TableCell>
                      <TableCell>{room.floor}</TableCell>
                      <TableCell className="capitalize">{room.roomType}</TableCell>
                      <TableCell>{room.occupied}</TableCell>
                      <TableCell>{room.capacity - room.occupied}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor((room.capacity - room.occupied) === 0 ? "occupied" : "available")}>
                          {(room.capacity - room.occupied) === 0 ? "occupied" : "available"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(room)}>
                          Edit
                        </Button>
                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDeleteClick(room.id)}>
                          <Trash2 className="w-4 h-4" />
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
                        value={editRoomData.roomNumber}
                        onChange={(e) => setEditRoomData({ ...editRoomData, roomNumber: e.target.value })}
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
                        value={editRoomData.roomType}
                        onValueChange={(value) => setEditRoomData({ ...editRoomData, roomType: value })}
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
