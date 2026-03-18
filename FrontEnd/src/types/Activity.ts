interface AttachedFile {
    attached_files_id: string;
    file: string; 
}

interface Activity {
    activity_id: string;
    name: string;
    activity_type: 'EXERCISE' | 'TEST' | 'PROJECT';
    total_grade: number;
    has_submission: boolean
    to_be_launched: string; // ISO string
    lauched_at: string; // ISO string
    due_date: string; // ISO string
    description: string;
    is_active: boolean;
    course: string; // course ID
    attached_files: AttachedFile[];
    status: 'DRAFT' | 'PUB' | 'ARC';
    has_student_submission: boolean;
    teacher_submission: []
}

interface QuestionOption {
    id: string;
    text: string;
    is_correct: boolean;
}

interface QuestionDefinition {
    question_id?: string;
    question_description: string;
    question_type: 'MC' | 'UC' | 'TF' | 'SA' | 'ES' | 'FL';
    question_expected_result: number;
    options_payload: QuestionOption[];
    question_response?: any;
    question_options?: any;

}

export type { Activity, AttachedFile, QuestionOption, QuestionDefinition };