// Service Worker for Task Reminder System
const CACHE_NAME = 'task-reminder-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/xlsx.full.min.js',
    '/manifest.json'
];

// 安装Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// 激活Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 拦截网络请求，实现离线功能
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 如果缓存中有响应，返回缓存的响应
                if (response) {
                    return response;
                }
                
                // 否则尝试从网络获取
                return fetch(event.request).then(response => {
                    // 检查响应是否有效
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // 克隆响应
                    const responseToCache = response.clone();
                    
                    // 将响应添加到缓存
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
    );
});

// 处理推送通知
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || '您有新的任务提醒',
            icon: data.icon || '/favicon.ico',
            badge: data.badge || '/favicon.ico',
            tag: data.tag || 'task-reminder',
            requireInteraction: true,
            actions: data.actions || [
                {
                    action: 'confirm',
                    title: '确认',
                    icon: '/favicon.ico'
                },
                {
                    action: 'delay',
                    title: '5分钟后提醒',
                    icon: '/favicon.ico'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || '任务提醒', options)
        );
    }
});

// 处理通知点击
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'confirm') {
        // 处理确认操作
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'delay') {
        // 处理延迟操作
        event.waitUntil(
            clients.openWindow('/')
        );
    } else {
        // 默认点击行为
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// 处理后台同步
self.addEventListener('sync', event => {
    if (event.tag === 'task-reminder-sync') {
        event.waitUntil(
            // 执行后台同步逻辑
            console.log('Background sync for task reminders')
        );
    }
});

// 处理消息
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
