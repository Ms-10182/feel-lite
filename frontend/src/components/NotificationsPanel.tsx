import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Notification } from '../types/notification';
import { Heart, MessageCircle, Reply } from 'lucide-react';

export function NotificationsPanel() {
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data;
    },
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart size={20} className="text-red-500" />;
      case 'comment':
        return <MessageCircle size={20} className="text-blue-500" />;
      case 'reply':
        return <Reply size={20} className="text-green-500" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'reply':
        return 'replied to your comment';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-80">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-3 p-2 rounded ${
              notification.read ? 'bg-white' : 'bg-blue-50'
            }`}
          >
            {getNotificationIcon(notification.type)}
            <div>
              <p className="text-sm text-gray-800">
                Someone {getNotificationText(notification)}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(notification.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}