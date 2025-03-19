import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Send } from 'lucide-react';

export function CreatePost() {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const createPost = useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post('/posts', { content });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setContent('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createPost.mutate(content);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
      />
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={!content.trim() || createPost.isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50"
        >
          <Send size={20} />
          Post
        </button>
      </div>
    </form>
  );
}