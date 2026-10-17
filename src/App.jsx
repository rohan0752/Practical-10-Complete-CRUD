import { useState, useMemo } from 'react';
import './App.css';

const INITIAL_STUDENTS = [
  {
    id: 1,
    rollNo: 'BCA-2024-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    course: 'BCA (Hons.)',
    semester: '5th',
    gpa: '8.8',
    status: 'Active',
  },
  {
    id: 2,
    rollNo: 'BCA-2024-014',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    course: 'BCA (Hons.)',
    semester: '5th',
    gpa: '9.3',
    status: 'Active',
  },
  {
    id: 3,
    rollNo: 'BCA-2024-023',
    name: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    course: 'BCA (General)',
    semester: '3rd',
    gpa: '7.6',
    status: 'Inactive',
  },
  {
    id: 4,
    rollNo: 'MCA-2025-008',
    name: 'Sneha Kulkarni',
    email: 'sneha.k@example.com',
    course: 'MCA',
    semester: '1st',
    gpa: '9.0',
    status: 'Active',
  },
  {
    id: 5,
    rollNo: 'BCA-2024-045',
    name: 'Vikram Malhotra',
    email: 'vikram.m@example.com',
    course: 'BCA (Hons.)',
    semester: '5th',
    gpa: '8.2',
    status: 'Active',
  },
];

const COURSES = ['BCA (Hons.)', 'BCA (General)', 'MCA', 'B.Sc Computer Science'];
const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

const EMPTY_FORM = {
  rollNo: '',
  name: '',
  email: '',
  course: 'BCA (Hons.)',
  semester: '5th',
  gpa: '',
  status: 'Active',
};

export default function App() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('rollNo');
  const [sortOrder, setSortOrder] = useState('asc');

  // Form modal state (for Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Undo notification state
  const [lastDeleted, setLastDeleted] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!formData.rollNo.trim()) {
      errs.rollNo = 'Roll No is required';
    } else {
      const duplicate = students.find(
        (s) => s.rollNo.toLowerCase() === formData.rollNo.trim().toLowerCase() && s.id !== currentId
      );
      if (duplicate) errs.rollNo = 'Roll number must be unique';
    }

    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      errs.name = 'Name must be at least 3 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    if (!formData.gpa) {
      errs.gpa = 'GPA is required';
    } else {
      const gpaNum = parseFloat(formData.gpa);
      if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 10) {
        errs.gpa = 'GPA must be between 0.0 and 10.0';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode('create');
    setCurrentId(null);
    setFormData(EMPTY_FORM);
    setErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (student) => {
    setModalMode('edit');
    setCurrentId(student.id);
    setFormData({
      rollNo: student.rollNo,
      name: student.name,
      email: student.email,
      course: student.course,
      semester: student.semester,
      gpa: student.gpa,
      status: student.status,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSave = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (modalMode === 'create') {
      const newStudent = {
        id: Date.now(),
        rollNo: formData.rollNo.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        course: formData.course,
        semester: formData.semester,
        gpa: parseFloat(formData.gpa).toFixed(1),
        status: formData.status,
      };
      setStudents([newStudent, ...students]);
      showToast(`Added student: ${newStudent.name}`);
    } else {
      setStudents(
        students.map((s) =>
          s.id === currentId
            ? {
                ...s,
                rollNo: formData.rollNo.trim(),
                name: formData.name.trim(),
                email: formData.email.trim(),
                course: formData.course,
                semester: formData.semester,
                gpa: parseFloat(formData.gpa).toFixed(1),
                status: formData.status,
              }
            : s
        )
      );
      showToast(`Updated student: ${formData.name}`);
    }

    setIsModalOpen(false);
  };

  // Delete Action
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setLastDeleted(deleteTarget);
    setStudents(students.filter((s) => s.id !== deleteTarget.id));
    setDeleteTarget(null);
    showToast(`Deleted ${deleteTarget.name}. (Click Undo to restore)`);
  };

  // Undo Delete
  const handleUndoDelete = () => {
    if (!lastDeleted) return;
    setStudents([lastDeleted, ...students]);
    showToast(`Restored ${lastDeleted.name}`);
    setLastDeleted(null);
  };

  // Reset to initial mock data
  const handleResetData = () => {
    if (window.confirm('Reset all records to default demo data?')) {
      setStudents(INITIAL_STUDENTS);
      setLastDeleted(null);
      showToast('Reset records to defaults');
    }
  };

  // Filtered & Sorted Student List
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = courseFilter === 'All' || s.course === courseFilter;
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
        return matchesSearch && matchesCourse && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (sortBy === 'gpa') {
          valA = parseFloat(valA);
          valB = parseFloat(valB);
        } else {
          valA = valA.toString().toLowerCase();
          valB = valB.toString().toLowerCase();
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [students, searchTerm, courseFilter, statusFilter, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status === 'Active').length;
    const avgGpa = total > 0 ? (students.reduce((acc, s) => acc + parseFloat(s.gpa || 0), 0) / total).toFixed(2) : '0.00';
    return { total, active, avgGpa };
  }, [students]);

  return (
    <div className="crud-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-banner">
          <span>{toastMessage}</span>
          {lastDeleted && (
            <button className="undo-btn" onClick={handleUndoDelete}>
              Undo
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <header className="page-header">
        <div className="badge-pill">Practical 10 &bull; BCA (Hons.) React Curriculum</div>
        <h1>Student Record Management</h1>
        <p className="subtitle">Complete CRUD Operations with Real-Time Filtering, Validation, and State Persistence</p>
      </header>

      {/* KPI Stats Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Enrolled</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">Across all semesters</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Students</div>
          <div className="stat-value text-emerald">{stats.active}</div>
          <div className="stat-sub">{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% active rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average GPA</div>
          <div className="stat-value text-indigo">{stats.avgGpa}</div>
          <div className="stat-sub">Scale of 10.0</div>
        </div>
        <div className="stat-card action-card">
          <button className="btn-primary" onClick={handleOpenCreate}>
            <span className="btn-icon">+</span> Add New Student
          </button>
          <button className="btn-secondary" onClick={handleResetData}>
            Reset Demo Data
          </button>
        </div>
      </section>

      {/* Controls Bar */}
      <section className="controls-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, roll no, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>
              &times;
            </button>
          )}
        </div>

        <div className="filters-group">
          <div className="select-wrapper">
            <label>Course:</label>
            <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="All">All Courses</option>
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="select-wrapper">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="select-wrapper">
            <label>Sort By:</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
            >
              <option value="rollNo-asc">Roll No (A-Z)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="gpa-desc">GPA (Highest)</option>
              <option value="gpa-asc">GPA (Lowest)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Students Table */}
      <section className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Details</th>
              <th>Course & Sem</th>
              <th>GPA</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">
                  <div className="empty-state">
                    <p className="empty-title">No student records found</p>
                    <p className="empty-sub">Try adjusting your search criteria or add a new student.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <span className="roll-badge">{student.rollNo}</span>
                  </td>
                  <td>
                    <div className="student-name">{student.name}</div>
                    <div className="student-email">{student.email}</div>
                  </td>
                  <td>
                    <div className="course-text">{student.course}</div>
                    <div className="sem-text">{student.semester} Semester</div>
                  </td>
                  <td>
                    <span
                      className={`gpa-pill ${
                        parseFloat(student.gpa) >= 8.5
                          ? 'gpa-high'
                          : parseFloat(student.gpa) >= 7.0
                          ? 'gpa-mid'
                          : 'gpa-low'
                      }`}
                    >
                      {student.gpa} / 10
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${student.status.toLowerCase()}`}>
                      <span className="status-dot"></span>
                      {student.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleOpenEdit(student)}
                      title="Edit Student"
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => setDeleteTarget(student)}
                      title="Delete Student"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Add New Student' : 'Edit Student Record'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Roll Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. BCA-2024-099"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  />
                  {errors.rollNo && <span className="error-text">{errors.rollNo}</span>}
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. aarav.sharma@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Course</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        {s} Semester
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Current GPA (0.0 - 10.0) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.5"
                    value={formData.gpa}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  />
                  {errors.gpa && <span className="error-text">{errors.gpa}</span>}
                </div>

                <div className="form-group">
                  <label>Enrollment Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {modalMode === 'create' ? 'Create Student' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal-card confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon">⚠️</div>
            <h2>Confirm Student Deletion</h2>
            <p>
              Are you sure you want to remove <strong>{deleteTarget.name}</strong> ({deleteTarget.rollNo})?
            </p>
            <p className="delete-note">This student record will be removed from the active database.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleConfirmDelete}>
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="page-footer">
        <p>&copy; 2026 BCA (Hons.) Practical 10 &bull; Complete CRUD Operations in React with Vite</p>
      </footer>
    </div>
  );
}
