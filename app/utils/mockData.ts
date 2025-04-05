import { Student } from "@/types/student";

export const generateMockData = (count: number): Student[] => {
  const students: Student[] = [];
  const names = [
    "Alex Johnson", "Sarah Williams", "Michael Brown", "Emily Davis",
    "James Wilson", "Emma Taylor", "Daniel Anderson", "Olivia Martinez",
    "William Thomas", "Sophia Garcia"
  ];
  
  for (let i = 0; i < count; i++) {
    students.push({
      id: `student-${i}`,
      name: names[i % names.length],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      points: Math.floor(Math.random() * 1000),
      previousRank: null,
      currentRank: i + 1,
      rankChange: null
    });
  }
  
  return students.sort((a, b) => b.points - a.points);
};

export const simulatePointChange = (students: Student[]): Student[] => {
  const updatedStudents = students.map(student => {
    const pointChange = Math.floor(Math.random() * 20) - 10; // -10 to +10
    const newPoints = Math.max(0, student.points + pointChange);
    
    return {
      ...student,
      points: newPoints,
      previousRank: student.currentRank || null
    };
  });
  
  // Sort by points and update ranks
  const sortedStudents = updatedStudents.sort((a, b) => b.points - a.points);
  
  return sortedStudents.map((student, index) => {
    const newRank = index + 1;
    let rankChange: 'up' | 'down' | 'same' | null = null;
    
    if (student.previousRank !== null) {
      if (newRank < student.previousRank) {
        rankChange = 'up';
      } else if (newRank > student.previousRank) {
        rankChange = 'down';
      } else {
        rankChange = 'same';
      }
    }
    
    return {
      ...student,
      currentRank: newRank,
      rankChange
    };
  });
}; 