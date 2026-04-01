import { useEffect, useState } from "react";
import { studentsApi, Student } from "@/lib/api";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Plus, Search, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roomNumber: "",
    course: "",
    year: "",
    guardianName: "",
    guardianPhone: "",
  });

  type EditStudentData = Omit<Student, "year" | "roomNumber"> & {
    year: string;
    roomNumber: string;
  };
  const [editStudentData, setEditStudentData] = useState<EditStudentData | null>(null);

  // Course and Year filter for export
  const [exportCourse, setExportCourse] = useState<string>("");
  const [exportYear, setExportYear] = useState<string>("");
  const uniqueCourses = Array.from(new Set(students.map((s) => s.course))).filter(Boolean);
  const uniqueYears = Array.from(new Set(students.map((s) => s.year))).filter(Boolean);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.roomNumber && student.roomNumber.includes(searchTerm))
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const sortByRoomNumber = (arr: Student[]) => {
    return arr.slice().sort((a, b) => {
      if (!a.roomNumber) return 1;
      if (!b.roomNumber) return -1;
      return parseInt(a.roomNumber) - parseInt(b.roomNumber);
    });
  };

  const fetchStudents = async () => {
    try {
      const data = await studentsApi.getAll();
      const sorted = sortByRoomNumber(data);
      setStudents(sorted);
      setFilteredStudents(sorted);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Error fetching students: " + error.message);
      } else {
        toast.error("Error fetching students");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomNumber) {
      toast.error("Please assign a room number to the student");
      return;
    }
    try {
      await studentsApi.add({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        roomNumber: formData.roomNumber || undefined,
        course: formData.course,
        year: parseInt(formData.year),
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
      });
      toast.success("Student added successfully!");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        roomNumber: "",
        course: "",
        year: "",
        guardianName: "",
        guardianPhone: "",
      });
      fetchStudents();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Error adding student: " + error.message);
      } else {
        toast.error("Error adding student");
      }
    }
  };

  const handleEditClick = (student: Student) => {
    setEditStudentData({
      ...student,
      year: student.year.toString(),
      roomNumber: student.roomNumber || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudentData) return;
    if (!editStudentData.roomNumber) {
      toast.error("Please enter a room number to update the student");
      return;
    }
    try {
      await studentsApi.update(editStudentData.id, {
        name: editStudentData.name,
        email: editStudentData.email,
        phone: editStudentData.phone,
        roomNumber: editStudentData.roomNumber || undefined,
        course: editStudentData.course,
        year: parseInt(editStudentData.year),
        guardianName: editStudentData.guardianName,
        guardianPhone: editStudentData.guardianPhone,
      });
      toast.success("Student updated successfully!");
      setIsEditDialogOpen(false);
      setEditStudentData(null);
      fetchStudents();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Error updating student: " + error.message);
      } else {
        toast.error("Error updating student");
      }
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.name}?`)) return;
    try {
      await studentsApi.delete(student.id);
      toast.success("Student deleted successfully!");
      fetchStudents();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Error deleting student: " + error.message);
      } else {
        toast.error("Error deleting student");
      }
    }
  };

  const handleExportCSV = () => {
    let toExport = [...students];
    if (exportCourse) toExport = toExport.filter((s) => s.course === exportCourse);
    if (exportYear) toExport = toExport.filter((s) => s.year.toString() === exportYear);

    if (toExport.length === 0) {
      toast.error("No students found to export.");
      return;
    }

    const headers = ["Name", "Email", "Phone", "Room", "Course", "Year", "Guardian Name", "Guardian Phone"];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      toExport
        .map((s) => [s.name, s.email, s.phone, s.roomNumber || "N/A", s.course, s.year, s.guardianName, s.guardianPhone].join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully");
  };

  const handleExportPDF = () => {
    let toExport = [...students];
    if (exportCourse) toExport = toExport.filter((s) => s.course === exportCourse);
    if (exportYear) toExport = toExport.filter((s) => s.year.toString() === exportYear);

    if (toExport.length === 0) {
      toast.error("No students found to export.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Students Export", 14, 15);
    
    const tableColumn = ["Name", "Email", "Phone", "Room", "Course", "Year"];
    const tableRows = toExport.map(student => [
      student.name,
      student.email,
      student.phone,
      student.roomNumber || "N/A",
      student.course,
      student.year
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("students_export.pdf");
    toast.success("PDF exported successfully");
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

            <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
              <Download className="w-4 h-4" />
              PDF
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
                      <Label htmlFor="room_number">Room Number *</Label>
                      <Input
                        id="room_number"
                        value={formData.roomNumber}
                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                        required
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
                        value={formData.guardianName}
                        onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardian_phone">Guardian Phone *</Label>
                      <Input
                        id="guardian_phone"
                        value={formData.guardianPhone}
                        onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
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
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>{student.roomNumber || "N/A"}</TableCell>
                      <TableCell>{student.course}</TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteStudent(student)}>
                          Delete
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(student)}>
                          Edit
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
                        <Label htmlFor="edit_room_number">Room Number *</Label>
                        <Input
                          id="edit_room_number"
                          value={editStudentData.roomNumber}
                          onChange={(e) => setEditStudentData({ ...editStudentData, roomNumber: e.target.value })}
                          required
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
                          onChange={(e) => setEditStudentData({ ...editStudentData!, year: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_guardian_name">Guardian Name *</Label>
                        <Input
                          id="edit_guardian_name"
                          value={editStudentData.guardianName}
                          onChange={(e) => setEditStudentData({ ...editStudentData, guardianName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_guardian_phone">Guardian Phone *</Label>
                        <Input
                          id="edit_guardian_phone"
                          value={editStudentData.guardianPhone}
                          onChange={(e) => setEditStudentData({ ...editStudentData, guardianPhone: e.target.value })}
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
