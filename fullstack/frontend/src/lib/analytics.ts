'use client';

import { useEffect } from 'react';

// Google Analytics 配置
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// 页面访问跟踪
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// 事件跟踪
export const event = (action: string, parameters: any) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, parameters);
  }
};

// Google Analytics 组件
export function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_TRACKING_ID) return;

    // 加载 Google Analytics 脚本
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_TRACKING_ID}');
    `;
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  if (!GA_TRACKING_ID) return null;

  return null;
}

// 跟踪用户交互事件
export const trackEvent = {
  // 文章相关
  viewPost: (postId: string, title: string) => {
    event('view_item', {
      item_id: postId,
      item_name: title,
      item_category: 'post'
    });
  },

  likePost: (postId: string, title: string) => {
    event('like', {
      item_id: postId,
      item_name: title,
      item_category: 'post'
    });
  },

  sharePost: (postId: string, title: string, method: string) => {
    event('share', {
      content_type: 'post',
      item_id: postId,
      item_name: title,
      method: method
    });
  },

  // 搜索相关
  search: (searchTerm: string, resultCount: number) => {
    event('search', {
      search_term: searchTerm,
      result_count: resultCount
    });
  },

  // 用户行为
  signup: (method: string) => {
    event('sign_up', {
      method: method
    });
  },

  login: (method: string) => {
    event('login', {
      method: method
    });
  },

  // 评论相关
  addComment: (postId: string) => {
    event('engagement', {
      engagement_type: 'comment',
      item_id: postId
    });
  },

  // 页面停留时间
  timeOnPage: (path: string, timeInSeconds: number) => {
    event('page_engagement', {
      page_path: path,
      engagement_time_msec: timeInSeconds * 1000
    });
  }
};