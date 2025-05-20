import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { interval, Subscription, firstValueFrom } from 'rxjs';

interface Notification {
  id: string;
  type: string;
  createdAt: string;
  message: string;
  username: string;
  isRead?: boolean;
}

@Component({
  selector: 'app-get-notification',
  imports: [CommonModule],
  templateUrl: './get-notification.component.html',
  styleUrl: './get-notification.component.css'
})
export class GetNotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount: number = 0;
  showDropdown: boolean = false;
  showAllNotifications: boolean = false;
  private pollingSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

  ngOnInit(): void {
    this.fetchNotifications();
    // Poll for new notifications every 30 seconds
    this.pollingSubscription = interval(30000).subscribe(() => {
      this.fetchNotifications();
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  fetchNotifications(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any[]>('https://localhost:7299/api/Account/notifications', { headers })
      .subscribe({
        next: (data) => {
          this.notifications = data
            .map(notification => ({
              ...notification,
              isRead: notification.isRead ?? notification.IsRead ?? notification.is_read ?? notification.read ?? false
            }))
            .sort((a, b) => {
              // Convert dates to timestamps for comparison
              const dateA = new Date(a.createdAt).getTime();
              const dateB = new Date(b.createdAt).getTime();
              // Sort in descending order (newest first)
              return dateB - dateA;
            });
          this.updateUnreadCount();
        },
        error: (error) => {
          console.error('Error fetching notifications:', error);
        }
      });
  }

  updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (!this.showDropdown) {
      this.showAllNotifications = false;
    }
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;
    
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      console.error('No JWT token found');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const encodedId = encodeURIComponent(notification.id);
    const url = `https://localhost:7299/api/Account/markAsRead?id=${encodedId}`;

    this.http.get(url, { 
      headers,
      responseType: 'text'
    }).subscribe({
        next: () => {
          notification.isRead = true;
          this.updateUnreadCount();
          this.fetchNotifications();
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
          notification.isRead = false;
          this.updateUnreadCount();
        }
      });
  }

  markAllAsRead(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      console.error('No JWT token found');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const unreadNotifications = this.notifications.filter(n => !n.isRead);
    const markReadPromises = unreadNotifications.map(notification => {
      const encodedId = encodeURIComponent(notification.id);
      const url = `https://localhost:7299/api/Account/markAsRead?id=${encodedId}`;
      return firstValueFrom(this.http.get(url, { headers, responseType: 'text' }));
    });

    Promise.all(markReadPromises)
      .then(() => {
        this.notifications.forEach(notification => {
          notification.isRead = true;
        });
        this.updateUnreadCount();
        this.fetchNotifications();
      })
      .catch(error => {
        console.error('Error marking all notifications as read:', error);
      });
  }

  getNotificationIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'info':
        return 'fa-solid fa-circle-info';
      case 'alerte':
        return 'fa-solid fa-triangle-exclamation';
      default:
        return 'fa-solid fa-bell';
    }
  }

  getNotificationColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'info':
        return 'text-blue-500';
      case 'alerte':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }

  getNotificationBackground(type: string): string {
    switch (type.toLowerCase()) {
      case 'info':
        return 'bg-blue-50';
      case 'alerte':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'}`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} ${diffInHours === 1 ? 'heure' : 'heures'}`;
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} ${diffInDays === 1 ? 'jour' : 'jours'}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  }

  getNotificationBadgeStyle(type: string): string {
    switch (type.toLowerCase()) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'alerte':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  viewAllNotifications(): void {
    this.showAllNotifications = !this.showAllNotifications;
  }

  deleteNotification(notification: Notification): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      console.error('No JWT token found');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const encodedId = encodeURIComponent(notification.id);
    const url = `https://localhost:7299/api/Account/notification/${encodedId}`;

    this.http.delete(url, { headers })
      .subscribe({
        next: () => {
          // Remove the notification from the local array
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          this.updateUnreadCount();
        },
        error: (error) => {
          console.error('erreur lors de la suppression de notification', error);
        }
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-dropdown') && !target.closest('button')) {
      this.showDropdown = false;
      this.showAllNotifications = false;
    }
  }
}
