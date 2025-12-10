import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TagType {
    id: string;
    name: string;
    color?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const TagManager = () => {
    const { token } = useAuth();
    const [tags, setTags] = useState<TagType[]>([]);
    const [newTagName, setNewTagName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTags = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/tags`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch tags');
            const data = await res.json();
            setTags(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, [token]);

    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        try {
            const res = await fetch(`${API_BASE}/api/tags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newTagName.trim() })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create tag');
            }

            const newTag = await res.json();
            setTags([...tags, newTag]);
            setNewTagName('');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteTag = async (id: string) => {
        if (!window.confirm('Delete this tag?')) return;

        try {
            const res = await fetch(`${API_BASE}/api/tags/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete tag');
            setTags(tags.filter(t => t.id !== id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div className="text-center text-slate-500 py-4">Loading tags...</div>;
    if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

    return (
        <div className="space-y-4">
            {/* Add Tag Form */}
            <form onSubmit={handleAddTag} className="flex gap-2">
                <input
                    type="text"
                    placeholder="New tag name..."
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
                <button
                    type="submit"
                    disabled={!newTagName.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </form>

            {/* Tag List */}
            <div className="space-y-2">
                {tags.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No tags yet. Add some above!</p>
                ) : (
                    tags.map(tag => (
                        <div
                            key={tag.id}
                            className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-slate-700 dark:text-slate-200">{tag.name}</span>
                            </div>
                            <button
                                onClick={() => handleDeleteTag(tag.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
