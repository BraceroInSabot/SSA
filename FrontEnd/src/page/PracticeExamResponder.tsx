import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar';
import { getPracticeExam, submitPracticeExam, logAntiCheat } from '../services/PracticeExamCrud';

const PracticeExamResponder: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [exam, setExam] = useState<any>(null);
    const [responses, setResponses] = useState<any>({});
    const [loading, setLoading] = useState(true);

    // Anti-Cheat tracking
    const blurTimestamp = useRef<number | null>(null);

    useEffect(() => {
        if (!id) return;
        getPracticeExam(id).then(data => {
            setExam(data);
            setLoading(false);
        }).catch(() => {
            alert('Failed to load exam');
            setLoading(false);
        });
    }, [id]);

    useEffect(() => {
        if (!id) return;

        const handleBlur = () => {
            blurTimestamp.current = Date.now();
        };

        const handleFocus = () => {
            if (blurTimestamp.current) {
                const durationSeconds = (Date.now() - blurTimestamp.current) / 1000;
                logAntiCheat(id, durationSeconds).catch(console.error);
                blurTimestamp.current = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleBlur();
            } else {
                handleFocus();
            }
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [id]);

    const handleSubmit = async () => {
        if (!id) return;
        try {
            // Assume we send one main submission or map responses to multiple submissions
            // For simplicity, submit each question response individually mapped to the exam
            for (const questionId of Object.keys(responses)) {
                await submitPracticeExam({
                    practice_exam: id,
                    submission_question: questionId,
                    submission: { response: responses[questionId] }
                });
            }
            alert('Exam submitted successfully!');
            navigate('/bimestres');
        } catch (error) {
            console.error('Error submitting exam', error);
            alert('Failed to submit exam');
        }
    };

    if (loading) return <div>Loading exam...</div>;
    if (!exam) return <div>Exam not found.</div>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <NavBar />
            <div style={{ flex: 1, padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '20px' }}>{exam.name}</h1>
                <p style={{ marginBottom: '40px', color: '#555' }}>{exam.description}</p>
                
                {exam.questions?.map((q: any, index: number) => (
                    <div key={q.question_id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3>Question {index + 1}</h3>
                        <p>{q.question_description}</p>
                        <textarea
                            style={{ width: '100%', minHeight: '100px', marginTop: '10px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            value={responses[q.question_id] || ''}
                            onChange={(e) => setResponses({ ...responses, [q.question_id]: e.target.value })}
                            placeholder="Type your answer here..."
                        />
                    </div>
                ))}
                
                <button 
                    onClick={handleSubmit}
                    style={{ backgroundColor: '#4CAF50', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                >
                    Submit Exam
                </button>
            </div>
        </div>
    );
};

export default PracticeExamResponder;
