import { useState } from 'react';
import { createRoom } from '../api/rooms';
import { toFriendlyError } from '../utils/helpers';
import { useToast } from './ToastProvider';

const categories = ['games', 'general', 'tech', 'music', 'sports'];

type CreateRoomModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
};

const CreateRoomModal = ({ isOpen, onClose, onCreated }: CreateRoomModalProps) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { pushToast } = useToast();

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 3) {
      nextErrors.name = 'Name must be at least 3 characters.';
    }
    if (description.trim() && description.trim().length < 5) {
      nextErrors.description = 'Description must be at least 5 characters when provided.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const reset = () => {
    setName('');
    setCategory(categories[0]);
    setDescription('');
    setErrors({});
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await createRoom({
        name: name.trim(),
        category,
        description: description.trim() || undefined,
      });
      pushToast('Room created successfully', 'success');
      reset();
      onClose();
      await onCreated();
    } catch (error) {
      pushToast(toFriendlyError(error, 'Could not create room'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-soft">
        <h3 className="mb-4 text-xl font-semibold text-slate-900">Create room</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
            <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description (optional)</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {errors.description && <p className="mt-1 text-sm text-rose-600">{errors.description}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoomModal;
