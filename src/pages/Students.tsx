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
import { toast } from "sonner";
import { Plus, Download, Search, FileText } from "lucide-react";

// Import jsPDF for PDF export
import jsPDF from "jspdf";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  room_number: string | null;
  course: string;
  year: number;
  guardian_name: string;
  guardian_phone: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
    // Delete student logic
    const handleDeleteStudent = async (student: Student) => {
      if (!window.confirm(`Are you sure you want to delete ${student.name}?`)) return;
      try {
        // If student has a room, decrement occupied in that room
        if (student.room_number) {
          const { data: room } = await supabase
            .from("rooms")
            .select("id, occupied, capacity")
            .eq("room_number", student.room_number)
            .single();
          if (room) {
            const newOccupied = Math.max((room.occupied || 1) - 1, 0);
            const newStatus = newOccupied >= room.capacity ? "occupied" : "available";
            await supabase
              .from("rooms")
              .update({
                occupied: newOccupied,
                status: newStatus,
              })
              .eq("id", room.id);
          }
        }
        // Delete student
        const { error } = await supabase
          .from("students")
          .delete()
          .eq("id", student.id);
        if (error) throw error;
        toast.success("Student deleted successfully!");
        fetchStudents();
        window.location.reload();
      } catch (error: any) {
        toast.error("Error deleting student: " + error.message);
      }
    };
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    room_number: "",
    course: "",
    year: "",
    guardian_name: "",
    guardian_phone: "",
  });
  const [editStudentData, setEditStudentData] = useState<any>(null);
  const handleEditClick = (student: Student) => {
    setEditStudentData({
      ...student,
      year: student.year.toString(),
      room_number: student.room_number || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudentData) return;
    try {
      // Get the current student data from the students array
      const currentStudent = students.find((s) => s.id === editStudentData.id);
      const oldRoomNumber = currentStudent?.room_number;
      const newRoomNumber = editStudentData.room_number || null;

      // Update the student
      const { error } = await supabase
        .from("students")
        .update({
          name: editStudentData.name,
          email: editStudentData.email,
          phone: editStudentData.phone,
          room_number: newRoomNumber,
          course: editStudentData.course,
          year: parseInt(editStudentData.year),
          guardian_name: editStudentData.guardian_name,
          guardian_phone: editStudentData.guardian_phone,
        })
        .eq("id", editStudentData.id);
      if (error) throw error;

      // If room number changed, update occupied counts
      if (oldRoomNumber && oldRoomNumber !== newRoomNumber) {
        // Decrease occupied in old room
        const { data: oldRoom } = await supabase
          .from("rooms")
          .select("id, occupied, capacity")
          .eq("room_number", oldRoomNumber)
          .single();
        if (oldRoom) {
          const newOccupied = Math.max((oldRoom.occupied || 1) - 1, 0);
          const newStatus = newOccupied >= oldRoom.capacity ? "occupied" : "available";
          await supabase
            .from("rooms")
            .update({
              occupied: newOccupied,
              status: newStatus,
            })
            .eq("id", oldRoom.id);
        }
      }
      if (newRoomNumber && oldRoomNumber !== newRoomNumber) {
        // Increase occupied in new room
        const { data: newRoom } = await supabase
          .from("rooms")
          .select("id, occupied, capacity")
          .eq("room_number", newRoomNumber)
          .single();
        if (newRoom) {
          const newOccupied = (newRoom.occupied || 0) + 1;
          const newStatus = newOccupied >= newRoom.capacity ? "occupied" : "available";
          await supabase
            .from("rooms")
            .update({
              occupied: newOccupied,
              status: newStatus,
            })
            .eq("id", newRoom.id);
        }
      }

      toast.success("Student updated successfully!");
      setIsEditDialogOpen(false);
      setEditStudentData(null);
      fetchStudents();
    } catch (error: any) {
      toast.error("Error updating student: " + error.message);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Helper to sort students by room_number (ascending, empty/null last)
  const sortByRoomNumber = (arr: Student[]) => {
    return arr.slice().sort((a, b) => {
      if (!a.room_number) return 1;
      if (!b.room_number) return -1;
      return parseInt(a.room_number) - parseInt(b.room_number);
    });
  };

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.room_number && student.room_number.includes(searchTerm))
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*");

      if (error) throw error;
      const sorted = sortByRoomNumber(data || []);
      setStudents(sorted);
      setFilteredStudents(sorted);
    } catch (error: any) {
      toast.error("Error fetching students: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // If a room number is provided, check if the room is available
      if (formData.room_number) {
        const { data: room, error: roomError } = await supabase
          .from("rooms")
          .select("id, capacity, occupied, status")
          .eq("room_number", formData.room_number)
          .single();
        if (roomError) throw roomError;
        if (!room) {
          toast.error("Room does not exist!");
          return;
        }
        if (room.occupied >= room.capacity) {
          toast.error("That room is already full.");
          return;
        }
        if (room.capacity > 0) {
          // can add student
        } else {
          toast.error("That room cannot accept students.");
          return;
        }
      }
      // Only do room change logic if editing a student
      // (editStudentData is only set in edit mode)

      const { error } = await supabase.from("students").insert([
        {
          ...formData,
          year: parseInt(formData.year),
          room_number: formData.room_number || null,
        },
      ]);

      if (error) throw error;

      // If a room was assigned, increment occupied and update status if needed (do not decrement capacity)
      if (formData.room_number) {
        const { data: room } = await supabase
          .from("rooms")
          .select("id, capacity, occupied")
          .eq("room_number", formData.room_number)
          .single();
        if (room) {
          const newOccupied = (room.occupied || 0) + 1;
          const newStatus = newOccupied >= room.capacity ? "occupied" : "available";
          await supabase
            .from("rooms")
            .update({
              occupied: newOccupied,
              status: newStatus
            })
            .eq("id", room.id);
        }
      }

      toast.success("Student added successfully!");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        room_number: "",
        course: "",
        year: "",
        guardian_name: "",
        guardian_phone: "",
      });
      // Refetch and sort after add
      fetchStudents();
    } catch (error: any) {
      toast.error("Error adding student: " + error.message);
    }
  };

  // Course and Year filter for export
  const [exportCourse, setExportCourse] = useState<string>("");
  const [exportYear, setExportYear] = useState<string>("");
  const uniqueCourses = Array.from(new Set(students.map((s) => s.course))).filter(Boolean);
  const uniqueYears = Array.from(new Set(students.map((s) => s.year))).filter(Boolean);

  const exportToCSV = () => {
    let exportList = filteredStudents;
    if (exportCourse) {
      exportList = exportList.filter((s) => s.course === exportCourse);
    }
    if (exportYear) {
      exportList = exportList.filter((s) => String(s.year) === exportYear);
    }
    const headers = ["Name", "Email", "Phone", "Room", "Course", "Year", "Guardian", "Guardian Phone"];
    const rows = exportList.map((s) => [
      s.name,
      s.email,
      s.phone,
      s.room_number || "N/A",
      s.course,
      s.year,
      s.guardian_name,
      s.guardian_phone,
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    let fileName = "students";
    if (exportCourse) fileName += `_${exportCourse}`;
    if (exportYear) fileName += `_year${exportYear}`;
    a.download = fileName + ".csv";
    a.click();
    toast.success("CSV exported successfully!");
  };

  // PDF export function
  const exportToPDF = () => {
    let exportList = filteredStudents;
    if (exportCourse) {
      exportList = exportList.filter((s) => s.course === exportCourse);
    }
    if (exportYear) {
      exportList = exportList.filter((s) => String(s.year) === exportYear);
    }
    const headers = ["Name", "Email", "Phone", "Room", "Course", "Year", "Guardian", "Guardian Phone"];
    const rows = exportList.map((s) => [
      s.name,
      s.email,
      s.phone,
      s.room_number || "N/A",
      s.course,
      s.year,
      s.guardian_name,
      s.guardian_phone,
    ]);

    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Student List", 14, 16);

    // Table header
    let startY = 24;
    let startX = 14;
    headers.forEach((header, i) => {
      doc.text(header, startX + i * 30, startY);
    });

    // Table rows
    rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        doc.text(String(cell), startX + colIndex * 30, startY + 8 + rowIndex * 8);
      });
    });

    let fileName = "students";
    if (exportCourse) fileName += `_${exportCourse}`;
    if (exportYear) fileName += `_year${exportYear}`;
    doc.save(fileName + ".pdf");
    toast.success("PDF exported successfully!");
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Students</h1>
            <p className="text-muted-foreground">Manage student records</p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Course and Year filter for export */}
            <div>
              <label htmlFor="export-course" className="text-sm mr-2">Filter by Course:</label>
              <select
                id="export-course"
                value={exportCourse}
                onChange={(e) => setExportCourse(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">All</option>
                {uniqueCourses.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="export-year" className="text-sm mr-2">Filter by Year:</label>
              <select
                id="export-year"
                value={exportYear}
                onChange={(e) => setExportYear(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">All</option>
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button onClick={exportToPDF} variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Export PDF
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room_number">Room Number</Label>
                      <Input
                        id="room_number"
                        value={formData.room_number}
                        onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course">Course *</Label>
                      <Input
                        id="course"
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardian_name">Guardian Name *</Label>
                      <Input
                        id="guardian_name"
                        value={formData.guardian_name}
                        onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardian_phone">Guardian Phone *</Label>
                      <Input
                        id="guardian_phone"
                        value={formData.guardian_phone}
                        onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Add Student
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, course, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Year</TableHead>
                                <TableHead>Delete</TableHead>
                <TableHead>Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>{student.room_number || "N/A"}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleEditClick(student)}>
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteStudent(student)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
                {/* Edit Student Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Student</DialogTitle>
                    </DialogHeader>
                    {editStudentData && (
                      <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit_name">Name *</Label>
                            <Input
                              id="edit_name"
                              value={editStudentData.name}
                              onChange={(e) => setEditStudentData({ ...editStudentData, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_email">Email *</Label>
                            <Input
                              id="edit_email"
                              type="email"
                              value={editStudentData.email}
                              onChange={(e) => setEditStudentData({ ...editStudentData, email: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_phone">Phone *</Label>
                            <Input
                              id="edit_phone"
                              value={editStudentData.phone}
                              onChange={(e) => setEditStudentData({ ...editStudentData, phone: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_room_number">Room Number</Label>
                            <Input
                              id="edit_room_number"
                              value={editStudentData.room_number}
                              onChange={(e) => setEditStudentData({ ...editStudentData, room_number: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_course">Course *</Label>
                            <Input
                              id="edit_course"
                              value={editStudentData.course}
                              onChange={(e) => setEditStudentData({ ...editStudentData, course: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_year">Year *</Label>
                            <Input
                              id="edit_year"
                              type="number"
                              value={editStudentData.year}
                              onChange={(e) => setEditStudentData({ ...editStudentData, year: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_guardian_name">Guardian Name *</Label>
                            <Input
                              id="edit_guardian_name"
                              value={editStudentData.guardian_name}
                              onChange={(e) => setEditStudentData({ ...editStudentData, guardian_name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit_guardian_phone">Guardian Phone *</Label>
                            <Input
                              id="edit_guardian_phone"
                              value={editStudentData.guardian_phone}
                              onChange={(e) => setEditStudentData({ ...editStudentData, guardian_phone: e.target.value })}
                              required
                            />
                          </div>
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

export default Students;
