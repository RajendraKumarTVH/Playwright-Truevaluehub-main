import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SidebarModule } from 'primeng/sidebar';
import { MatTabGroup, MatTabLabel, MatTab } from '@angular/material/tabs';

@Component({
  selector: 'app-notification-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, SidebarModule, MatTabGroup, MatTabLabel, MatTab],
  templateUrl: './notification-sidebar.component.html',
  styleUrl: './notification-sidebar.component.scss',
})
export class NotificationSidebarComponent {
  visible = false;
  ignoreNextDocumentClick = false;
  activeTab: 'all' | 'unread' = 'all';
  selectedTabIndex = 0;

  notifications = [
    {
      id: 1,
      title: 'Notification Title',
      description: 'A brief overview of the topic, highlighting key features and benefits. This summary provides essential insights for better understanding.',
      timeAgo: '2 Mins ago',
      unread: true,
      primaryAction: 'Button',
      secondaryAction: 'Button',
    },
    {
      id: 2,
      title: 'Another Notification',
      description: 'This is some dummy text for a second notification. You can replace this with real data later.',
      timeAgo: '5 mins ago',
      unread: true,
      primaryAction: 'View',
      secondaryAction: 'Dismiss',
    },
    {
      id: 3,
      title: 'Old Notification',
      description: 'Older notification example. Marked as read by default to show both states.',
      timeAgo: '1 hour ago',
      unread: false,
      primaryAction: 'Open',
      secondaryAction: 'Details',
    },
  ];
  open(): void {
    this.visible = true;
    this.ignoreNextDocumentClick = true;
  }

  close(): void {
    this.visible = false;
  }
  markAllAsRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, unread: false }));
  }

  markAsRead(id: number): void {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n));
  }

  delete(id: number): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => n.unread).length;
  }

  onTabIndexChange(index: number): void {
    this.selectedTabIndex = index;
    this.activeTab = index === 0 ? 'all' : 'unread';
  }

  get filteredNotifications() {
    return this.activeTab === 'unread' ? this.notifications.filter((n) => n.unread) : this.notifications;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.visible) return;

    if (this.ignoreNextDocumentClick) {
      this.ignoreNextDocumentClick = false;
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!target) return;

    // If click is inside an Angular Material menu overlay, do nothing
    if (target.closest('.cdk-overlay-pane')) {
      return;
    }

    // Any other click (outside sidebar + not in menu) closes the sidebar
    this.close();
  }
}
