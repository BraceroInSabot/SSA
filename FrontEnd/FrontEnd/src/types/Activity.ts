interface AttachedFile {
    attached_files_id: string;
    file: string; 
}

interface Activity {
    activity_id: string;
    name: string;
    total_grade: Number;
    has_submission: boolean
    to_be_launched: string; // ISO string
    lauched_at: string; // ISO string
    due_date: string; // ISO string
    description: string;
    is_active: boolean;
    course: string; // course ID
    attached_files: AttachedFile[];
}

export type { Activity, AttachedFile };