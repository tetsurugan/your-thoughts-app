import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditTask() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tasks, updateTask } = useTasks();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setDueDate(task.dueDate || '');
        } else {
            navigate('/');
        }
    }, [id, tasks, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (id && title) {
            updateTask(id, {
                title,
                description,
                dueDate
            });
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Edit Task</h1>
                </div>
            </header>

            <main className="flex-1 p-4">
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Task Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-lg border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                            placeholder="What needs to be done?"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                            placeholder="Add details..."
                        />
                    </div>

                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date (Optional)
                        </label>
                        <input
                            type="date"
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center items-center gap-2 bg-primary-600 text-white py-3 px-4 rounded-md font-semibold text-lg hover:bg-primary-700 transition-colors shadow-sm"
                    >
                        <Save className="w-5 h-5" />
                        Save Changes
                    </button>
                </form>
            </main>
        </div>
    );
}
