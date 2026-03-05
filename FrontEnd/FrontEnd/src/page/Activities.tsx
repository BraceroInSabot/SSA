import { useState, useEffect } from 'react';
import NavBar from "../components/NavBar/NavBar";
import AsideMenu from '../components/Activity/AsideMenu/AsideMenu';
import MainMenu from '../components/Activity/MainMenu/MainMenu';
import { listCourses } from '../services/CourseCrud';
import { listActivities } from '../services/ActivityCrud';
import { type Course } from '../types/Courses';

function Activities() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [activities, setActivities] = useState<any[]>([]);

    const fetchCourses = async () => {
        try {
            const response = await listCourses();
            setCourses(response);
            
            if (response.length > 0 && !selectedCourseId) {
                setSelectedCourseId(response[0].course_id);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchActivities = async (courseId: string) => {
        try {
            const response = await listActivities(courseId);
            setActivities(response);
        } catch (error) {
            console.error(error);
            setActivities([]);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            fetchActivities(selectedCourseId);
        }
    }, [selectedCourseId]);

    const handleCourseSelect = (courseId: string) => {
        setSelectedCourseId(courseId);
    };

    const handleActivityCreated = () => {
        if (selectedCourseId) {
            fetchActivities(selectedCourseId);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F2F5F7]">
            <NavBar />
            
            <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-10">
                <AsideMenu 
                    courses={courses}
                    selectedCourseId={selectedCourseId}
                    onCourseSelected={handleCourseSelect}
                    onCourseCreated={fetchCourses} 
                />
                
                <MainMenu 
                    activities={activities} 
                    selectedCourseId={selectedCourseId}
                    onActivityCreated={handleActivityCreated}
                /> 
            </div>
        </div>
    );
}

export default Activities;