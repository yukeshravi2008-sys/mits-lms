import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Trash2, Plus, FileText, Upload } from 'lucide-react';

interface Material {
    id: string;
    unit_id: string;
    title: string;
    pdf_url: string;
    type: 'material' | 'mocktest';
    created_at: string;
    units?: {
        title: string;
        subjects?: {
            name: string;
            batches?: { name: string }[];
        }[];
    };
}

interface Unit {
    id: string;
    title: string;
    subjects?: {
        name: string;
        batches?: { name: string }[];
    }[];
}

export default function Materials() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [title, setTitle] = useState('');
    const [selectedUnitId, setSelectedUnitId] = useState('');
    const [type, setType] = useState<'material' | 'mocktest'>('material');
    const [file, setFile] = useState<File | null>(null);

    const fetchData = async () => {
        setLoading(true);

        const [materialsRes, unitsRes] = await Promise.all([
            supabase
                .from('materials')
                .select('*, units(title, subjects(name, batches(name)))')
                .order('created_at', { ascending: false }),

            supabase
                .from('units')
                .select('id, title, subjects(name, batches(name))')
                .order('created_at', { ascending: false })
        ]);

        if (!materialsRes.error) setMaterials(materialsRes.data || []);
        if (!unitsRes.error) setUnits(unitsRes.data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            setFile(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !selectedUnitId || !file) return;

        setUploading(true);

        try {
            const unit = units.find(u => u.id === selectedUnitId);

            const subject = unit?.subjects?.[0];
            const batch = subject?.batches?.[0];

            const batchName = batch?.name || 'unknown-batch';
            const subjectName = subject?.name || 'unknown-subject';
            const unitName = unit?.title || 'unknown-unit';

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const folderPath = `${type}s`;

            const sanitize = (name: string) =>
                name.toLowerCase().replace(/[^a-z0-9]/g, '-');

            const filePath = `${sanitize(batchName)}/${sanitize(subjectName)}/${sanitize(unitName)}/${folderPath}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('mits-materials')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('mits-materials')
                .getPublicUrl(filePath);

            const { error: insertError } = await supabase
                .from('materials')
                .insert([{
                    title,
                    unit_id: selectedUnitId,
                    type,
                    pdf_url: publicUrl
                }]);

            if (insertError) throw insertError;

            setTitle('');
            setSelectedUnitId('');
            setFile(null);
            setType('material');
            setShowModal(false);
            fetchData();

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Check storage bucket and policies.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this file?')) {
            await supabase.from('materials').delete().eq('id', id);
            fetchData();
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-6">Materials & Tests</h1>

            <Button onClick={() => setShowModal(true)}>
                <Plus className="mr-2 h-4 w-4" /> Upload Material
            </Button>

            {loading ? (
                <p className="mt-6">Loading...</p>
            ) : (
                <div className="mt-6 space-y-3">
                    {materials.map(mat => (
                        <div key={mat.id} className="flex justify-between items-center border p-3 rounded">
                            <a href={mat.pdf_url} target="_blank" rel="noreferrer">
                                {mat.title}
                            </a>
                            <button onClick={() => handleDelete(mat.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}