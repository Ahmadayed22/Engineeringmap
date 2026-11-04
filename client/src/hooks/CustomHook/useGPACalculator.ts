import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { GRADE_POINTS, GRADES } from '@features/progress/gpa';

// One grade scale for the whole app (also used for the GPA computed from saved marks).
const gradePoints = GRADE_POINTS;
const grades = GRADES;

interface Course {
  subject: string;
  hours: number;
  grade: string;
}

interface RepeatedCourse {
  subject: string;
  hours: number;
  newGrade: string;
  oldGrade: string;
}

const useGPACalculator = () => {
  const oldHoursRef = useRef<number>(0);
  const oldGPARef = useRef<number>(0);
  const semesterCoursesRef = useRef<Course[]>(
    Array(10).fill({ subject: '', hours: 0, grade: 'F' })
  );
  const repeatedCoursesRef = useRef<RepeatedCourse[]>(
    Array(3).fill({ subject: '', hours: 0, newGrade: 'F', oldGrade: 'F' })
  );

  const [, forceUpdate] = useState({});

  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  const updateOldHours = useCallback((value: number) => {
    oldHoursRef.current = value;
  }, []);

  const updateOldGPA = useCallback((value: number) => {
    oldGPARef.current = value;
  }, []);

  const updateSemesterCourse = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (index: number, field: keyof Course, value: any) => {
      semesterCoursesRef.current[index] = {
        ...semesterCoursesRef.current[index],
        [field]: value,
      };
    },
    []
  );

  const updateRepeatedCourse = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (index: number, field: keyof RepeatedCourse, value: any) => {
      repeatedCoursesRef.current[index] = {
        ...repeatedCoursesRef.current[index],
        [field]: value,
      };
    },
    []
  );

  const calculateGPA = useCallback(() => {
    let totalPoints = oldHoursRef.current * oldGPARef.current;
    let totalHours = oldHoursRef.current;

    // Add semester courses
    semesterCoursesRef.current.forEach((c) => {
      if (c.hours > 0) {
        totalPoints += c.hours * gradePoints[c.grade];
        totalHours += c.hours;
      }
    });

    // Replace repeated courses
    repeatedCoursesRef.current.forEach((c) => {
      if (c.hours > 0) {
        totalPoints -= c.hours * gradePoints[c.oldGrade];
        totalPoints += c.hours * gradePoints[c.newGrade];
      }
    });

    const newGPA = totalHours > 0 ? totalPoints / totalHours : 0;
    const finalResult = {
      gpa: parseFloat(newGPA.toFixed(2)),
      hours: totalHours,
    };

    toast.success(
      `New GPA: ${finalResult.gpa} | Total Hours: ${finalResult.hours}`
    );

    return finalResult;
  }, []);

  return {
    // Data
    semesterCourses: semesterCoursesRef.current,
    repeatedCourses: repeatedCoursesRef.current,
    grades,
    gradePoints,

    // Update functions
    updateOldHours,
    updateOldGPA,
    updateSemesterCourse,
    updateRepeatedCourse,

    // Actions
    calculateGPA,
    forceUpdate: triggerUpdate,
  };
};

export default useGPACalculator;
